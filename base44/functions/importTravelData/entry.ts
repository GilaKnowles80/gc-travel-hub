import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { fileUrl, dataType } = await req.json();

    if (!fileUrl || !dataType) {
      return Response.json({ error: 'Missing fileUrl or dataType' }, { status: 400 });
    }

    // Fetch file content
    const fileResponse = await fetch(fileUrl);
    const fileContent = await fileResponse.text();

    let records = [];
    const fileName = fileUrl.toLowerCase();

    // Parse based on file type
    if (fileName.endsWith('.json')) {
      records = JSON.parse(fileContent);
    } else if (fileName.endsWith('.csv')) {
      // Simple CSV parsing
      const lines = fileContent.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(',').map(v => v.trim());
        const record = {};
        headers.forEach((header, idx) => {
          record[header] = values[idx];
        });
        records.push(record);
      }
    } else {
      return Response.json({ error: 'Unsupported file format. Use JSON or CSV' }, { status: 400 });
    }

    if (!Array.isArray(records)) {
      records = [records];
    }

    // Map dataType to entity
    const entityMap = {
      flights: 'Flight',
      hotels: 'Hotel',
      tours: 'Tour',
      visas: 'Visa',
      ferry: 'FerryBooking',
      bus: 'BusBooking',
      car: 'CarRentalBooking',
      insurance: 'TravelInsurance'
    };

    const entityName = entityMap[dataType];
    if (!entityName) {
      return Response.json({ error: 'Invalid dataType' }, { status: 400 });
    }

    // Bulk insert with service role
    const results = await base44.asServiceRole.entities[entityName].bulkCreate(records);

    return Response.json({
      success: true,
      imported: records.length,
      dataType,
      message: `Successfully imported ${records.length} ${dataType} records`
    });

  } catch (error) {
    console.error('Import error:', error);
    return Response.json({ 
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
});