import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import MercadoPagoConfig, { Payment } from 'mercadopago';
import { sendEmail } from '@/lib/email/sender';

// Helper to get client (duplicating lib logic to avoid circular deps or just import it)
// We'll import it from lib to be consistent and secure
// Actually, let's keep it self-contained or import `getMercadoPagoClient` if exposed
// To stay clean, we'll re-implement the fetch logic quickly or better: expose it in lib.
// Let's assume we can import the client logic or just copy "fetch token" logic.

async function getClient() {
    let accessToken = process.env.MP_ACCESS_TOKEN;
    try {
        const supabase = createAdminClient();
        const { data } = await supabase.from('system_settings').select('value').eq('key', 'mp_access_token').single();
        if (data?.value) accessToken = data.value;
    } catch(e) {}
    
    if (!accessToken) return null;
    return new MercadoPagoConfig({ accessToken });
}

export async function POST(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const topic = url.searchParams.get('topic') || url.searchParams.get('type');
        const id = url.searchParams.get('id') || url.searchParams.get('data.id');

        // MP sends notifications via POST body usually too
        const body = await request.json().catch(() => ({})); 

        // Check if it's a payment notification
        const paymentId = id || body?.data?.id;
        const type = topic || body?.type;

        if (type !== 'payment') {
            return NextResponse.json({ status: 'ignored_type' }); // We only care about payments
        }

        if (!paymentId) {
             return NextResponse.json({ status: 'ignored_no_id' });
        }

        const client = await getClient();
        if (!client) {
            console.error('Webhook Error: No MP Token found');
            return NextResponse.json({ error: 'Configuration Missing' }, { status: 500 });
        }

        const payment = new Payment(client);
        const paymentData = await payment.get({ id: paymentId });
        
        const status = paymentData.status; // 'approved', 'pending', 'rejected'
        const externalReference = paymentData.external_reference; // This IS our booking ID

        if (!externalReference) {
            console.warn('Webhook: Payment without external_reference (Booking ID)', paymentId);
            return NextResponse.json({ status: 'ignored_no_ref' });
        }

        // Logic: If approved, update booking
        if (status === 'approved') {
            const supabase = createAdminClient();
            
            // 1. Update Booking
            const { data: booking, error } = await supabase
                .from('bookings')
                .update({ 
                    status: 'CONFIRMED',
                    payment_status: 'paid',
                    deposit_amount: paymentData.transaction_amount // Confirm actual amount paid?
                })
                .eq('id', externalReference)
                .select()
                .single();

            if (error) {
                console.error('Webhook DB Error:', error);
                return NextResponse.json({ error: 'DB Update Failed' }, { status: 500 });
            }

            // 2. Send "Payment Received" Email (Optional but good)
            if (booking) {
                await sendEmail({
                   to: booking.client_email,
                   subject: 'Pagamento Confirmado! 🎨 - Altus Ink',
                   html: `<h1>Pagamento Recebido!</h1><p>Seu sinal de R$ ${paymentData.transaction_amount} foi confirmado via Pix.</p><p>Seu agendamento para <strong>${booking.booking_date}</strong> está 100% garantido.</p>`
                });
            }

            console.log(`✅ Booking ${externalReference} confirmed via Pix Webhook!`);
        }

        return NextResponse.json({ status: 'ok', payment_status: status });

    } catch (error) {
        console.error('Webhook Handler Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
