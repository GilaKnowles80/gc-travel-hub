import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { transactions, batchSize = 50 } = await req.json();

    if (!transactions || !Array.isArray(transactions)) {
      return Response.json({ error: 'Invalid transactions array' }, { status: 400 });
    }

    const results = {
      total: transactions.length,
      processed: 0,
      failed: 0,
      errors: []
    };

    // Process in batches to avoid congestion
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      
      try {
        // Process batch with service role for efficiency
        await base44.asServiceRole.entities.Payment.bulkCreate(batch);
        results.processed += batch.length;
        
        // Small delay between batches to prevent overwhelming the system
        if (i + batchSize < transactions.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Batch ${i}-${i + batchSize} failed:`, error);
        results.failed += batch.length;
        results.errors.push({
          batch: `${i}-${i + batchSize}`,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      results,
      message: `Processed ${results.processed}/${results.total} transactions`
    });

  } catch (error) {
    console.error('Transaction queue error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});