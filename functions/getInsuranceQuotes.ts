import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            destination, 
            startDate, 
            endDate, 
            tripCost, 
            travelers 
        } = await req.json();

        console.log('Fetching insurance quotes for:', { destination, startDate, endDate, tripCost });

        // Get active insurance providers
        const providers = await base44.asServiceRole.entities.InsuranceProvider.filter({
            is_active: true
        });

        if (providers.length === 0) {
            return Response.json({ 
                error: 'No insurance providers available',
                quotes: []
            });
        }

        // Calculate trip duration
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

        // Calculate base rates based on trip parameters
        const travelerCount = travelers || 1;
        const baseRate = tripCost * 0.05; // 5% of trip cost as base
        const durationMultiplier = 1 + (days / 30); // Longer trips cost more
        const travelerMultiplier = travelerCount;

        const quotes = [];

        for (const provider of providers) {
            for (const coverage of provider.coverage_types) {
                // Calculate premium based on coverage type
                let premium = baseRate * durationMultiplier * travelerMultiplier;
                
                switch (coverage.type) {
                    case 'basic':
                        premium *= 0.7;
                        break;
                    case 'standard':
                        premium *= 1.0;
                        break;
                    case 'premium':
                        premium *= 1.5;
                        break;
                    case 'comprehensive':
                        premium *= 2.0;
                        break;
                }

                // Add provider's base price
                premium += coverage.base_price || 0;

                // Round to 2 decimals
                premium = Math.round(premium * 100) / 100;

                quotes.push({
                    provider_id: provider.id,
                    provider_name: provider.provider_name,
                    provider_logo: provider.logo_url,
                    coverage_type: coverage.type,
                    coverage_name: coverage.name,
                    coverage_amount: coverage.coverage_amount,
                    premium: premium,
                    benefits: coverage.benefits || [],
                    recommended: coverage.type === 'standard', // Mark standard as recommended
                    savings: coverage.type === 'basic' ? null : Math.round((premium * 0.15) * 100) / 100
                });
            }
        }

        // Sort by price
        quotes.sort((a, b) => a.premium - b.premium);

        console.log(`Generated ${quotes.length} insurance quotes`);

        return Response.json({
            success: true,
            quotes,
            trip_details: {
                destination,
                start_date: startDate,
                end_date: endDate,
                duration_days: days,
                trip_cost: tripCost,
                travelers: travelerCount
            }
        });

    } catch (error) {
        console.error('Insurance quotes error:', error);
        return Response.json({ 
            error: error.message,
            quotes: []
        }, { status: 500 });
    }
});