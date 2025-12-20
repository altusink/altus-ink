import { google } from 'googleapis'

// Scopes required for the API
const SCOPES = ['https://www.googleapis.com/auth/calendar']

// Initialize JWT Client
// We use Environment Variables for security. 
// The user will need to add these to .env.local and Vercel.
const getAuthClient = () => {
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') // Fix newlines for Vercel

    if (!clientEmail || !privateKey) {
        console.warn('⚠️ Google Calendar Params missing. Sync skipped.')
        return null
    }

    return new google.auth.JWT(
        clientEmail,
        undefined,
        privateKey,
        SCOPES
    )
}

export async function createGoogleCalendarEvent(booking: any) {
    const auth = getAuthClient()
    if (!auth) return { success: false, error: 'credentials_missing' }

    const calendar = google.calendar({ version: 'v3', auth })

    // Calculate Start/End
    // booking.booking_date (YYYY-MM-DD) + booking.booking_time (HH:MM)
    const startDateTime = new Date(`${booking.booking_date}T${booking.booking_time}:00`)
    const duration = booking.duration_hours || 4
    const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 60 * 1000)

    const event = {
        summary: `🟢 Tattoo: ${booking.client_name}`,
        description: `
        Cliente: ${booking.client_name}
        Email: ${booking.client_email}
        Telefone: ${booking.client_phone}
        Estilo: ${booking.tattoo_type}
        Local: ${booking.body_location}
        
        Link Admin: https://altusink.com/admin/bookings?id=${booking.id}
        `,
        start: {
            dateTime: startDateTime.toISOString(),
            timeZone: 'Europe/Lisbon', // Default Studio Timezone
        },
        end: {
            dateTime: endDateTime.toISOString(),
            timeZone: 'Europe/Lisbon',
        },
        colorId: '2', // Green (Sage)
    }

    try {
        const res = await calendar.events.insert({
            calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
            requestBody: event,
        })
        console.log('📅 Google Event Created:', res.data.htmlLink)
        return { success: true, link: res.data.htmlLink }
    } catch (error) {
        console.error('❌ Google Calendar Error:', error)
        return { success: false, error }
    }
}
