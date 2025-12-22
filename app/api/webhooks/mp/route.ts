
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });

export async function POST(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const topic = url.searchParams.get('topic') || url.searchParams.get('type');
        const id = url.searchParams.get('id') || url.searchParams.get('data.id');

        if (topic === 'payment' && id) {
            const payment = new Payment(client);
            const paymentData = await payment.get({ id });

            if (paymentData.status === 'approved') {
                const bookingId = paymentData.external_reference;
                
                // Update Supabase
                const supabase = createClient();
                // Note: using Service Context would be better here if RLS blocks, 
                // but usually webhooks need a service role key. 
                // For now, assuming basic update works or this runs in a context that allows it.
                // TODO: Ensure we use Service Role for webhooks.

                await supabase
                    .from('bookings')
                    .update({ 
                        status: 'confirmed', 
                        payment_status: 'paid',
                        payment_id: id 
                    })
                    .eq('id', bookingId);
                
                console.log(`✅ Payment approved for Booking ${bookingId}`);
            }
        }

        return NextResponse.json({ status: 'OK' });
    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Webhook Handler Failed' }, { status: 500 });
    }
}
