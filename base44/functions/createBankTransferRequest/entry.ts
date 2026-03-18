import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, bankName, accountName } = await req.json();

    if (!amount || amount <= 0) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Create bank transfer request record
    const transferRequest = await base44.asServiceRole.entities.BankTransfer.create({
      user_email: user.email,
      amount,
      bank_name: bankName,
      account_holder_name: accountName,
      status: 'pending',
      reference_number: `BT-${user.email}-${Date.now()}`,
      created_date: new Date().toISOString(),
      notes: 'Bank transfer deposit request'
    });

    // Create ledger entry for audit trail
    await base44.asServiceRole.entities.WalletLedger.create({
      user_email: user.email,
      transaction_type: 'load',
      amount,
      status: 'pending',
      reference_id: transferRequest.id,
      notes: `Bank transfer pending: ${bankName} - ${accountName}`,
      currency: 'PHP'
    });

    console.log(`Bank transfer request created for ${user.email}: ${transferRequest.id}`);

    // Return bank details for user to complete transfer
    return Response.json({
      success: true,
      requestId: transferRequest.id,
      referenceNumber: transferRequest.reference_number,
      amount,
      message: 'Bank transfer request created. Please complete the transfer to finalize.',
      bankDetails: {
        bankName: 'GC Travel & Tours',
        accountNumber: 'XXXXXXXXXX', // Should be from your actual bank account
        accountType: 'Checking',
        swiftCode: 'SWIFTCODE',
        notes: `Reference: ${transferRequest.reference_number}`
      }
    });
  } catch (error) {
    console.error('Bank transfer request error:', error);
    return Response.json(
      { error: error.message || 'Failed to create bank transfer request' },
      { status: 500 }
    );
  }
});