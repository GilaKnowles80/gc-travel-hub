import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const result = await base44.asServiceRole.integrations.Core.GenerateImage({
            prompt: "Professional app icon logo for 'GC Travel and Tours'. Modern minimalist design featuring a stylized blue globe/earth icon at the top with white continents, bold 'GC' letters in gradient blue below the globe, and elegant text 'TRAVEL AND TOURS' underneath. Clean solid vibrant orange/yellow (#FF5722) background. Rounded square app icon format. High quality, sharp, vector-style, professional travel agency branding, suitable for mobile app store. No texture, no background patterns, flat design, centered composition."
        });

        return Response.json({ success: true, imageUrl: result.url });
    } catch (error) {
        console.error('Logo generation error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});