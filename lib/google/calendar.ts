import { google } from 'googleapis'

// Scopes required for the API
const SCOPES = ['https://www.googleapis.com/auth/calendar']

// Initialize JWT Client
// We use Environment Variables for security. 
// The user will need to add these to .env.local and Vercel.
import { adminOS } from '@/lib/services/admin-os'

// ... scopes ...

const getAuthClient = async () => {
    let clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    let privateKey = process.env.GOOGLE_PRIVATE_KEY
    
    // Try DB First
    try {
        const integrations = await adminOS.getIntegrations();
        const googleConfig = integrations.find(i => i.service_id === 'google_calendar' && i.is_active);
        
        if (googleConfig?.config && typeof googleConfig.config === 'object') {
             // Expecting config to store the JSON object or fields
             // @ts-ignore
             if (googleConfig.config.client_email) clientEmail = googleConfig.config.client_email;
             // @ts-ignore
             if (googleConfig.config.private_key) privateKey = googleConfig.config.private_key;
        }
    } catch (e) {
        // Fallback to env
    }

    if (!clientEmail || !privateKey) {
        console.warn('⚠️ Google Calendar Params missing. Sync skipped.')
        return null
    }

    // Fix newlines if coming from Env/DB string
    const formattedKey = privateKey.replace(/\\n/g, '\n')

    return new google.auth.JWT(
        clientEmail,
        undefined,
        formattedKey,
        SCOPES
    )
}

export async function createGoogleCalendarEvent(booking: any) {
    const auth = await getAuthClient()
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
