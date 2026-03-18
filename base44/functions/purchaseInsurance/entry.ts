import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            provider_id,
            coverage_type,
            premium,
            booking_id,
            trip_details,
            travelers
        } = await req.json();

        console.log('Processing insurance purchase:', { provider_id, coverage_type, booking_id });

        // Get provider details
        const providers = await base44.asServiceRole.entities.InsuranceProvider.filter({
            id: provider_id
        });

        if (providers.length === 0) {
            return Response.json({ error: 'Provider not found' }, { status: 404 });
        }

        const provider = providers[0];
        const coverage = provider.coverage_types.find(c => c.type === coverage_type);

        if (!coverage) {
            return Response.json({ error: 'Coverage type not found' }, { status: 404 });
        }

        // Generate policy number
        const policyNumber = `POL-${provider.provider_code}-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Create insurance policy
        const policy = await base44.entities.InsurancePolicy.create({
            user_email: user.email,
            booking_id,
            provider_id,
            provider_policy_number: policyNumber,
            coverage_type,
            coverage_amount: coverage.coverage_amount,
            premium,
            trip_details,
            travelers,
            benefits: coverage.benefits,
            status: 'active',
            payment_status: 'paid'
        });

        // Send notification
        await base44.asServiceRole.entities.Notification.create({
            user_email: user.email,
            title: 'Travel Insurance Confirmed',
            message: `Your ${coverage.name} insurance policy has been activated. Policy #${policyNumber}`,
            type: 'info',
            link: '/profile'
        });

        // Generate policy document (mock URL)
        const policyDocUrl = `https://insurance.example.com/policy/${policyNumber}.pdf`;

        // Update policy with document URL
        await base44.entities.InsurancePolicy.update(policy.id, {
            policy_document_url: policyDocUrl
        });

        console.log('Insurance policy created:', policyNumber);

        return Response.json({
            success: true,
            policy: {
                id: policy.id,
                policy_number: policyNumber,
                coverage_type,
                coverage_amount: coverage.coverage_amount,
                premium,
                provider_name: provider.provider_name,
                benefits: coverage.benefits,
                policy_document_url: policyDocUrl,
                status: 'active'
            }
        });

    } catch (error) {
        console.error('Insurance purchase error:', error);
        return Response.json({ 
            error: error.message,
            details: 'Failed to purchase insurance'
        }, { status: 500 });
    }
});