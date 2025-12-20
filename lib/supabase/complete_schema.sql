-- ==========================================
-- 1. SYSTEM SETTINGS (Plug & Play)
-- ==========================================
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    description TEXT,
    is_secret BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES users(id)
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Only CEO can view/edit
CREATE POLICY "CEO Full Access Settings" ON system_settings
    USING (auth.uid() IN (SELECT id FROM users WHERE role = 'CEO'))
    WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'CEO'));

-- Public Read for specific keys (Stripe Public Key)
CREATE POLICY "Public Read Specific Keys" ON system_settings
    FOR SELECT USING (key IN ('stripe_public_key', 'sales_goal_monthly'));

-- Seed Data
INSERT INTO system_settings (key, value, description, is_secret) VALUES
('stripe_public_key', 'pk_test_...', 'Chave Pública do Stripe', false),
('stripe_secret_key', 'sk_test_...', 'Chave Secreta do Stripe', true),
('mercadopago_access_token', 'APP_USR-...', 'Token do Mercado Pago', true),
('sales_goal_monthly', '50000', 'Meta de Vendas Mensal (EUR)', false),
('resend_api_key', 're_...', 'API Key do Resend (E-mails)', true)
ON CONFLICT (key) DO NOTHING;

-- ==========================================
-- 2. SMART WAITLIST
-- ==========================================
CREATE TABLE IF NOT EXISTS waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID NOT NULL, -- Intentionally loose FK if artists table not strict
    client_name TEXT NOT NULL,
    contact TEXT NOT NULL,
    desired_schedule TEXT,
    notes TEXT,
    is_notified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated Read Waitlist" ON waitlist
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated Insert Waitlist" ON waitlist
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated Update Waitlist" ON waitlist
    FOR UPDATE USING (auth.role() = 'authenticated');

-- ==========================================
-- 3. CONSENT FORMS & POST CARE
-- ==========================================
CREATE TABLE IF NOT EXISTS consent_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID, -- Optional link to booking
    client_name TEXT NOT NULL,
    health_answers JSONB,
    signature_url TEXT,
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    terms_version TEXT DEFAULT 'v1.0'
);

ALTER TABLE consent_forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Insert Consent" ON consent_forms FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated Select Consent" ON consent_forms FOR SELECT USING (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS post_care_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL,
    stage TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    channel TEXT DEFAULT 'whatsapp'
);
ALTER TABLE post_care_logs ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 4. ARTIST PORTAL EXTRAS (Optional)
-- ==========================================
-- Add 'bio' or 'guide_content' to artists table if needed, skipping for now as we hardcoded the guide content.
