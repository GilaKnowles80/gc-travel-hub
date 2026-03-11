import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.6.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// ─── Phase 13: Risk Management Loop ──────────────────────────────────────────
// Daily: Stripe reconciliation + Supplier settlement check
// Weekly: Refund audit + Chargeback monitoring
// Monthly: Profit review + Risk reserve allocation
// Run via scheduled automation (daily at 08:00 PHT)

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { mode = 'daily' } = await req.json().catch(() => ({}));
    const now = new Date();
    const report = { mode, timestamp: now.toISOString(), findings: [], alerts: [] };

    console.log(`[RISK RECONCILIATION] Mode: ${mode} | ${now.toISOString()}`);

    // ── DAILY: Stripe Balance Check ───────────────────────────────────────
    if (mode === 'daily' || mode === 'all') {
      try {
        const balance = await stripe.balance.retrieve();
        const available = balance.available.map(b => ({ currency: b.currency, amount: b.amount / 100 }));
        const pending   = balance.pending.map(b => ({ currency: b.currency, amount: b.amount / 100 }));

        report.stripe_balance = { available, pending };
        console.log('[DAILY] Stripe balance:', JSON.stringify({ available, pending }));

        // Check pending supplier payments
        const pendingPayments = await base44.asServiceRole.entities.SupplierPayment.filter({ payment_status: 'pending' });
        const totalPendingSupplier = pendingPayments.reduce((s, p) => s + (p.supplier_amount || 0), 0);

        if (pendingPayments.length > 5) {
          report.alerts.push(`⚠️ ${pendingPayments.length} pending supplier payments totalling ₱${totalPendingSupplier.toFixed(2)}`);
        }

        report.findings.push({
          check: 'stripe_reconciliation',
          pending_supplier_payments: pendingPayments.length,
          total_pending_supplier: totalPendingSupplier.toFixed(2)
        });
      } catch (err) {
        console.error('[DAILY] Stripe balance error:', err.message);
        report.alerts.push('❌ Could not retrieve Stripe balance: ' + err.message);
      }
    }

    // ── WEEKLY: Refund & Chargeback Audit ────────────────────────────────
    if (mode === 'weekly' || mode === 'all') {
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Refund rate
      const allPayments = await base44.asServiceRole.entities.Payment.filter({ status: 'completed' });
      const refundedPayments = await base44.asServiceRole.entities.Payment.filter({ status: 'refunded' });
      const refundRate = allPayments.length > 0 ? ((refundedPayments.length / allPayments.length) * 100).toFixed(1) : 0;

      if (parseFloat(refundRate) > 5) {
        report.alerts.push(`⚠️ High refund rate: ${refundRate}% (target: <5%)`);
      }

      // Chargeback audit from AuditLog
      const chargebacks = await base44.asServiceRole.entities.AuditLog.filter({ action: 'chargeback_opened' });
      const chargebackRate = allPayments.length > 0 ? ((chargebacks.length / allPayments.length) * 100).toFixed(2) : 0;

      if (parseFloat(chargebackRate) > 1) {
        report.alerts.push(`🚨 Chargeback rate: ${chargebackRate}% (Stripe threshold: 1%)`);
      }

      report.findings.push({
        check: 'weekly_audit',
        total_payments: allPayments.length,
        refunded_payments: refundedPayments.length,
        refund_rate_pct: refundRate,
        chargebacks: chargebacks.length,
        chargeback_rate_pct: chargebackRate
      });

      console.log(`[WEEKLY] Refund rate: ${refundRate}% | Chargebacks: ${chargebacks.length}`);
    }

    // ── MONTHLY: Profit Review & Risk Reserve ─────────────────────────────
    if (mode === 'monthly' || mode === 'all') {
      const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

      const splits = await base44.asServiceRole.entities.PaymentSplit.filter({ status: 'settled' });
      const totalGross    = splits.reduce((s, r) => s + (r.gross_amount || 0), 0);
      const totalAgency   = splits.reduce((s, r) => s + (r.agency_amount || 0), 0);
      const totalNetProfit = splits.reduce((s, r) => s + (r.net_profit || 0), 0);
      const netMargin = totalGross > 0 ? ((totalNetProfit / totalGross) * 100).toFixed(1) : 0;

      // Risk reserve: 5% of net profit should be reserved
      const riskReserve = parseFloat((totalNetProfit * 0.05).toFixed(2));

      if (parseFloat(netMargin) < 15) {
        report.alerts.push(`⚠️ Net margin dropped below 15%: ${netMargin}% (target: ~17%)`);
      }

      report.findings.push({
        check: 'monthly_profit_review',
        total_gross_booking_value: totalGross.toFixed(2),
        total_agency_revenue: totalAgency.toFixed(2),
        total_net_profit: totalNetProfit.toFixed(2),
        net_margin_pct: netMargin,
        recommended_risk_reserve: riskReserve.toFixed(2),
        splits_analyzed: splits.length
      });

      console.log(`[MONTHLY] GBV: ${totalGross.toFixed(2)} | Net Profit: ${totalNetProfit.toFixed(2)} | Margin: ${netMargin}%`);
    }

    // ── Send admin alert email if issues found ────────────────────────────
    if (report.alerts.length > 0) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        from_name: 'GC Travel Risk System',
        to: 'info@gctravelandtours.com',
        subject: `⚠️ Risk Alert – ${mode.charAt(0).toUpperCase() + mode.slice(1)} Reconciliation`,
        body: `
          <h2>Risk Management Report – ${mode}</h2>
          <p><strong>Date:</strong> ${now.toISOString()}</p>
          <h3>🚨 Alerts</h3>
          <ul>${report.alerts.map(a => `<li>${a}</li>`).join('')}</ul>
          <h3>📊 Findings</h3>
          <pre>${JSON.stringify(report.findings, null, 2)}</pre>
        `
      });
    }

    // ── Log to audit ──────────────────────────────────────────────────────
    await base44.asServiceRole.entities.AuditLog.create({
      action: `risk_reconciliation_${mode}`,
      entity_type: 'system',
      entity_id: 'risk_engine',
      details: JSON.stringify(report),
      user_email: user.email,
      timestamp: now.toISOString()
    }).catch(console.error);

    return Response.json({ success: true, report });

  } catch (error) {
    console.error('[RISK RECONCILIATION ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});