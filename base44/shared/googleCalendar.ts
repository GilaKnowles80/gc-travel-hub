// Shared Google Calendar helper used by the tour & flight "add to calendar"
// backend functions. Creates an event on the connected (shared) googlecalendar
// connector's primary calendar. Never throws — returns a graceful result so
// workflow runs stay green even when the connector isn't authorized yet.
//
// Result shapes:
//   { ok: true, event_id, event_link }
//   { ok: false, reason: 'not_connected' | 'api_error' | 'exception', message? }

export async function createCalendarEvent(base44, event) {
  let accessToken = null;
  try {
    const connection = await base44.asServiceRole.connectors.getConnection('googlecalendar');
    accessToken =
      connection?.accessToken ||
      connection?.token ||
      (typeof connection === 'string' ? connection : null);
  } catch (error) {
    return { ok: false, reason: 'exception', message: error.message };
  }

  if (!accessToken) {
    return {
      ok: false,
      reason: 'not_connected',
      message: 'Google Calendar connector is not authorized',
    };
  }

  try {
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GOOGLE CALENDAR] API error:', errorText);
      return { ok: false, reason: 'api_error', message: errorText };
    }

    const data = await response.json();
    return { ok: true, event_id: data.id, event_link: data.htmlLink };
  } catch (error) {
    console.error('[GOOGLE CALENDAR] error:', error.message);
    return { ok: false, reason: 'exception', message: error.message };
  }
}