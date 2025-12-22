
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { bookingId, title, price, quantity = 1 } = body;

        // 1. Verify User Session
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Create Preference
        const preference = new Preference(client);

        const result = await preference.create({
            body: {
                items: [
                    {
                        id: bookingId,
                        title: title, // e.g. "Tattoo Session with Artist Name"
                        quantity: Number(quantity),
                        unit_price: Number(price),
                        currency_id: 'BRL',
                    }
                ],
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_APP_URL}/booking-success?bookingId=${bookingId}&status=success`,
                    failure: `${process.env.NEXT_PUBLIC_APP_URL}/booking-success?bookingId=${bookingId}&status=failure`,
                    pending: `${process.env.NEXT_PUBLIC_APP_URL}/booking-success?bookingId=${bookingId}&status=pending`,
                },
                auto_return: 'approved',
                external_reference: bookingId, // Crucial for matching webhook
                notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mp`,
                statement_descriptor: "ALTUS INK",
            }
        });

        return NextResponse.json({ 
            init_point: result.init_point, // For production
            sandbox_init_point: result.sandbox_init_point, // For testing
            id: result.id 
        });

    } catch (error) {
        console.error('Mercado Pago Error:', error);
        return NextResponse.json({ error: 'Failed to create preference' }, { status: 500 });
    }
}
