import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // Verify master password
        const { masterPassword } = await req.json();
        const storedPassword = Deno.env.get("ADMIN_MASTER_PASSWORD");
        
        if (masterPassword !== storedPassword) {
            return Response.json({ error: 'Invalid master password' }, { status: 403 });
        }

        // List of all entities to backup
        const entities = [
            'Tour', 'Flight', 'Hotel', 'Booking', 'FlightBooking', 'HotelBooking',
            'FerryBooking', 'BusBooking', 'CarRentalBooking', 'Visa',
            'SavedTraveler', 'SavedGuest', 'Favorite', 'Itinerary',
            'PriceAlert', 'Review', 'LoyaltyAccount', 'LoyaltyTransaction',
            'HelpdeskTicket', 'Notification', 'BankAccount', 'SupplierBankAccount',
            'SupplierPayment', 'PricingRule', 'DynamicPrice', 'CurrencyRate',
            'LoyaltySettings', 'SupplierCredentials'
        ];

        const backup = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            app_id: Deno.env.get("BASE44_APP_ID"),
            created_by: user.email,
            data: {}
        };

        // Fetch all data from each entity
        for (const entityName of entities) {
            try {
                const records = await base44.asServiceRole.entities[entityName].list('-created_date', 10000);
                backup.data[entityName] = records;
            } catch (error) {
                console.log(`Skipping ${entityName}: ${error.message}`);
                backup.data[entityName] = [];
            }
        }

        // Also backup users (admin only)
        try {
            const users = await base44.asServiceRole.entities.User.list('-created_date', 10000);
            backup.data.User = users;
        } catch (error) {
            console.log(`Users backup skipped: ${error.message}`);
        }

        // Create downloadable backup file
        const backupJson = JSON.stringify(backup, null, 2);
        const filename = `gc-travel-backup-${new Date().toISOString().split('T')[0]}.json`;

        return new Response(backupJson, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        });
    } catch (error) {
        console.error('Backup error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});