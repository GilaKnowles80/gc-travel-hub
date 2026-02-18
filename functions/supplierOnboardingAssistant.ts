import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, supplier_type, step, data } = await req.json();

    // Get contextual AI tips based on supplier type and step
    if (action === 'get_tips') {
      const tips = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are an onboarding assistant for travel suppliers. 
        
Supplier Type: ${supplier_type}
Current Step: ${step === 1 ? 'Profile Setup' : step === 2 ? 'Initial Inventory' : step === 3 ? 'Pricing Configuration' : step === 4 ? 'Portal Features' : 'Final Review'}

Provide 3-4 concise, actionable tips specific to this supplier type and step. Format as a JSON array of tip strings.
Make tips practical, industry-specific, and helpful for someone new to the platform.

Examples for hotels at inventory step:
- "Start with your best-selling room types to maximize early bookings"
- "High-quality photos increase booking conversion by up to 40%"
- "Set seasonal pricing now to automate rate adjustments"

Keep tips SHORT (max 15 words each), ACTIONABLE, and SPECIFIC to ${supplier_type}.`,
        response_json_schema: {
          type: "object",
          properties: {
            tips: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      return Response.json({ tips: tips.tips });
    }

    // Validate data with AI
    if (action === 'validate_data') {
      const validation = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a data validation assistant for travel supplier onboarding.

Supplier Type: ${supplier_type}
Step: ${step}
Data: ${JSON.stringify(data, null, 2)}

Validate this data and provide:
1. Is it valid? (boolean)
2. Any warnings or suggestions (array of strings, max 2)
3. Missing critical fields (array of field names)

Be helpful but not overly strict. Focus on business-critical validations.
For prices, ensure they're reasonable for the industry.
For dates, ensure they make logical sense.
For inventory, ensure minimum required fields are present.`,
        response_json_schema: {
          type: "object",
          properties: {
            is_valid: { type: "boolean" },
            warnings: {
              type: "array",
              items: { type: "string" }
            },
            missing_fields: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      return Response.json(validation);
    }

    // Generate sample data for supplier type
    if (action === 'generate_sample') {
      const sample = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Generate realistic sample ${step === 'inventory' ? 'inventory item' : 'pricing data'} for a ${supplier_type} supplier.

${step === 'inventory' ? `Include: name, description, capacity/seats, amenities, availability.` : `Include: base price, seasonal adjustments, discount strategies.`}

Make it realistic and industry-appropriate. Return as JSON object.`,
        response_json_schema: {
          type: "object",
          properties: {
            sample_data: { type: "object" }
          }
        }
      });

      return Response.json(sample.sample_data);
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Onboarding assistant error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});