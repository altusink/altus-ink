-- Create Waitlist Table
CREATE TABLE IF NOT EXISTS waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID REFERENCES artists(id) NOT NULL,
    client_name TEXT NOT NULL,
    contact TEXT NOT NULL,
    desired_schedule TEXT, -- e.g., 'Tuesdays', 'November'
    notes TEXT,
    is_notified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON waitlist
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON waitlist
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON waitlist
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert Dummy Data
INSERT INTO waitlist (artist_id, client_name, contact, desired_schedule, notes)
SELECT 
    id as artist_id,
    'Cliente Espera ' || SUBSTRING(id::text, 1, 4),
    '+351 912 345 678',
    'Qualquer dia de Dezembro',
    'Quer muito fazer com este artista.'
FROM artists
LIMIT 3;
