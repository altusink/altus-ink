-- Migration: Tour Management & System Settings
-- Created via Altus Ink Agent

-- 1. Tour Segments Table
CREATE TABLE IF NOT EXISTS public.tour_segments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  country_name TEXT NOT NULL,
  country_flag TEXT,
  city_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  time_slots TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.tour_segments ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Anyone can view tour segments" ON public.tour_segments;
    DROP POLICY IF EXISTS "CEO can manage tour segments" ON public.tour_segments;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Anyone can view tour segments" ON public.tour_segments FOR SELECT USING (true);
CREATE POLICY "CEO can manage tour segments" ON public.tour_segments FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'CEO')
);

-- 2. System Settings Table
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  description TEXT,
  category TEXT,
  is_secret BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Anyone can view public settings" ON public.system_settings;
    DROP POLICY IF EXISTS "CEO can manage all settings" ON public.system_settings;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Anyone can view public settings" ON public.system_settings FOR SELECT USING (is_secret = false);
CREATE POLICY "CEO can manage all settings" ON public.system_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'CEO')
);

-- 3. Initial Seed
INSERT INTO public.system_settings (key, value, description, category, is_secret)
VALUES 
('site_title', 'Altus Ink', 'Título do site', 'cms', false),
('cms_about_text', 'A Altus Ink redefine a arte na pele...', 'Texto da página Sobre', 'cms', false),
('cms_faq_intro', 'Perguntas frequentes sobre o processo...', 'Intro do FAQ', 'cms', false)
ON CONFLICT (key) DO NOTHING;
