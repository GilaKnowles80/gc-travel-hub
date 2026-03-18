import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
        }

        const { hotels } = await req.json();

        if (!Array.isArray(hotels) || hotels.length === 0) {
            return Response.json({ error: 'Invalid or empty hotels data' }, { status: 400 });
        }

        // Validate and process hotels
        const processedHotels = hotels.map((hotel, index) => {
            if (!hotel.name || !hotel.location || !hotel.star_rating) {
                throw new Error(`Hotel at row ${index + 1} missing required fields: name, location, star_rating`);
            }

            return {
                name: hotel.name.trim(),
                location: hotel.location.trim(),
                description: hotel.description || '',
                star_rating: parseInt(hotel.star_rating),
                image_url: hotel.image_url || '',
                gallery_urls: hotel.gallery_urls ? (Array.isArray(hotel.gallery_urls) ? hotel.gallery_urls : []) : [],
                address: hotel.address || '',
                amenities: hotel.amenities ? (Array.isArray(hotel.amenities) ? hotel.amenities : []) : [],
                status: hotel.status || 'active',
                room_types: hotel.room_types || [
                    { type: 'Standard Room', price_per_night: 0, capacity: 2, amenities: ['WiFi', 'TV'] }
                ]
            };
        });

        // Bulk create hotels
        const createdHotels = await base44.asServiceRole.entities.Hotel.bulkCreate(processedHotels);

        return Response.json({
            success: true,
            message: `Successfully imported ${createdHotels.length} hotels`,
            count: createdHotels.length,
            hotels: createdHotels
        });

    } catch (error) {
        console.error('Bulk import error:', error);
        return Response.json({ error: error.message }, { status: 400 });
    }
});