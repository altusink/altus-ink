import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { z } from 'zod'
import { createGoogleCalendarEvent } from '@/lib/google/calendar'
import { syncClientFromBooking } from '@/app/lib/crm-internal'
import { sendEmail } from '@/lib/email/sender'
import { WELCOME_EMAIL_TEMPLATE } from '@/lib/email/templates'

const bookingSchema = z.object({
    artistId: z.string().uuid(),
    clientName: z.string().min(2),
    clientEmail: z.string().email(),
    clientPhone: z.string().min(10),
    clientLanguage: z.string().default('pt-BR'),
    bookingDate: z.string(),
    bookingTime: z.string(),
    durationHours: z.number().positive(),
    tattooType: z.enum(['small', 'medium', 'large', 'extra-large', 'xl', 'coverup']), // Expanded enum to match frontend
    tattooDescription: z.string().optional(),
    bodyLocation: z.string().optional(),
    referenceImages: z.array(z.string()).default([]),
    estimatedPrice: z.number().nullable().optional(), // Allow nullable/optional
    depositAmount: z.number().positive(),
    paymentMethod: z.enum(['stripe', 'pix_manual', 'studio', 'wise', 'pix', 'credit_card']).default('stripe'), // New Field
    healthForm: z.object({
        allergies: z.string().optional(),
        medications: z.string().optional(),
        medicalConditions: z.string().optional(),
        pregnant: z.boolean().optional(),
    }).optional(),
})

export async function POST(request: NextRequest) {
    const supabaseAdmin = createAdminClient()
    try {
        const body = await request.json()
        const data = bookingSchema.parse(body)

        // Create booking in database
        const { data: booking, error: bookingError } = await supabaseAdmin
            .from('bookings')
            .insert({
                artist_id: data.artistId,
                client_name: data.clientName,
                client_email: data.clientEmail,
                client_phone: data.clientPhone,
                client_language: data.clientLanguage,
                booking_date: data.bookingDate,
                booking_time: data.bookingTime,
                duration_hours: data.durationHours,
                tattoo_type: data.tattooType,
                tattoo_description: data.tattooDescription,
                body_location: data.bodyLocation,
                reference_images: data.referenceImages,
                estimated_price: data.estimatedPrice || 0,
                deposit_amount: data.depositAmount,
                payment_method: data.paymentMethod, // Save method
                health_form: {
                    ...data.healthForm,
                    terms_accepted: true,
                    terms_accepted_at: new Date().toISOString()
                },
                status: 'PENDING',
            })
            .select()
            .single()

        if (bookingError) {
            console.error('Booking creation error:', bookingError)
            return NextResponse.json(
                { error: 'Failed to create booking' },
                { status: 500 }
            )
        }

        // 🚀 Sync to Google Calendar (Fire and Forget)
        // We don't await this to keep UI fast. We just log errors.
        createGoogleCalendarEvent(booking)
            .then(res => {
                if(res.success) console.log('Google Calendar Sync:', res.link)
                else console.error('Google Sync Failed:', res.error)
            })
            .catch(err => console.error('Google Sync Crash:', err))

        // 🧠 CRM Sync (Fire and Forget)
        syncClientFromBooking({
            email: booking.client_email,
            name: booking.client_name,
            phone: booking.client_phone,
            bookingDate: booking.booking_date,
            price: booking.estimated_price || 0
        }).catch(err => console.error('CRM Sync Crash:', err))

        // 📧 Send Welcome Email (Fire and Forget)
        const welcomeHtml = WELCOME_EMAIL_TEMPLATE(
            booking.client_name,
            `${booking.booking_date} às ${booking.booking_time}`,
            'Equipe Altus Ink', // Or fetch artist name if available (we only have ID here efficiently)
            booking.id
        );
        
        sendEmail({
            to: booking.client_email,
            subject: 'Agendamento Confirmado - Altus Ink',
            html: welcomeHtml
        }).then(res => res.success ? console.log('Email sent') : console.error('Email failed', res.error));

        // --- Payment Logic Branching ---

        // 1. Stripe Payment
        if (data.paymentMethod === 'stripe') {
            try {
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: Math.round(data.depositAmount * 100), // Convert to cents
                    currency: 'eur',
                    automatic_payment_methods: { enabled: true },
                    metadata: {
                        bookingId: booking.id,
                        clientEmail: data.clientEmail,
                        clientName: data.clientName,
                    },
                    description: `Deposit for tattoo booking - ${data.clientName}`,
                    receipt_email: data.clientEmail,
                })

                // Update booking with payment intent ID
                await supabaseAdmin
                    .from('bookings')
                    .update({ payment_intent_id: paymentIntent.id })
                    .eq('id', booking.id)

                return NextResponse.json({
                    bookingId: booking.id,
                    clientSecret: paymentIntent.client_secret,
                })
            } catch (stripeError) {
                console.error('Stripe Error:', stripeError)
                return NextResponse.json(
                    { error: 'Payment initialization failed. Please try "Euro Transfer" or contact support.', bookingId: booking.id },
                    { status: 500 }
                )
            }
        }

        // 2. Wise Transfer (Manual / Semi-Automated Intent)
        else if (data.paymentMethod === 'wise') {
            return NextResponse.json({
                bookingId: booking.id,
                success: true,
                method: 'wise',
                instructions: {
                    bankName: 'Wise Europe SA',
                    iban: 'BE12 3456 7890 1234', // TO BE REPLACED WITH REAL IBAN
                    bic: 'WISEBEBB',
                    accountHolder: 'Altus Ink Studio',
                    reference: `REF-${booking.id.split('-')[0].toUpperCase()}`
                }
            })
        }

        // 3. Pix (Mercado Pago - Automated)
        else if (data.paymentMethod === 'pix') {
            try {
                const { createPixPayment, getEurToBrlRate } = await import('@/lib/mercadopago');
                const rate = await getEurToBrlRate();
                const brlAmount = Math.ceil(data.depositAmount * rate * 100) / 100;

                const pixPayment = await createPixPayment({
                    amount: brlAmount,
                    email: data.clientEmail,
                    firstName: data.clientName.split(' ')[0],
                    description: `Deposit - ${data.clientName} (EUR ${data.depositAmount})`
                });

                await supabaseAdmin
                    .from('bookings')
                    .update({
                        payment_intent_id: pixPayment.id,
                        payment_status: 'pending',
                        metadata: {
                            ...booking.metadata,
                            pix_qr: pixPayment.qr_code,
                            pix_qr_base64: pixPayment.qr_code_base64,
                            pix_amount_brl: brlAmount,
                            pix_rate: rate
                        }
                    })
                    .eq('id', booking.id)

                return NextResponse.json({
                    bookingId: booking.id,
                    success: true,
                    method: 'pix',
                    pixData: pixPayment
                });

            } catch (mpError) {
                console.error("Mercado Pago Error during Booking:", mpError);
                return NextResponse.json(
                    { error: 'Pix generation failed. Please try again or use Wise.', bookingId: booking.id },
                    { status: 500 }
                )
            }
        }

        // 4. Default / Fallback Manual
        else {
            return NextResponse.json({
                bookingId: booking.id,
                success: true, // Signal frontend to redirect directly
                method: data.paymentMethod
            })
        }

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.errors },
                { status: 400 }
            )
        }

        console.error('Booking API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    const supabaseAdmin = createAdminClient()
    try {
        const { searchParams } = new URL(request.url)
        const artistId = searchParams.get('artistId')
        const status = searchParams.get('status')

        let query = supabaseAdmin.from('bookings').select('*')

        if (artistId) {
            query = query.eq('artist_id', artistId)
        }

        if (status) {
            query = query.eq('status', status)
        }

        const { data, error } = await query.order('booking_date', { ascending: true })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ bookings: data })
    } catch (error) {
        console.error('Get bookings error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
