import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { masterPassword, backupData, mode } = await req.json();
        const storedPassword = Deno.env.get("ADMIN_MASTER_PASSWORD");
        
        if (masterPassword !== storedPassword) {
            return Response.json({ error: 'Invalid master password' }, { status: 403 });
        }

        if (!backupData || !backupData.data) {
            return Response.json({ error: 'Invalid backup file format' }, { status: 400 });
        }

        const results = {
            success: [],
            errors: [],
            totalRecords: 0,
            restoredRecords: 0
        };

        // Restore data for each entity
        for (const [entityName, records] of Object.entries(backupData.data)) {
            if (!Array.isArray(records) || records.length === 0) continue;

            results.totalRecords += records.length;

            try {
                // Skip User entity restore for safety
                if (entityName === 'User') {
                    results.errors.push(`${entityName}: User data not restored for security`);
                    continue;
                }

                // Mode: 'merge' (add new) or 'replace' (clear and restore)
                if (mode === 'replace') {
                    // WARNING: This will delete existing data
                    const existing = await base44.asServiceRole.entities[entityName].list('-created_date', 10000);
                    for (const item of existing) {
                        await base44.asServiceRole.entities[entityName].delete(item.id);
                    }
                }

                // Restore records
                for (const record of records) {
                    try {
                        // Remove system fields before creating
                        const cleanRecord = { ...record };
                        delete cleanRecord.id;
                        delete cleanRecord.created_date;
                        delete cleanRecord.updated_date;
                        delete cleanRecord.created_by;

                        await base44.asServiceRole.entities[entityName].create(cleanRecord);
                        results.restoredRecords++;
                    } catch (err) {
                        results.errors.push(`${entityName} record: ${err.message}`);
                    }
                }

                results.success.push(`${entityName}: ${records.length} records restored`);
            } catch (error) {
                results.errors.push(`${entityName}: ${error.message}`);
            }
        }

        return Response.json({
            success: true,
            message: `Backup restored successfully`,
            details: results
        });
    } catch (error) {
        console.error('Restore error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});