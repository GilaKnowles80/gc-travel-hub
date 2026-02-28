import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get access token for Google Drive
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googledrive');
    
    // Fetch all itineraries
    const itineraries = await base44.asServiceRole.entities.Itinerary.list();
    
    let synced = 0;
    let errors = [];

    // Create or update files in Google Drive for each itinerary
    for (const itinerary of itineraries) {
      try {
        // Prepare itinerary content
        const content = `# ${itinerary.title}

**Destination:** ${itinerary.destination}
**Duration:** ${itinerary.start_date} to ${itinerary.end_date}
**Owner:** ${itinerary.user_email}

## Itinerary Items

${itinerary.items?.map(item => `
### ${item.booking_type.toUpperCase()}
- Booking ID: ${item.booking_id}
- Date: ${item.start_date} to ${item.end_date}
`).join('\n') || 'No items'}

## Notes
${itinerary.notes || 'No additional notes'}
`;

        // Create or update file in Google Drive
        const fileName = `${itinerary.title.replace(/[^a-z0-9]/gi, '_')}_${itinerary.id}.md`;
        
        // Search for existing file
        const searchResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=name='${fileName}'`,
          {
            headers: { Authorization: `Bearer ${accessToken}` }
          }
        );
        
        const searchData = await searchResponse.json();
        const existingFile = searchData.files?.[0];

        if (existingFile) {
          // Update existing file
          await fetch(
            `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`,
            {
              method: 'PATCH',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'text/markdown'
              },
              body: content
            }
          );
        } else {
          // Create new file
          const createResponse = await fetch(
            'https://www.googleapis.com/drive/v3/files?uploadType=multipart',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                name: fileName,
                mimeType: 'text/markdown',
                description: `GC Travel itinerary for ${itinerary.destination}`
              })
            }
          );

          if (createResponse.ok) {
            const fileData = await createResponse.json();
            
            // Upload content
            await fetch(
              `https://www.googleapis.com/upload/drive/v3/files/${fileData.id}?uploadType=media`,
              {
                method: 'PATCH',
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'text/markdown'
                },
                body: content
              }
            );
          }
        }

        synced++;
      } catch (error) {
        errors.push(`Failed to sync itinerary ${itinerary.id}: ${error.message}`);
      }
    }

    return Response.json({
      success: true,
      synced,
      total: itineraries.length,
      errors: errors.length > 0 ? errors : null
    });
  } catch (error) {
    console.error('Sync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});