import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        // Admin-only access
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { includeData, format } = await req.json();

        console.log('Starting code backup export...');

        // Entity schemas and data
        const entities = [
            'Flight', 'Hotel', 'Tour', 'Train', 'Ferry', 'Cruise',
            'FlightBooking', 'HotelBooking', 'TrainBooking', 'FerryBooking', 'CruiseBooking',
            'Booking', 'Payment', 'Notification',
            'User', 'Supplier', 'SupplierInventory', 'SupplierPayment', 'SupplierBankAccount',
            'SupplierOnboarding', 'SupplierMessage', 'SupplierPromotion',
            'Airport', 'LocationPricing', 'SavedTraveler', 'SavedGuest',
            'UserFlightPreferences', 'PriceAlert', 'Review', 'Favorite', 'Itinerary',
            'DiscountCode', 'DiscountUsage', 'DynamicPrice', 'PricingRule', 'CurrencyRate',
            'TravelInsurance', 'Visa', 'LoyaltyAccount', 'LoyaltyTransaction', 'LoyaltySettings',
            'CorporateClient', 'BulkBooking', 'HelpdeskTicket',
            'AuditLog', 'TwoFactorCode', 'UserSession', 'GDPRConsent',
            'AIPricingSettings', 'AIPricingSuggestion', 'BankAccount', 'HotelPriceAlert'
        ];

        const entityBackup = {};

        for (const entityName of entities) {
            try {
                // Get schema
                const schema = await base44.asServiceRole.entities[entityName].schema();
                
                entityBackup[entityName] = {
                    schema: schema,
                    recordCount: 0,
                    sampleData: []
                };

                // Get data if requested
                if (includeData) {
                    const records = await base44.asServiceRole.entities[entityName].list('-created_date', 100);
                    entityBackup[entityName].recordCount = records.length;
                    entityBackup[entityName].sampleData = records;
                }
            } catch (error) {
                console.log(`Skipping entity ${entityName}:`, error.message);
                entityBackup[entityName] = { error: error.message };
            }
        }

        // Backend functions list
        const functions = [
            'aiFlightRecommendations', 'aiDynamicPricing', 'aiPriceMonitor',
            'createStripeCheckout', 'createFlightCheckout', 'createHotelCheckout', 'createTrainCheckout',
            'createPayMongoPayment', 'handleStripeWebhook', 'stripeWebhook',
            'searchFlights', 'searchFlightsAMADEUS', 'bookFlight', 'bookFlightAMADEUS',
            'searchHotels', 'searchHotelsAMADEUS', 'bookHotel',
            'searchToursAMADEUS', 'amadeusBearerToken',
            'supplierLogin', 'supplierAnalytics', 'supplierOnboardingAssistant',
            'calculateLocationPrice', 'calculateDynamicPrice', 'applyDiscount', 'validateDiscountCode',
            'fetchCurrencyRates', 'checkPriceAlerts', 'trackPrices',
            'sendNotification', 'sendHelpdeskEmail', 'sendBookingItinerary', 'notifySupplierPayment',
            'sendSupplierMessage', 'notifyManualSupplierPayment',
            'travelAssistant', 'exportTravelData', 'importTravelData',
            'awardLoyaltyPoints', 'redeemLoyaltyPoints',
            'bulkImportHotels', 'bulkImportTours', 'bulkBookingProcessor',
            'createSupplierPayment', 'triggerSupplierPayout', 'exportSupplierPayments',
            'autoPaySupplier', 'processSplitPayment',
            'generateBookingPdf', 'getMarkup', 'getAdminMarkup', 'getFlightDetails',
            'createDatabaseBackup', 'restoreDatabaseBackup', 'exportCodeBackup',
            'auditLog', 'checkSession', 'rateLimit', 'verifyRecaptcha',
            'send2FACode', 'verify2FACode', 'sendVerificationEmail',
            'exportUserData', 'deleteUserData', 'verifyAdminPassword',
            'optimizedDataFetch', 'processTransactionQueue', 'syncRealtimeData'
        ];

        // Pages list
        const pages = [
            'Home', 'Flights', 'FlightDetail', 'FlightSearch', 'FlightTicket',
            'Hotels', 'HotelSearch', 'HotelDetail',
            'Tours', 'TourDetail',
            'TrainSearch', 'FerrySearch', 'CruiseSearch',
            'Visas', 'Contact', 'Support247', 'BestPriceGuarantee',
            'MyBookings', 'MyFlightBookings', 'MyReviews',
            'Itineraries', 'ItineraryView', 'SharedItinerary',
            'PriceAlerts', 'Profile', 'Settings',
            'BookingConfirmation', 'FlightBookingConfirmation', 'HotelBookingConfirmation', 'TrainBookingConfirmation',
            'PaymentSuccess', 'PaymentCancelled', 'PaymentMethods',
            'TransactionHistory', 'Helpdesk', 'TravelAssistant',
            'TermsOfService', 'PrivacyPolicy', 'RefundPolicy', 'GDPRSettings',
            'SafeAndSecure', 'TrustedAgency',
            'AdminDashboard', 'AdminFlights', 'AdminHotels', 'AdminTours',
            'AdminFerries', 'AdminBuses', 'AdminCarRentals', 'AdminVisas',
            'AdminBankAccounts', 'AdminSupplierBankAccounts', 'AdminSupplierPayments',
            'AdminPricing', 'AdminPromotions', 'AdminCorporateClients',
            'AdminEmailClients', 'AdminHelpdesk', 'AdminLoyalty', 'AdminReviews',
            'AdminDataManager', 'AdminInsurance', 'AdminSupplierComms',
            'AdminSecurityCenter', 'AdminAuditLogs',
            'CorporateBooking',
            'SupplierLogin', 'SupplierDashboard', 'SupplierOnboarding'
        ];

        // Key components list
        const components = [
            'Layout', 'NotificationBell', 'FloatingContactWidget',
            'flights/BookingDialog', 'flights/FlightFilters', 'flights/AirportSelector',
            'flights/AIRecommendations', 'flights/DiscoverFlights',
            'hotels/HotelBookingDialog', 'trains/TrainBookingDialog',
            'tours/BookingForm', 'payment/StripeCheckout', 'payment/PayMongoPayment',
            'supplier/*', 'admin/*', 'security/*', 'currency/*', 'language/*'
        ];

        const backup = {
            metadata: {
                appName: 'GC Travel and Tours',
                exportDate: new Date().toISOString(),
                exportedBy: user.email,
                version: '1.0',
                includesData: includeData
            },
            entities: entityBackup,
            structure: {
                functions: functions,
                pages: pages,
                components: components
            },
            configuration: {
                stripe: 'Configured (Live Mode)',
                paymongo: 'Configured',
                amadeus: 'Configured',
                recaptcha: 'Configured',
                locationPricing: 'Enabled',
                aiFeatures: 'Enabled'
            }
        };

        console.log('Backup export completed successfully');

        // Return as JSON
        if (format === 'json') {
            return Response.json(backup, {
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename="gc-travel-backup-${Date.now()}.json"`
                }
            });
        }

        // Return as formatted text for easy viewing
        return Response.json({
            success: true,
            backup: backup,
            downloadInstructions: 'Copy the backup object or use format: "json" for downloadable file'
        });

    } catch (error) {
        console.error('Export backup error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});