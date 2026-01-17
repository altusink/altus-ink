-- Consent Forms Table
CREATE TABLE IF NOT EXISTS consent_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) NOT NULL,
    client_name TEXT NOT NULL,
    health_answers JSONB, -- Answers to medical questions
    signature_url TEXT, -- URL to signature image
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    terms_version TEXT DEFAULT 'v1.0'
);

-- Post-Care Automations Logs
CREATE TABLE IF NOT EXISTS post_care_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) NOT NULL,
    stage TEXT NOT NULL, -- 'day_1', 'day_3', 'month_1'
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    channel TEXT DEFAULT 'whatsapp'
);

-- RLS
ALTER TABLE consent_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_care_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public insert for consent" ON consent_forms FOR INSERT WITH CHECK (true); -- Clients need to sign without login sometimes? Or use a signed token. For now public for ease.
CREATE POLICY "Read for auth" ON consent_forms FOR SELECT USING (auth.role() = 'authenticated');

-- Insert Mock Data
INSERT INTO consent_forms (booking_id, client_name, health_answers, signed_at)
VALUES 
    (
        (SELECT id FROM bookings LIMIT 1), 
        'Mock Client', 
        '{"pregnant": false, "allergies": "none"}', 
        NOW()
    );
