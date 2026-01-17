-- Create Helper Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Insert Admin User into Auth (Password: start_empire_now)
WITH new_user AS (
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    uuid_generate_v4(),
    'authenticated',
    'authenticated',
    'admin@altusink.com',
    crypt('start_empire_now', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "CEO", "full_name": "Jander CEO"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id, email
)
-- Insert Profile into Public
INSERT INTO public.users (id, email, role, full_name, phone)
SELECT id, email, 'CEO', 'Jander CEO', '+5511999999999'
FROM new_user;

-- Verify
SELECT * FROM public.users WHERE email = 'admin@altusink.com';
