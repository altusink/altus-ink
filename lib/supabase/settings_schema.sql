-- Create a table to store global system configurations (CEO only access)
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general', -- 'payment', 'email', 'ai', 'general'
    is_secret BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

-- RLS: Only Admins/CEO can view and edit
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CEO can do everything on settings"
    ON public.system_settings
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'CEO'
        )
    );

-- Seed initial keys (Empty placeholders)
INSERT INTO public.system_settings (key, value, description, category, is_secret) VALUES
('stripe_public_key', '', 'Stripe Public Key (pk_test_...)', 'payment', false),
('stripe_secret_key', '', 'Stripe Secret Key (sk_test_...)', 'payment', true),
('mercadopago_token', '', 'Mercado Pago Access Token', 'payment', true),
('monthly_sales_goal', '50000', 'Monthly Sales Goal (EUR)', 'sales', false),
('resend_api_key', '', 'Resend API Key for Emails', 'email', true)
ON CONFLICT (key) DO NOTHING;
