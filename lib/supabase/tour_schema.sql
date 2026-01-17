-- Create Tour Segments table for Dynamic Tour Management
CREATE TABLE IF NOT EXISTS public.tour_segments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    country_name TEXT NOT NULL,
    country_flag TEXT NOT NULL, -- Emoji
    city_name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    time_slots TEXT[] DEFAULT ARRAY['10:00', '14:00', '18:00'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.tour_segments ENABLE ROW LEVEL SECURITY;

-- Allow Read access to everyone (for Booking Form)
CREATE POLICY "Allow public read access" ON public.tour_segments
    FOR SELECT TO public USING (true);

-- Allow All access to Admin/CEO (In this case, we use service role or authenticated users with role check in middleware/API)
-- For simplicity in this SQL run, we allow authenticated inserts, but app logic restricts to Admin.
CREATE POLICY "Allow admin full access" ON public.tour_segments
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
