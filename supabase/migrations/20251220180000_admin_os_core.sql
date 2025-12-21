-- Migration: Admin OS Core Logic

-- 1. Admin Settings (The "Registry" for the Visual Builder)
create table if not exists public.admin_settings (
    key text primary key,
    value jsonb not null default '{}'::jsonb,
    category text default 'general',
    description text,
    updated_at timestamp with time zone default timezone('utc'::text, now()),
    updated_by uuid references auth.users(id)
);

-- RLS
alter table public.admin_settings enable row level security;
create policy "Admins can view settings" on public.admin_settings
    for select to authenticated using (
        exists (select 1 from public.users where id = auth.uid() and role in ('ADMIN', 'CEO'))
    );
create policy "Admins can update settings" on public.admin_settings
    for update to authenticated using (
        exists (select 1 from public.users where id = auth.uid() and role in ('ADMIN', 'CEO'))
    );


-- 2. Integrations Hub (Storing configs for Stripe, Resend, AI, CRM)
create table if not exists public.integrations (
    service_id text primary key, -- e.g., 'stripe', 'resend', 'gemini'
    name text not null,
    config jsonb default '{}'::jsonb, -- encrypted keys would go here in a real Enterprise app
    is_active boolean default false,
    status text default 'disconnected', -- 'connected', 'error', 'syncing'
    last_sync timestamp with time zone,
    metadata jsonb default '{}'::jsonb
);

-- RLS
alter table public.integrations enable row level security;
create policy "Admins can manage integrations" on public.integrations
    for all to authenticated using (
        exists (select 1 from public.users where id = auth.uid() and role in ('ADMIN', 'CEO'))
    );


-- 3. AI Audit Logs (Tracking the "Virtual CTO" actions)
create table if not exists public.ai_audit_logs (
    id uuid default gen_random_uuid() primary key,
    action text not null, -- 'create_tour', 'update_pricing'
    details jsonb,
    status text default 'success',
    performed_at timestamp with time zone default timezone('utc'::text, now()),
    triggered_by uuid references auth.users(id) -- The human who ordered the AI
);

-- RLS
alter table public.ai_audit_logs enable row level security;
create policy "Admins can view AI logs" on public.ai_audit_logs
    for select to authenticated using (
        exists (select 1 from public.users where id = auth.uid() and role in ('ADMIN', 'CEO'))
    );


-- 4. Seed Initial Settings (The "Default" Theme)
insert into public.admin_settings (key, value, category, description)
values 
    ('theme_config', '{
        "primaryColor": "#00ff9d",
        "glassOpacity": 0.6,
        "borderRadius": "16px",
        "fontHeading": "Orbitron",
        "enableScanlines": true
    }'::jsonb, 'ui', 'Global Visual Theme Configuration'),
    ('company_info', '{
        "name": "Altus Ink",
        "currency": "EUR",
        "taxRate": 0.23
    }'::jsonb, 'business', 'Core Business Logic')
on conflict (key) do nothing;

-- 5. Seed Integrations
insert into public.integrations (service_id, name, status)
values
    ('stripe', 'Stripe Payments', 'disconnected'),
    ('resend', 'Resend Emails', 'disconnected'),
    ('gemini', 'Google Gemini Pro', 'disconnected'),
    ('chatwoot', 'Chatwoot CRM', 'disconnected')
on conflict (service_id) do nothing;
