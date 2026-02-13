import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // Get all admin users
        const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
        
        if (admins.length === 0) {
            // Fallback to environment variable
            return Response.json({ 
                markup: parseFloat(Deno.env.get('FLIGHT_MARKUP_PERCENTAGE') || '0') 
            });
        }

        // Use the first admin's markup setting
        const markup = admins[0].markup_percentage ?? parseFloat(Deno.env.get('FLIGHT_MARKUP_PERCENTAGE') || '0');
        
        return Response.json({ markup });

    } catch (error) {
        console.error('Get admin markup error:', error);
        // Fallback to environment variable
        return Response.json({ 
            markup: parseFloat(Deno.env.get('FLIGHT_MARKUP_PERCENTAGE') || '0') 
        });
    }
});