-- Create artist_guest_guides table
CREATE TABLE IF NOT EXISTS artist_guest_guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    section TEXT NOT NULL, -- 'start_guide', 'where_to_eat', 'emergency'
    title TEXT NOT NULL,
    description TEXT,
    contact_info TEXT, -- phone or simple text
    address TEXT, -- for maps
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE artist_guest_guides ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public Read Guides" ON artist_guest_guides FOR SELECT TO public USING (true);
CREATE POLICY "Admin All Guides" ON artist_guest_guides FOR ALL TO authenticated USING (true) WITH CHECK (true);
