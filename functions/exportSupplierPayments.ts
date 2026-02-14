import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { startDate, endDate, supplier, status } = await req.json();

    // Fetch all supplier payments
    let payments = await base44.asServiceRole.entities.SupplierPayment.list('-created_date', 1000);

    // Apply filters
    if (startDate) {
      payments = payments.filter(p => new Date(p.created_date) >= new Date(startDate));
    }
    if (endDate) {
      payments = payments.filter(p => new Date(p.created_date) <= new Date(endDate));
    }
    if (supplier && supplier !== 'all') {
      payments = payments.filter(p => p.supplier === supplier);
    }
    if (status && status !== 'all') {
      payments = payments.filter(p => p.payment_status === status);
    }

    // Calculate summary
    const summary = {
      totalPayments: payments.length,
      totalSupplierAmount: payments.reduce((sum, p) => sum + (p.supplier_amount || 0), 0),
      totalCustomerAmount: payments.reduce((sum, p) => sum + (p.customer_paid_amount || 0), 0),
      totalMarkup: payments.reduce((sum, p) => sum + (p.markup_retained || 0), 0),
      pendingAmount: payments.filter(p => p.payment_status === 'pending').reduce((sum, p) => sum + (p.supplier_amount || 0), 0),
      paidAmount: payments.filter(p => p.payment_status === 'paid').reduce((sum, p) => sum + (p.supplier_amount || 0), 0),
    };

    // Generate CSV content
    const csvHeader = [
      'Date',
      'Booking ID',
      'Booking Type',
      'Supplier',
      'Customer Paid',
      'Supplier Amount',
      'Markup Retained',
      'Status',
      'Payment Method',
      'Payment Date',
      'Payment Reference',
      'Notes'
    ].join(',');

    const csvRows = payments.map(payment => [
      new Date(payment.created_date).toLocaleDateString(),
      payment.booking_id || '',
      payment.booking_type || '',
      payment.supplier || '',
      payment.customer_paid_amount || 0,
      payment.supplier_amount || 0,
      payment.markup_retained || 0,
      payment.payment_status || '',
      payment.payment_method || '',
      payment.payment_date || '',
      payment.payment_reference || '',
      (payment.notes || '').replace(/,/g, ';')
    ].join(','));

    const csvContent = [
      csvHeader,
      ...csvRows,
      '',
      '=== SUMMARY ===',
      `Total Payments,${summary.totalPayments}`,
      `Total Customer Paid,${summary.totalCustomerAmount}`,
      `Total to Suppliers,${summary.totalSupplierAmount}`,
      `Total Markup Retained,${summary.totalMarkup}`,
      `Pending Amount,${summary.pendingAmount}`,
      `Paid Amount,${summary.paidAmount}`
    ].join('\n');

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=supplier-payouts-${new Date().toISOString().split('T')[0]}.csv`
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});