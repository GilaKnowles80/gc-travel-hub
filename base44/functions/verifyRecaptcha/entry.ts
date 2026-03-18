import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { token } = await req.json();
    
    if (!token) {
      return Response.json({ success: false, error: 'No token provided' }, { status: 400 });
    }

    const secretKey = Deno.env.get('RECAPTCHA_SECRET_KEY');
    
    const verifyResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secretKey}&response=${token}`
    });

    const data = await verifyResponse.json();

    // reCAPTCHA v3 returns a score 0.0 - 1.0
    // 0.0 is very likely a bot, 1.0 is very likely a human
    if (data.success && data.score >= 0.5) {
      return Response.json({ 
        success: true, 
        score: data.score 
      });
    }

    return Response.json({ 
      success: false, 
      score: data.score,
      error: 'Low reCAPTCHA score - possible bot detected'
    }, { status: 403 });

  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});