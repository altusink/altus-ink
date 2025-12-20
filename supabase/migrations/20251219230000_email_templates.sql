-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL UNIQUE, -- 'welcome', 'confirmation', 'reminder'
    subject TEXT NOT NULL,
    body TEXT NOT NULL, -- HTML content
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public Read Templates" ON email_templates FOR SELECT TO public USING (true);
CREATE POLICY "Admin All Templates" ON email_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert Default Templates
INSERT INTO email_templates (type, subject, body) VALUES
('welcome', 'Bem-vindo à Altus Ink! 🖤', '<h1>Olá, {name}!</h1><p>Seja bem-vindo à elite da tatuagem.</p>'),
('confirmation', 'Sua Sessão Confirmada ✅', '<h1>Olá, {name}!</h1><p>Sua sessão com {artist} está confirmada para {date}.</p>'),
('reminder', 'Lembrete: Sua sessão é amanhã ⏰', '<h1>Olá, {name}!</h1><p>Não se esqueça da sua sessão amanhã.</p>')
ON CONFLICT (type) DO NOTHING;
