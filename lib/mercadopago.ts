 import MercadoPagoConfig, { Payment, Preference } from 'mercadopago';
import { createAdminClient } from '@/lib/supabase/server';

// Initialize Client Dynamically
async function getMercadoPagoClient() {
    let accessToken = process.env.MP_ACCESS_TOKEN;

    // Try DB (Integrations Table)
    try {
        const supabase = createAdminClient();
        const { data } = await supabase
            .from('integrations')
            .select('config, is_active')
            .eq('service_id', 'mercadopago')
            .single();
        
        if (data?.is_active && data.config) {
             // Expecting config to be { apiKey: "..." } or similar
             // @ts-ignore
             if (data.config.apiKey) accessToken = data.config.apiKey;
             // @ts-ignore
             if (data.config.access_token) accessToken = data.config.access_token;
        }
    } catch (e) {
        // Fallback
    }

    if (!accessToken) return null;

    return new MercadoPagoConfig({ accessToken });
}

interface PreferenceRequest {
    title: string;
    description: string;
    quantity: number;
    currency_id: 'BRL';
    unit_price: number;
    email: string;
    bookingId: string;
}

export async function createPreference(data: PreferenceRequest) {
    const client = await getMercadoPagoClient();

    if (!client) {
        console.warn("⚠️ Mercado Pago Token missing! Returning Mock Preference.");
        return { id: 'mock_pref_123', init_point: 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=mock' };
    }

    try {
        const preference = new Preference(client);
        const result = await preference.create({
            body: {
                items: [
                    {
                        id: data.bookingId,
                        title: data.title,
                        description: data.description,
                        quantity: 1,
                        currency_id: 'BRL',
                        unit_price: data.unit_price
                    }
                ],
                payer: {
                    email: data.email
                },
                external_reference: data.bookingId,
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/booking-success?bookingId=${data.bookingId}`,
                    failure: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/agendar?error=payment_failed`,
                    pending: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/booking-success?bookingId=${data.bookingId}&pending=true`
                },
                auto_return: 'approved',
                statement_descriptor: 'ALTUS INK',
            }
        });

        return {
            id: result.id,
            init_point: result.init_point, // For production
            sandbox_init_point: result.sandbox_init_point // For testing
        };
    } catch (error) {
        console.error("MP Preference Error:", error);
        throw error;
    }
}

interface PixPaymentRequest {
    amount: number; // in BRL
    email: string;
    description: string;
    firstName: string;
}

interface PixPaymentResponse {
    id: string; // MP Payment ID or Mock ID
    qr_code: string; // Copy Paste Code
    qr_code_base64: string; // Initial QR Image
    ticket_url: string; // Link to receipt/payment page
    status: string;
    mock?: boolean;
}

export async function createPixPayment(data: PixPaymentRequest): Promise<PixPaymentResponse> {
    const client = await getMercadoPagoClient();

    // 1. If no token, return MOCK data
    if (!client) {
        console.warn("⚠️ Mercado Pago Token missing! Returning MOCK Pix data.");
        return {
            id: `mock_${Date.now()}`,
            qr_code: "00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913Altus Ink Mock6009Sao Paulo62070503***6304E2CA",
            qr_code_base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", 
            ticket_url: "https://altus-ink.vercel.app/mock-payment",
            status: "pending",
            mock: true
        };
    }

    // 2. Real Integration
    try {
        const payment = new Payment(client);

        const result = await payment.create({
            body: {
                transaction_amount: data.amount,
                description: data.description,
                payment_method_id: 'pix',
                payer: {
                    email: data.email,
                    first_name: data.firstName
                },
            }
        });

        return {
            id: result.id!.toString(),
            qr_code: result.point_of_interaction?.transaction_data?.qr_code || '',
            qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64 || '',
            ticket_url: result.point_of_interaction?.transaction_data?.ticket_url || '',
            status: result.status || 'pending'
        };

    } catch (error) {
        console.error("Mercado Pago Error:", error);
        throw new Error("Failed to create Pix payment");
    }
}

export async function getEurToBrlRate(): Promise<number> {
    try {
        const res = await fetch("https://economia.awesomeapi.com.br/last/EUR-BRL", {
            next: { revalidate: 300 } // Cache for 5 minutes
        });

        if (!res.ok) throw new Error("AwesomeAPI Error");

        const data = await res.json();
        const rate = parseFloat(data.EURBRL.bid);
        return rate;
    } catch (error) {
        console.error("Currency Conversion Error:", error);
        return 6.20; // Fallback safe rate
    }
}
