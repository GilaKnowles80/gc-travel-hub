import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { destination = 'Travel Destination', duration = 5, title } = body;

    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googledocs');

    // Create new document
    const createResponse = await fetch(
      'https://docs.googleapis.com/v1/documents',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title || `${destination} - ${duration} Day Itinerary`
        })
      }
    );

    if (!createResponse.ok) {
      throw new Error('Failed to create document');
    }

    const docData = await createResponse.json();
    const docId = docData.documentId;

    // Prepare itinerary content
    const dayDivisions = Array.from({ length: duration }, (_, i) => i + 1);
    const contentRequests = [
      {
        insertText: {
          text: `${destination} - ${duration} Day Itinerary\n\n`,
          location: { index: 1 }
        }
      },
      {
        updateTextStyle: {
          range: {
            startIndex: 1,
            endIndex: destination.length + duration.toString().length + 18
          },
          textStyle: {
            bold: true,
            fontSize: { magnitude: 28, unit: 'PT' }
          },
          fields: 'bold,fontSize'
        }
      }
    ];

    // Add day-by-day outlines
    let currentIndex = destination.length + duration.toString().length + 20;

    dayDivisions.forEach((day) => {
      const dayContent = `\n\nDay ${day}\n`;
      contentRequests.push({
        insertText: {
          text: dayContent,
          location: { index: currentIndex }
        }
      });

      currentIndex += dayContent.length;

      // Add day details template
      const detailsContent = `Destination: \nActivities: \n• \n• \n• \nMeals: Breakfast - \nLunch - \nDinner - \nAccommodation: \nNotes: \n`;
      
      contentRequests.push({
        insertText: {
          text: detailsContent,
          location: { index: currentIndex }
        }
      });

      currentIndex += detailsContent.length;
    });

    // Add footer sections
    const footerContent = `\n\nAdditional Information\n\nVisa Requirements: \n\nBest Time to Visit: \n\nLocal Currency: \n\nLanguage: \n\nContact Information: \n\nEmergency Contacts: \n\nTravel Insurance Details: \n\nParking & Transportation: \n`;

    contentRequests.push({
      insertText: {
        text: footerContent,
        location: { index: currentIndex }
      }
    });

    // Apply formatting
    const updateResponse = await fetch(
      `https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requests: contentRequests })
      }
    );

    if (!updateResponse.ok) {
      throw new Error('Failed to format document');
    }

    const docUrl = `https://docs.google.com/document/d/${docId}/edit`;

    return Response.json({
      success: true,
      documentId: docId,
      documentUrl: docUrl,
      destination,
      duration,
      message: 'Travel itinerary template created successfully!'
    });
  } catch (error) {
    console.error('Error creating itinerary document:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});