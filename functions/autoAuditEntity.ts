/**
 * Auto-audit entity changes triggered by entity automations.
 * Records create/update/delete events for key entities into AuditLog.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Severity mapping by entity type
const ENTITY_SEVERITY = {
  Payment: 'high',
  FlightBooking: 'medium',
  HotelBooking: 'medium',
  TourBooking: 'medium',
  FerryBooking: 'medium',
  BusBooking: 'medium',
  CarRentalBooking: 'medium',
  TrainBooking: 'medium',
  CruiseBooking: 'medium',
  PackageBooking: 'medium',
  User: 'medium',
  HelpdeskTicket: 'low',
  Lead: 'low',
  Affiliate: 'low',
  DiscountCode: 'medium',
  PremiumMembership: 'medium',
  Wallet: 'high',
  WalletTransaction: 'high',
  SupplierPayment: 'high',
  AuditLog: 'low',
};

// Critical actions that should alert
const CRITICAL_ENTITIES = ['Payment', 'Wallet', 'WalletTransaction', 'SupplierPayment'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { event, data, old_data } = body;
    const { type: eventType, entity_name, entity_id } = event || {};

    if (!entity_name || !eventType) {
      return Response.json({ success: true, message: 'No entity info' });
    }

    const severity = CRITICAL_ENTITIES.includes(entity_name) ? 'critical'
      : ENTITY_SEVERITY[entity_name] || 'low';

    // Build changes diff for update events
    let changes = null;
    if (eventType === 'update' && data && old_data) {
      changes = {};
      for (const key of Object.keys(data)) {
        if (JSON.stringify(data[key]) !== JSON.stringify(old_data[key])) {
          changes[key] = { from: old_data[key], to: data[key] };
        }
      }
    }

    // Determine actor
    const user_email = data?.created_by || old_data?.created_by || 'system';

    await base44.asServiceRole.entities.AuditLog.create({
      user_email,
      action: eventType, // create | update | delete
      entity_type: entity_name,
      entity_id: entity_id || data?.id || '',
      changes,
      severity,
      status: 'success',
      ip_address: 'auto-detected',
      user_agent: 'system-automation',
    });

    // Alert on critical entity changes
    if (severity === 'critical') {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: 'gilaknowles80@gmail.com',
        subject: `🚨 Critical Change: ${entity_name} ${eventType}`,
        body: `Entity: ${entity_name}\nEvent: ${eventType}\nID: ${entity_id}\nUser: ${user_email}\nTime: ${new Date().toISOString()}`
      }).catch(console.error);
    }

    console.log(`Auto-audit: ${eventType} on ${entity_name} (${entity_id}) severity=${severity}`);
    return Response.json({ success: true });

  } catch (error) {
    console.error('autoAuditEntity error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});