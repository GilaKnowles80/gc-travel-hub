import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        // Admin only
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { supplierPaymentId, paymentProof } = await req.json();

        // Get supplier payment record
        const supplierPayment = await base44.asServiceRole.entities.SupplierPayment.filter({ 
            id: supplierPaymentId 
        });

        if (!supplierPayment || supplierPayment.length === 0) {
            return Response.json({ error: 'Supplier payment not found' }, { status: 404 });
        }

        const payment = supplierPayment[0];

        // Get bank account details
        let bankDetails = null;
        if (payment.bank_account_id) {
            const accounts = await base44.asServiceRole.entities.SupplierBankAccount.filter({ 
                id: payment.bank_account_id 
            });
            bankDetails = accounts[0];
        }

        // Update payment status
        await base44.asServiceRole.entities.SupplierPayment.update(supplierPaymentId, {
            amount_paid: payment.amount_due,
            payment_status: 'paid',
            payment_date: new Date().toISOString(),
            payment_proof_url: paymentProof || null,
            notes: payment.notes + ` | Paid on ${new Date().toLocaleDateString()}`
        });

        // Send confirmation email to admin
        await base44.asServiceRole.integrations.Core.SendEmail({
            to: 'gctravelandtours2021@gmail.com',
            subject: `Supplier Payment Confirmed - ${payment.supplier_name}`,
            body: `
                <h3>Supplier Payment Processed</h3>
                <p><strong>Supplier:</strong> ${payment.supplier_name}</p>
                <p><strong>Amount Paid:</strong> ₱${payment.amount_due.toLocaleString()}</p>
                <p><strong>Booking ID:</strong> ${payment.booking_id}</p>
                <p><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</p>
                ${bankDetails ? `
                    <p><strong>Paid to:</strong> ${bankDetails.bank_name} - ${bankDetails.account_number}</p>
                ` : ''}
                <p>Payment marked as completed in the system.</p>
            `
        });

        return Response.json({
            success: true,
            message: 'Supplier payment marked as paid',
            payment: {
                supplier: payment.supplier_name,
                amount: payment.amount_due,
                status: 'paid'
            }
        });

    } catch (error) {
        console.error('Auto-pay supplier error:', error);
        return Response.json({ 
            error: error.message || 'Failed to process supplier payment' 
        }, { status: 500 });
    }
});