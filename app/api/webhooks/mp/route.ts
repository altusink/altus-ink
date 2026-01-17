
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createAdminClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/resend';
import { createGoogleCalendarEvent } from '@/lib/google/calendar';

// Helper to get client (borrowed/imported logic would be better, but consistent inline for now or export from lib)
// We will import the logic functionality if possible or duplicate the DB lookup to avoid circular dep issues if any.
// Actually, let's look up the token same way as lib.

async function getMPClient() {
    const supabase = createAdminClient();
    try {
        const { data } = await supabase.from('integrations').select('config').eq('service_id', 'mercadopago').single();
         // @ts-ignore
        const token = data?.config?.apiKey || data?.config?.access_token || process.env.MP_ACCESS_TOKEN;
        if (token) return new MercadoPagoConfig({ accessToken: token });
    } catch(e) {}
    return null;
}

export async function POST(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const topic = url.searchParams.get('topic') || url.searchParams.get('type');
        const id = url.searchParams.get('id') || url.searchParams.get('data.id');

        if (topic === 'payment' && id) {
            const client = await getMPClient();
            if (!client) throw new Error('MP Configuration Missing');

            const payment = new Payment(client);
            const paymentData = await payment.get({ id });

            if (paymentData.status === 'approved') {
                const bookingId = paymentData.external_reference;
                
                // 1. Update Supabase (Admin Privilege)
                const supabase = createAdminClient();
                
                // Get Booking Connection
                const { data: booking } = await supabase.from('bookings').select('*, artists(*)').eq('id', bookingId).single();
                
                if (booking) {
                     await supabase
                    .from('bookings')
                    .update({ 
                        status: 'confirmed', 
                        payment_status: 'paid',
                        payment_id: id 
                    })
                    .eq('id', bookingId);
                
                    console.log(`✅ Payment approved for Booking ${bookingId}`);

                    // 2. Sync Google Calendar
                    await createGoogleCalendarEvent(booking);

                    // 3. Send Email
                    await sendEmail({
                        to: booking.client_email,
                        type: 'confirmation',
                        variables: {
                            name: booking.client_name,
                            date: booking.start_time,
                            artist: booking.artists?.stage_name || 'Altus Ink',
                            link: `https://altusink.com/portal/${booking.id}`
                        }
                    });

                    // 4. Send WhatsApp
                    const { sendWhatsApp } = await import('@/lib/services/whatsapp');
                    await sendWhatsApp({
                        phone: booking.client_phone,
                        text: `Olá ${booking.client_name}! Seu agendamento foi confirmado com sucesso. Data: ${new Date(booking.start_time).toLocaleString('pt-BR')}. Acesse os detalhes aqui: https://altusink.com/portal/${booking.id}`
                    });
                }
            }
        }

        return NextResponse.json({ status: 'OK' });
    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Webhook Handler Failed' }, { status: 500 });
    }
}
