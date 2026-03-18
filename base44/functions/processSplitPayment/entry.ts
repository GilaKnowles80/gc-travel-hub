import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { bookingId, bookingType, totalAmount, supplier, supplierCost } = await req.json();

        // Calculate markup/commission
        const markup = totalAmount - supplierCost;
        const markupPercentage = ((markup / totalAmount) * 100).toFixed(2);

        // Get supplier bank account
        const supplierAccounts = await base44.asServiceRole.entities.SupplierBankAccount.filter({ 
            supplier_name: supplier 
        });
        const supplierBankAccount = supplierAccounts[0];

        // Create supplier payment record
        const supplierPayment = await base44.asServiceRole.entities.SupplierPayment.create({
            booking_id: bookingId,
            booking_type: bookingType,
            supplier_name: supplier,
            amount_due: supplierCost,
            amount_paid: 0,
            markup_amount: markup,
            markup_percentage: parseFloat(markupPercentage),
            payment_status: 'pending',
            payment_method: 'bank_transfer',
            bank_account_id: supplierBankAccount?.id || null,
            notes: `Split payment - Customer paid ₱${totalAmount.toLocaleString()}, Supplier gets ₱${supplierCost.toLocaleString()}, Markup ₱${markup.toLocaleString()}`
        });

        // Send notification to admin about pending supplier payment
        await base44.asServiceRole.integrations.Core.SendEmail({
            to: 'gctravelandtours2021@gmail.com',
            subject: `Supplier Payment Due - ${supplier}`,
            body: `
                <h3>New Supplier Payment Required</h3>
                <p><strong>Booking ID:</strong> ${bookingId}</p>
                <p><strong>Booking Type:</strong> ${bookingType}</p>
                <p><strong>Supplier:</strong> ${supplier}</p>
                <p><strong>Amount Due to Supplier:</strong> ₱${supplierCost.toLocaleString()}</p>
                <p><strong>Your Markup:</strong> ₱${markup.toLocaleString()} (${markupPercentage}%)</p>
                <p><strong>Total Received:</strong> ₱${totalAmount.toLocaleString()}</p>
                ${supplierBankAccount ? `
                    <hr>
                    <h4>Supplier Bank Details:</h4>
                    <p><strong>Bank:</strong> ${supplierBankAccount.bank_name}</p>
                    <p><strong>Account Name:</strong> ${supplierBankAccount.account_name}</p>
                    <p><strong>Account Number:</strong> ${supplierBankAccount.account_number}</p>
                ` : '<p><strong>Note:</strong> Supplier bank account not found. Please add it in Admin > Supplier Bank Accounts.</p>'}
                <p>Please process this payment within 24-48 hours.</p>
            `
        });

        return Response.json({
            success: true,
            supplierPayment,
            split: {
                totalReceived: totalAmount,
                supplierAmount: supplierCost,
                yourMarkup: markup,
                markupPercentage: parseFloat(markupPercentage)
            }
        });

    } catch (error) {
        console.error('Split payment error:', error);
        return Response.json({ 
            error: error.message || 'Failed to process split payment' 
        }, { status: 500 });
    }
});