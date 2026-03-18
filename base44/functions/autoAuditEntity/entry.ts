/**
 * GC Travel & Tours — Automated Compliance Audit Recorder
 * Triggered by entity automations on create/update/delete events.
 * Records real field-level diffs with human-readable descriptions.
 * Compliant with Philippines Data Privacy Act (RA 10173) and SEC requirements.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Sensitivity / severity per entity
const ENTITY_CONFIG = {
  Payment:           { severity: 'critical', compliance: 'Financial transaction record — SEC/BIR reportable' },
  WalletTransaction: { severity: 'critical', compliance: 'Electronic money movement — BSP e-money regulation' },
  Wallet:            { severity: 'high',     compliance: 'Customer wallet account — BSP e-money regulation' },
  SupplierPayment:   { severity: 'high',     compliance: 'Supplier disbursement — BIR/SEC reportable' },
  FlightBooking:     { severity: 'medium',   compliance: 'Travel booking record — DOT consumer protection' },
  HotelBooking:      { severity: 'medium',   compliance: 'Travel booking record — DOT consumer protection' },
  TourBooking:       { severity: 'medium',   compliance: 'Travel booking record — DOT consumer protection' },
  PackageBooking:    { severity: 'medium',   compliance: 'Travel booking record — DOT consumer protection' },
  FerryBooking:      { severity: 'medium',   compliance: 'Travel booking record — DOT consumer protection' },
  BusBooking:        { severity: 'medium',   compliance: 'Travel booking record — DOT consumer protection' },
  CarRentalBooking:  { severity: 'medium',   compliance: 'Travel booking record — DOT consumer protection' },
  TrainBooking:      { severity: 'medium',   compliance: 'Travel booking record — DOT consumer protection' },
  CruiseBooking:     { severity: 'medium',   compliance: 'Travel booking record — DOT consumer protection' },
  DiscountCode:      { severity: 'medium',   compliance: 'Promotional discount — pricing integrity' },
  PremiumMembership: { severity: 'medium',   compliance: 'Subscription record — consumer rights' },
  Affiliate:         { severity: 'low',      compliance: 'Partner account record' },
  HelpdeskTicket:    { severity: 'low',      compliance: 'Customer support record — RA 10173 data subject' },
  Lead:              { severity: 'low',      compliance: 'Sales lead record — RA 10173 data subject' },
};

// Fields to EXCLUDE from diffs (non-material or sensitive)
const EXCLUDED_FIELDS = ['updated_date', 'created_date', '__v', '_rev'];

// Sensitive fields — log that they changed but mask the value
const SENSITIVE_FIELDS = ['password', 'pin', 'cvv', 'card_number', 'secret', 'token'];

function buildDescription(eventType, entity_name, data, changedFields) {
  const ref = data?.booking_ref || data?.payout_number || data?.id?.slice(0, 8) || '';
  const refStr = ref ? ` [Ref: ${ref}]` : '';

  if (eventType === 'create') {
    return `New ${entity_name} record created${refStr}.`;
  }
  if (eventType === 'delete') {
    return `${entity_name} record deleted${refStr}.`;
  }
  if (eventType === 'update') {
    if (changedFields.length === 0) return `${entity_name} record accessed (no material changes detected)${refStr}.`;
    return `${entity_name} updated${refStr}: fields changed — ${changedFields.join(', ')}.`;
  }
  return `${entity_name} event: ${eventType}${refStr}.`;
}

function buildDiff(data, old_data) {
  const changes = {};
  const allKeys = new Set([...Object.keys(data || {}), ...Object.keys(old_data || {})]);

  for (const key of allKeys) {
    if (EXCLUDED_FIELDS.includes(key)) continue;
    const newVal = data?.[key];
    const oldVal = old_data?.[key];
    if (JSON.stringify(newVal) === JSON.stringify(oldVal)) continue;

    const isSensitive = SENSITIVE_FIELDS.some(s => key.toLowerCase().includes(s));
    changes[key] = {
      from: isSensitive ? '[REDACTED]' : oldVal,
      to:   isSensitive ? '[REDACTED]' : newVal,
    };
  }
  return changes;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { event, data, old_data, payload_too_large } = body;
    const { type: eventType, entity_name, entity_id } = event || {};

    if (!entity_name || !eventType) {
      return Response.json({ success: true, message: 'Skipped: missing event info' });
    }

    if (entity_name === 'AuditLog') {
      // Prevent infinite loop — never audit the AuditLog itself
      return Response.json({ success: true, message: 'Skipped: AuditLog self-audit suppressed' });
    }

    const config = ENTITY_CONFIG[entity_name] || { severity: 'low', compliance: 'General system record' };

    // Build field-level diff for updates
    let changes = null;
    let changedFields = [];

    if (eventType === 'update') {
      if (payload_too_large) {
        // Fetch current data manually if payload was too large
        try {
          const current = await base44.asServiceRole.entities[entity_name]?.get?.(entity_id);
          changes = { note: 'Payload too large to diff — full record fetched', record_id: entity_id, fetched_at: new Date().toISOString() };
          changedFields = ['[large payload — diff unavailable]'];
        } catch {
          changes = { note: 'Payload too large to diff' };
          changedFields = ['[large payload]'];
        }
      } else if (data && old_data) {
        changes = buildDiff(data, old_data);
        changedFields = Object.keys(changes);
      }
    } else if (eventType === 'create' && data) {
      // For creates, summarise key fields only (no "before")
      const summary = {};
      const keyFields = ['booking_ref', 'status', 'payment_status', 'total_price', 'amount', 'route', 'passenger_name', 'guest_name', 'customer_name', 'supplier'];
      for (const f of keyFields) {
        if (data[f] !== undefined) summary[f] = data[f];
      }
      if (Object.keys(summary).length > 0) changes = { created_with: summary };
    } else if (eventType === 'delete') {
      changes = {
        deleted_record: {
          booking_ref: data?.booking_ref || old_data?.booking_ref || null,
          status: data?.status || old_data?.status || null,
          total_price: data?.total_price || old_data?.total_price || null,
          deleted_at: new Date().toISOString(),
        }
      };
    }

    // Actor: for automation-triggered events, use created_by or updated_by if available
    // Otherwise honestly label as system-automation
    const actor_email = data?.updated_by || data?.created_by || old_data?.created_by || 'system-automation';
    const actor_type = actor_email === 'system-automation' ? 'automation' : 'user';

    const description = buildDescription(eventType, entity_name, data || old_data, changedFields);

    const timestamp_ph = new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' });

    await base44.asServiceRole.entities.AuditLog.create({
      user_email: actor_email,
      actor_type,
      action: eventType,
      entity_type: entity_name,
      entity_id: entity_id || data?.id || '',
      description,
      changes,
      ip_address: 'system-automation',
      user_agent: `GC-Travel-AutoAudit/1.0 (Automation; ${timestamp_ph} PHT)`,
      severity: config.severity,
      status: 'success',
      compliance_note: config.compliance,
    });

    // Email alert for critical severity only
    if (config.severity === 'critical') {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: 'gilaknowles80@gmail.com',
        from_name: 'GC Travel Compliance Alert',
        subject: `⚠️ Critical Record Change: ${entity_name} ${eventType.toUpperCase()}`,
        body: [
          `GC Travel & Tours — Automated Compliance Alert`,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          `Entity:       ${entity_name}`,
          `Event:        ${eventType.toUpperCase()}`,
          `Record ID:    ${entity_id || 'N/A'}`,
          `Actor:        ${actor_email}`,
          `Description:  ${description}`,
          `Compliance:   ${config.compliance}`,
          `Timestamp:    ${timestamp_ph} PHT`,
          ``,
          `This is an automated compliance notification.`,
          `Review this event in the Admin Audit Logs dashboard.`,
        ].join('\n')
      }).catch(err => console.error('Alert email failed:', err.message));
    }

    console.log(`[AUDIT] ${eventType} | ${entity_name} | ${entity_id} | actor=${actor_email} | severity=${config.severity} | changes=${changedFields.join(',') || 'n/a'}`);
    return Response.json({ success: true });

  } catch (error) {
    console.error('[AUDIT ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});