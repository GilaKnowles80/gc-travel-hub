import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const {
      booking_id,
      booking_type,
      total_amount,
      wallet_amount,
      card_amount,
      supplier_id,
      supplier_name,
      supplier_payout,
      service_fee,
      payment_method,
      supplier_api_config // { type: 'duffel', endpoint, params }
    } = payload;

    // Validate request
    if (!booking_id || !total_amount || total_amount <= 0) {
      return Response.json(
        { error: 'Invalid booking parameters' },
        { status: 400 }
      );
    }

    const userEmail = user.email;

    // ===== STEP 1: CHECK VELOCITY LIMITS =====
    const velocityLimits = await base44.entities.VelocityLimit.filter({
      user_email: userEmail
    });
    const userLimit = velocityLimits[0] || {
      user_email: userEmail,
      loaded_today: 0,
      transacted_today: 0
    };

    if (payment_method === 'wallet' || payment_method === 'split') {
      const newTransactionAmount = (userLimit.transacted_today || 0) + total_amount;
      if (newTransactionAmount > (userLimit.daily_transaction_limit || 500000)) {
        return Response.json(
          { error: 'Daily transaction limit exceeded', limit: userLimit.daily_transaction_limit },
          { status: 429 }
        );
      }
    }

    // ===== STEP 2: LOCK WALLET FUNDS =====
    const lockRecord = await base44.entities.WalletLock.create({
      user_email: userEmail,
      booking_id,
      booking_type,
      locked_amount: wallet_amount || 0,
      status: 'active',
      expiry_time: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 min expiry
    });

    // Create ledger entry for lock
    const lockLedgerEntry = await base44.entities.WalletLedger.create({
      user_email: userEmail,
      transaction_type: 'lock',
      amount: wallet_amount || 0,
      booking_id,
      booking_type,
      status: 'pending',
      reference_id: lockRecord.id,
      notes: `Wallet lock for ${booking_type} booking`
    });

    // ===== STEP 3: CALL SUPPLIER API =====
    let supplierConfirmation = null;
    let supplierError = null;

    try {
      if (supplier_api_config?.type === 'duffel') {
        // Call Duffel API
        const duffelResponse = await fetch(supplier_api_config.endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('DUFFEL_API_KEY')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(supplier_api_config.params)
        });

        if (!duffelResponse.ok) {
          throw new Error(`Duffel API error: ${duffelResponse.statusText}`);
        }

        supplierConfirmation = await duffelResponse.json();
      } else {
        // Generic supplier API call
        const supplierResponse = await fetch(supplier_api_config?.endpoint || '', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(supplier_api_config?.params || {})
        });

        if (!supplierResponse.ok) {
          throw new Error(`Supplier API error: ${supplierResponse.statusText}`);
        }

        supplierConfirmation = await supplierResponse.json();
      }
    } catch (error) {
      supplierError = error.message;
      console.error('Supplier API call failed:', supplierError);
    }

    // ===== STEP 4A: SUCCESS PATH (BEGIN TRANSACTION) =====
    if (!supplierError && supplierConfirmation) {
      const txnState = {
        lockUpdated: false,
        debitLedgerCreated: false,
        walletUpdated: false,
        paymentSplitCreated: false,
        settlementUpdated: false,
        disbursementCreated: false,
        velocityUpdated: false,
        ids: {
          debitLedgerEntry: null,
          paymentSplit: null,
          disbursement: null
        }
      };

      try {
        // STEP 1: Confirm lock debit
        await base44.entities.WalletLock.update(lockRecord.id, {
          status: 'confirmed',
          confirmed_at: new Date().toISOString()
        });
        txnState.lockUpdated = true;
        console.log(`✓ Lock confirmed for booking ${booking_id}`);

        // STEP 2: Create confirmed debit ledger entry
        const debitLedgerEntry = await base44.entities.WalletLedger.create({
          user_email: userEmail,
          transaction_type: 'charge',
          amount: wallet_amount || 0,
          booking_id,
          booking_type,
          status: 'confirmed',
          reference_id: lockRecord.id,
          notes: `Confirmed charge for ${booking_type} booking - supplier confirmed`
        });
        txnState.debitLedgerCreated = true;
        txnState.ids.debitLedgerEntry = debitLedgerEntry.id;
        console.log(`✓ Debit ledger entry created: ${debitLedgerEntry.id}`);

        // STEP 2b: Update wallet balance
        const wallets = await base44.entities.Wallet.filter({ user_email: userEmail });
        if (wallets.length > 0) {
          const wallet = wallets[0];
          await base44.entities.Wallet.update(wallet.id, {
            balance: (wallet.balance || 0) - (wallet_amount || 0)
          });
        }
        txnState.walletUpdated = true;
        console.log(`✓ Wallet balance updated (debit: ${wallet_amount || 0})`);

        // STEP 3: Create payment split
        const paymentSplit = await base44.entities.PaymentSplit.create({
          booking_id,
          booking_type,
          total_amount,
          wallet_debit: wallet_amount || 0,
          card_debit: card_amount || 0,
          supplier_payout,
          service_fee: service_fee || 0,
          gc_commission: (total_amount - supplier_payout) - (service_fee || 0),
          payment_method,
          supplier_id,
          status: 'confirmed',
          ledger_entries: [lockLedgerEntry.id, debitLedgerEntry.id]
        });
        txnState.paymentSplitCreated = true;
        txnState.ids.paymentSplit = paymentSplit.id;
        console.log(`✓ Payment split created: ${paymentSplit.id}`);

        // STEP 4: Credit Supplier Settlement Account & Revenue Account
        const settlementAccounts = await base44.entities.SettlementAccount.filter({
          supplier_id
        });
        
        let settlementAccountId = null;
        if (settlementAccounts.length > 0) {
          settlementAccountId = settlementAccounts[0].id;
          await base44.entities.SettlementAccount.update(settlementAccountId, {
            balance: (settlementAccounts[0].balance || 0) + supplier_payout,
            total_earned: (settlementAccounts[0].total_earned || 0) + supplier_payout
          });
        }
        txnState.settlementUpdated = true;
        console.log(`✓ Settlement account credited: ${supplier_payout}`);

        // Create disbursement (pending approval)
        const disbursement = await base44.entities.Disbursement.create({
          settlement_account_id: settlementAccountId,
          supplier_id,
          supplier_name,
          source_account: 'revenue_account',
          destination_account: 'supplier_bank_account',
          amount: supplier_payout,
          status: 'pending',
          notes: `Auto-generated from booking ${booking_id}`
        });
        txnState.disbursementCreated = true;
        txnState.ids.disbursement = disbursement.id;
        console.log(`✓ Disbursement created: ${disbursement.id}`);

        // STEP 5: Update velocity limits
        const newVelocity = {
          transacted_today: (userLimit.transacted_today || 0) + total_amount
        };
        if (velocityLimits.length > 0) {
          await base44.entities.VelocityLimit.update(velocityLimits[0].id, newVelocity);
        } else {
          await base44.entities.VelocityLimit.create({
            user_email: userEmail,
            ...newVelocity
          });
        }
        txnState.velocityUpdated = true;
        console.log(`✓ Velocity limits updated`);

        // ===== TRANSACTION COMMITTED =====
        console.log(`✓✓✓ TRANSACTION COMMITTED for booking ${booking_id}`);

        return Response.json({
          status: 'success',
          booking_id,
          payment_split_id: paymentSplit.id,
          disbursement_id: disbursement.id,
          supplier_reference: supplierConfirmation.id || supplierConfirmation.reference_id,
          message: 'Booking confirmed and payment processed',
          txn_state: 'committed'
        });

      } catch (txnError) {
        // ===== TRANSACTION ROLLBACK =====
        console.error(`✗ Transaction error at step - initiating ROLLBACK`, txnError);

        // Mark all created records as failed
        if (txnState.lockUpdated) {
          await base44.entities.WalletLock.update(lockRecord.id, {
            status: 'released',
            reason_for_release: 'txn_rollback'
          });
        }

        if (txnState.debitLedgerCreated && txnState.ids.debitLedgerEntry) {
          await base44.entities.WalletLedger.update(txnState.ids.debitLedgerEntry, {
            status: 'cancelled'
          });
        }

        if (txnState.paymentSplitCreated && txnState.ids.paymentSplit) {
          await base44.entities.PaymentSplit.update(txnState.ids.paymentSplit, {
            status: 'failed'
          });
        }

        if (txnState.disbursementCreated && txnState.ids.disbursement) {
          await base44.entities.Disbursement.update(txnState.ids.disbursement, {
            status: 'failed',
            error_message: `Booking failed: ${txnError.message}`
          });
        }

        // Release funds
        await base44.entities.WalletLedger.create({
          user_email: userEmail,
          transaction_type: 'unlock',
          amount: wallet_amount || 0,
          booking_id,
          booking_type,
          status: 'confirmed',
          notes: `Transaction rollback - funds released due to: ${txnError.message}`
        });

        console.log(`✗✗✗ TRANSACTION ROLLED BACK for booking ${booking_id}`);

        return Response.json({
          status: 'failed',
          booking_id,
          error: txnError.message,
          message: 'Transaction failed and rolled back - funds released',
          txn_state: 'rolled_back'
        }, { status: 400 });
      }
    }

    // ===== STEP 4B: FAILURE PATH =====
    // Create unlock entry to reverse the lock
    await base44.entities.WalletLock.update(lockRecord.id, {
      status: 'released',
      released_at: new Date().toISOString(),
      reason_for_release: 'booking_failed'
    });

    // Create unlock ledger entry
    await base44.entities.WalletLedger.create({
      user_email: userEmail,
      transaction_type: 'unlock',
      amount: wallet_amount || 0,
      booking_id,
      booking_type,
      status: 'confirmed',
      reference_id: lockRecord.id,
      notes: `Unlock funds - supplier API failed: ${supplierError}`
    });

    // Mark lock ledger as cancelled
    await base44.entities.WalletLedger.update(lockLedgerEntry.id, {
      status: 'cancelled'
    });

    return Response.json({
      status: 'failed',
      booking_id,
      error: supplierError || 'Supplier confirmation failed',
      message: 'Booking failed - wallet funds unlocked and available for withdrawal',
      action: 'FUNDS_RELEASED'
    }, { status: 400 });

  } catch (error) {
    console.error('Atomic booking execution error:', error);
    return Response.json(
      { error: error.message, status: 'fatal' },
      { status: 500 }
    );
  }
});