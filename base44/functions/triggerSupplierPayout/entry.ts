import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { paymentId } = await req.json();

        if (!paymentId) {
            return Response.json({ error: 'Payment ID required' }, { status: 400 });
        }

        // Get payment details
        const payments = await base44.asServiceRole.entities.SupplierPayment.filter({ id: paymentId });
        const payment = payments[0];

        if (!payment) {
            return Response.json({ error: 'Payment not found' }, { status: 404 });
        }

        if (payment.payment_status !== 'pending') {
            return Response.json({ error: 'Payment already processed' }, { status: 400 });
        }

        // Get supplier bank account
        const supplierAccounts = await base44.asServiceRole.entities.SupplierBankAccount.filter({
            supplier_name: payment.supplier,
            is_active: true
        });

        if (supplierAccounts.length === 0) {
            return Response.json({ 
                error: 'No active bank account configured for this supplier. Please add supplier bank details first.' 
            }, { status: 400 });
        }

        const supplierAccount = supplierAccounts[0];

        // Update status to processing
        await base44.asServiceRole.entities.SupplierPayment.update(paymentId, {
            payment_status: 'processing',
            payout_status: 'processing'
        });

        try {
            // Create PayMongo payout
            const paymongoApiKey = Deno.env.get('PayMongo_API_KEY');
            
            if (!paymongoApiKey) {
                throw new Error('PayMongo API key not configured');
            }

            const payoutResponse = await fetch('https://api.paymongo.com/v1/payouts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${btoa(paymongoApiKey + ':')}`
                },
                body: JSON.stringify({
                    data: {
                        attributes: {
                            amount: Math.round(payment.supplier_amount * 100), // Convert to centavos
                            currency: 'PHP',
                            recipient: {
                                name: supplierAccount.account_name,
                                account_number: supplierAccount.account_number,
                                bank_code: supplierAccount.bank_code
                            },
                            description: `Payment for ${payment.booking_type} booking - ${payment.booking_id.slice(-8).toUpperCase()}`,
                            remarks: `Supplier payment for booking ${payment.booking_id}`
                        }
                    }
                })
            });

            const payoutData = await payoutResponse.json();

            if (!payoutResponse.ok) {
                throw new Error(payoutData.errors?.[0]?.detail || 'Payout creation failed');
            }

            const payout = payoutData.data;

            // Update payment with payout details
            await base44.asServiceRole.entities.SupplierPayment.update(paymentId, {
                payment_status: payout.attributes.status === 'completed' ? 'paid' : 'processing',
                payment_method: 'paymongo_payout',
                payout_id: payout.id,
                payout_status: payout.attributes.status,
                payment_reference: payout.id,
                payment_date: new Date().toISOString().split('T')[0],
                supplier_bank_account: supplierAccount.account_number,
                supplier_bank_code: supplierAccount.bank_code
            });

            // Notify customer about supplier payment
            const entityMap = {
                flight: 'FlightBooking',
                hotel: 'HotelBooking',
                tour: 'Booking',
                ferry: 'FerryBooking',
                bus: 'BusBooking',
                car_rental: 'CarRentalBooking',
            };
            
            const bookings = await base44.asServiceRole.entities[entityMap[payment.booking_type]].filter({ 
                id: payment.booking_id 
            });
            
            if (bookings[0]) {
                const customerEmail = bookings[0].passenger_email || bookings[0].customer_email || 
                                     bookings[0].guest_email || bookings[0].driver_email;
                
                await base44.asServiceRole.functions.invoke('sendNotification', {
                    userEmail: customerEmail,
                    title: "Booking Confirmed with Supplier",
                    message: "Your booking has been forwarded to our supplier and is being processed. You'll receive updates soon.",
                    type: "supplier_payment_done",
                    bookingId: payment.booking_id,
                    link: "/my-bookings"
                });
            }

            return Response.json({ 
                success: true,
                payout: {
                    id: payout.id,
                    status: payout.attributes.status,
                    amount: payment.supplier_amount,
                    currency: payout.attributes.currency
                }
            });

        } catch (payoutError) {
            console.error('PayMongo payout error:', payoutError);
            
            // Update payment with error
            await base44.asServiceRole.entities.SupplierPayment.update(paymentId, {
                payment_status: 'failed',
                payout_status: 'failed',
                payout_error: payoutError.message
            });

            return Response.json({ 
                error: 'Payout failed: ' + payoutError.message,
                details: payoutError.message
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Error triggering payout:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});