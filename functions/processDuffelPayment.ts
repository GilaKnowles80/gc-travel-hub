import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.3.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { booking_id, booking_type, supplier_cost, markup_amount, total_amount } = await req.json();

    // Create payment split record
    const paymentSplit = await base44.entities.PaymentSplit.create({
      booking_id,
      booking_type,
      total_amount,
      supplier_cost,
      markup_amount,
      supplier: 'duffel',
      supplier_payment_status: 'processing',
      bank_transfer_status: 'pending',
      currency: 'PHP',
    });

    // Step 1: Transfer to Duffel account (simulate API call)
    // In production, call Duffel API to process payment
    console.log(`Processing Duffel payment: ${supplier_cost} USD for booking ${booking_id}`);

    // Simulate successful supplier payment
    await base44.entities.PaymentSplit.update(paymentSplit.id, {
      supplier_payment_status: 'completed',
      supplier_payment_reference: `DUFFEL-${Date.now()}`,
    });

    // Step 2: Queue bank transfer for markup (automatic)
    // This will be picked up by autoTransferMarkup function
    console.log(`Queuing bank transfer: ${markup_amount} PHP to user account`);

    await base44.entities.PaymentSplit.update(paymentSplit.id, {
      bank_transfer_status: 'processing',
    });

    // Trigger bank transfer via webhook/automation
    try {
      await base44.functions.invoke('autoTransferMarkup', {
        payment_split_id: paymentSplit.id,
      });
    } catch (err) {
      console.error('Bank transfer failed:', err);
    }

    return Response.json({
      success: true,
      payment_split_id: paymentSplit.id,
      message: 'Payment processed and bank transfer initiated',
    });
  } catch (error) {
    console.error('Error processing Duffel payment:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});