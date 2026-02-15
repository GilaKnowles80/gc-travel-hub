import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
        }

        const { password } = await req.json();
        const masterPassword = Deno.env.get("ADMIN_MASTER_PASSWORD");

        if (!masterPassword) {
            return Response.json({ 
                error: 'Master password not configured. Please set ADMIN_MASTER_PASSWORD in environment variables.' 
            }, { status: 500 });
        }

        const isValid = password === masterPassword;

        return Response.json({ 
            success: isValid,
            message: isValid ? 'Access granted' : 'Invalid password'
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});