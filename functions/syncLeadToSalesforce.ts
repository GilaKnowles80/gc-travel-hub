import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { event, data } = await req.json();

        // Get Salesforce access token
        const accessToken = await base44.asServiceRole.connectors.getAccessToken("salesforce");
        
        if (!accessToken) {
            console.error('Salesforce not authorized');
            return Response.json({ error: 'Salesforce not authorized' }, { status: 400 });
        }

        // Get Salesforce instance URL from token (or use a default)
        // Typically, you'd store this or get it from the OAuth response
        const instanceUrl = 'https://login.salesforce.com'; // Will be redirected to correct instance

        // Prepare lead data
        const leadData = {
            FirstName: data.applicant_name?.split(' ')[0] || data.user_email?.split('@')[0] || 'Customer',
            LastName: data.applicant_name?.split(' ').slice(1).join(' ') || 'Lead',
            Email: data.applicant_email || data.user_email,
            Phone: data.applicant_phone || '',
            Company: 'GC Travel Customer',
            LeadSource: 'Website',
            Status: 'New',
            Description: `Booking Type: ${event.entity_name}
Package: ${data.package_name || 'N/A'}
Total Price: $${data.total_price || data.final_price || 0}
Status: ${data.status}
Booking ID: ${event.entity_id}`,
            Country: data.user_country || data.nationality || ''
        };

        // Create lead in Salesforce
        const response = await fetch(`${instanceUrl}/services/data/v60.0/sobjects/Lead`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(leadData)
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Salesforce API error:', error);
            return Response.json({ error: 'Failed to create lead', details: error }, { status: 500 });
        }

        const result = await response.json();
        console.log('Lead synced to Salesforce:', result.id);

        return Response.json({ 
            success: true, 
            salesforceLeadId: result.id 
        });

    } catch (error) {
        console.error('Error syncing to Salesforce:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});