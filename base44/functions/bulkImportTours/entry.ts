import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
        }

        const { tours } = await req.json();

        if (!Array.isArray(tours) || tours.length === 0) {
            return Response.json({ error: 'Invalid or empty tours data' }, { status: 400 });
        }

        // Validate and process tours
        const processedTours = tours.map((tour, index) => {
            if (!tour.title || !tour.destination || !tour.price_per_person || !tour.duration_days) {
                throw new Error(`Tour at row ${index + 1} missing required fields: title, destination, price_per_person, duration_days`);
            }

            return {
                title: tour.title.trim(),
                destination: tour.destination.trim(),
                description: tour.description || '',
                long_description: tour.long_description || '',
                category: tour.category || 'adventure',
                duration_days: parseInt(tour.duration_days),
                price_per_person: parseFloat(tour.price_per_person),
                group_size_max: tour.group_size_max ? parseInt(tour.group_size_max) : 30,
                image_url: tour.image_url || '',
                gallery_urls: tour.gallery_urls ? (Array.isArray(tour.gallery_urls) ? tour.gallery_urls : []) : [],
                itinerary: tour.itinerary ? (Array.isArray(tour.itinerary) ? tour.itinerary : []) : [],
                inclusions: tour.inclusions ? (Array.isArray(tour.inclusions) ? tour.inclusions : []) : [],
                exclusions: tour.exclusions ? (Array.isArray(tour.exclusions) ? tour.exclusions : []) : [],
                rating: tour.rating ? parseFloat(tour.rating) : 4.5,
                reviews_count: tour.reviews_count ? parseInt(tour.reviews_count) : 0,
                is_featured: tour.is_featured === true || tour.is_featured === 'true',
                status: tour.status || 'active',
                departure_dates: tour.departure_dates ? (Array.isArray(tour.departure_dates) ? tour.departure_dates : []) : []
            };
        });

        // Bulk create tours
        const createdTours = await base44.asServiceRole.entities.Tour.bulkCreate(processedTours);

        return Response.json({
            success: true,
            message: `Successfully imported ${createdTours.length} tours`,
            count: createdTours.length,
            tours: createdTours
        });

    } catch (error) {
        console.error('Bulk import error:', error);
        return Response.json({ error: error.message }, { status: 400 });
    }
});