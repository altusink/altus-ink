-- 1. Create Table if not exists
CREATE TABLE IF NOT EXISTS public.tour_segments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    country_name TEXT NOT NULL,
    country_flag TEXT NOT NULL,
    city_name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    time_slots TEXT[] DEFAULT ARRAY['10:00', '14:00', '18:00'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Security
ALTER TABLE public.tour_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.tour_segments FOR SELECT TO public USING (true);
CREATE POLICY "Allow admin full access" ON public.tour_segments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Seed Initial Data (Europe Tour 2024/2025)
INSERT INTO public.tour_segments (country_name, country_flag, city_name, start_date, end_date, time_slots)
VALUES 
    ('França', '🇫🇷', 'Paris', '2025-10-10', '2025-10-15', ARRAY['10:00', '15:00']),
    ('França', '🇫🇷', 'Lyon', '2025-10-17', '2025-10-20', ARRAY['09:00', '13:00', '17:00']),
    ('Alemanha', '🇩🇪', 'Berlin', '2025-10-22', '2025-10-26', ARRAY['11:00', '16:00']),
    ('Reino Unido', '🇬🇧', 'London', '2025-11-01', '2025-11-05', ARRAY['10:00', '14:00', '19:00']);

-- 4. Add CRM Stage to Bookings (As per previous request)
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS crm_stage TEXT DEFAULT 'new';
