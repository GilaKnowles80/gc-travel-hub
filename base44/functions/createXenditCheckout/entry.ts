import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, currency, description, booking_ref, success_url, failure_url, customer } = await req.json();

    if (!amount || !description) {
      return Response.json({ error: 'amount and description are required' }, { status: 400 });
    }

    const secretKey = Deno.env.get('XENDIT_SECRET_KEY');
    const authHeader = 'Basic ' + btoa(secretKey + ':');

    const payload = {
      external_id: booking_ref || `TRP-${Date.now()}`,
      amount: Math.round(amount),
      currency: currency || 'PHP',
      description,
      success_redirect_url: success_url || `${req.headers.get('origin')}/PaymentSuccess`,
      failure_redirect_url: failure_url || `${req.headers.get('origin')}/PaymentCancelled`,
      customer: customer || {
        given_names: user.full_name || 'Customer',
        email: user.email,
      },
      customer_notification_preference: {
        invoice_paid: ['email'],
      },
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        booking_ref: booking_ref || '',
        user_email: user.email,
      },
    };

    const response = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Xendit error:', data);
      return Response.json({ error: data.message || 'Xendit request failed', details: data }, { status: response.status });
    }

    console.log('Xendit invoice created:', data.id, 'for', user.email, 'amount:', amount);

    return Response.json({
      invoice_id: data.id,
      invoice_url: data.invoice_url,
      status: data.status,
      external_id: data.external_id,
      amount: data.amount,
      expiry_date: data.expiry_date,
    });
  } catch (error) {
    console.error('createXenditCheckout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});