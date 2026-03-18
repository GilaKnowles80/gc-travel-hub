import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Find supplier
    const suppliers = await base44.asServiceRole.entities.Supplier.filter({ email }, '-created_date', 1);

    if (suppliers.length === 0) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const supplier = suppliers[0];

    if (supplier.status !== 'active') {
      return Response.json({ error: 'Account is inactive or suspended' }, { status: 403 });
    }

    // Simple password verification (in production, use bcrypt)
    if (supplier.password_hash !== password) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Update last login
    await base44.asServiceRole.entities.Supplier.update(supplier.id, {
      last_login: new Date().toISOString()
    });

    // Log audit
    await base44.asServiceRole.functions.invoke('auditLog', {
      action: 'login',
      entity_type: 'Supplier',
      entity_id: supplier.id,
      severity: 'medium'
    }).catch(console.error);

    return Response.json({
      success: true,
      supplier: {
        id: supplier.id,
        company_name: supplier.company_name,
        supplier_type: supplier.supplier_type,
        email: supplier.email
      }
    });

  } catch (error) {
    console.error('Supplier login error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});