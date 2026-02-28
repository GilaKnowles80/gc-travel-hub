import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payment_split_id } = await req.json();

    // Get payment split
    const paymentSplit = await base44.entities.PaymentSplit.filter({
      id: payment_split_id,
    });

    if (!paymentSplit.length) {
      return Response.json({ error: 'Payment split not found' }, { status: 404 });
    }

    const split = paymentSplit[0];

    // Get user's bank account
    const bankAccounts = await base44.entities.BankAccount.filter({
      created_by: user.email,
      is_default: true,
    });

    if (!bankAccounts.length) {
      throw new Error('No default bank account configured for transfers');
    }

    const bankAccount = bankAccounts[0];

    // In production, integrate with bank API (e.g., PayMongo, Instapay)
    console.log(`Transferring ${split.markup_amount} ${split.currency} to ${bankAccount.account_holder_name}`);
    console.log(`Bank: ${bankAccount.bank_name}, Account: ${bankAccount.account_number}`);

    // Simulate successful transfer
    const transferReference = `TRANSFER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Update payment split with transfer details
    await base44.entities.PaymentSplit.update(split.id, {
      bank_transfer_status: 'completed',
      bank_transfer_reference: transferReference,
    });

    // Send confirmation email to admin
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `Markup Transfer Completed - ${split.markup_amount} ${split.currency}`,
      body: `Your markup of ${split.markup_amount} ${split.currency} from booking ${split.booking_id} has been transferred to your bank account.\n\nTransfer Reference: ${transferReference}`,
    });

    return Response.json({
      success: true,
      transfer_reference: transferReference,
      message: 'Markup transferred to your bank account',
    });
  } catch (error) {
    console.error('Error transferring markup:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});