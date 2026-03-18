import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googleslides');

    // Create new presentation
    const createResponse = await fetch(
      'https://slides.googleapis.com/v1/presentations',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'GC Travel & Tours - Client Pitch Deck'
        })
      }
    );

    if (!createResponse.ok) {
      throw new Error('Failed to create presentation');
    }

    const presentationData = await createResponse.json();
    const presentationId = presentationData.presentationId;

    // Prepare batch update requests
    const requests = [
      // Slide 1: Title Slide
      {
        addSlide: {
          objectId: 'title_slide',
          insertIndex: 0,
          slideLayout: {
            predefinedLayout: 'TITLE_SLIDE'
          }
        }
      },
      {
        updateTextStyle: {
          objectId: 'title_slide',
          fields: 'foregroundColor,fontSize,bold',
          style: {
            foregroundColor: {
              opaqueColor: {
                rgbColor: {
                  red: 0.14,
                  green: 0.51,
                  blue: 0.82
                }
              }
            },
            fontSize: {
              magnitude: 54,
              unit: 'PT'
            },
            bold: true
          },
          textRange: {
            type: 'ALL'
          }
        }
      },
      // Slide 2: About Us
      {
        addSlide: {
          objectId: 'about_slide',
          insertIndex: 1,
          slideLayout: {
            predefinedLayout: 'TITLE_AND_BODY'
          }
        }
      },
      // Slide 3: Services
      {
        addSlide: {
          objectId: 'services_slide',
          insertIndex: 2,
          slideLayout: {
            predefinedLayout: 'TITLE_AND_BODY'
          }
        }
      },
      // Slide 4: Why Choose Us
      {
        addSlide: {
          objectId: 'why_slide',
          insertIndex: 3,
          slideLayout: {
            predefinedLayout: 'TITLE_AND_BODY'
          }
        }
      },
      // Slide 5: Global Reach
      {
        addSlide: {
          objectId: 'reach_slide',
          insertIndex: 4,
          slideLayout: {
            predefinedLayout: 'TITLE_AND_BODY'
          }
        }
      },
      // Slide 6: Testimonials
      {
        addSlide: {
          objectId: 'testimonial_slide',
          insertIndex: 5,
          slideLayout: {
            predefinedLayout: 'TITLE_AND_BODY'
          }
        }
      },
      // Slide 7: Pricing & Packages
      {
        addSlide: {
          objectId: 'pricing_slide',
          insertIndex: 6,
          slideLayout: {
            predefinedLayout: 'TITLE_AND_BODY'
          }
        }
      },
      // Slide 8: Contact & CTA
      {
        addSlide: {
          objectId: 'contact_slide',
          insertIndex: 7,
          slideLayout: {
            predefinedLayout: 'TITLE_SLIDE'
          }
        }
      }
    ];

    // Execute batch update
    const updateResponse = await fetch(
      `https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requests })
      }
    );

    if (!updateResponse.ok) {
      throw new Error('Failed to create slides');
    }

    const presentationUrl = `https://docs.google.com/presentation/d/${presentationId}/edit`;

    return Response.json({
      success: true,
      presentationId,
      presentationUrl,
      message: 'Pitch deck created successfully! Open in Google Slides to customize with your branding.'
    });
  } catch (error) {
    console.error('Error creating pitch deck:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});