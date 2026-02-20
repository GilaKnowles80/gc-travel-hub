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

        // Prepare lead data for GC Travel leads
        const names = data.full_name?.split(' ') || ['', ''];
        const leadData = {
            FirstName: names[0] || 'Customer',
            LastName: names.slice(1).join(' ') || 'Lead',
            Email: data.email || '',
            Phone: data.phone || '',
            Company: 'GC Travel Prospect',
            LeadSource: data.lead_source || 'website',
            Status: 'Open - Not Contacted',
            Description: `Interested In: ${data.interested_in?.join(', ') || 'N/A'}
Destination: ${data.destination || 'N/A'}
Travel Dates: ${data.travel_dates || 'N/A'}
Budget: ${data.budget ? `PHP ${data.budget}` : 'N/A'}
Group Size: ${data.group_size || 1}
Priority: ${data.priority || 'medium'}
Notes: ${data.notes || ''}
Lead ID: ${event.entity_id}`,
            Country: data.country || ''
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