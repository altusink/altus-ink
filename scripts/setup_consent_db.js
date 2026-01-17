const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 1. Get Project Ref from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let projectRef = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=https:\/\/([a-z0-9]+)\.supabase\.co/);
    if (match && match[1]) {
        projectRef = match[1];
    } else {
        console.error("❌ Não foi possível encontrar NEXT_PUBLIC_SUPABASE_URL no .env.local");
        process.exit(1);
    }
} catch (err) {
    console.error("❌ Erro ao ler .env.local");
    process.exit(1);
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("\n🔒 \x1b[36mAltus Ink - Sincronização de Banco de Dados (Consentimento)\x1b[0m");
console.log("------------------------------------------------");
console.log(`Projeto Detectado: \x1b[33m${projectRef}\x1b[0m`);
console.log("Para criar a tabela 'consent_forms', precisamos da SENHA do banco.");
console.log("⚠️  A senha é oculta.");

rl.question('🔑 Digite a SENHA do Banco de Dados: ', (password) => {
    rl.close();
    runMigration(password.trim());
});

async function tryConnect(config, password) {
    console.log(`\n🔌 Tentando: ${config.name}...`);
    let connectionString;
    if (config.type === 'direct') {
        connectionString = `postgres://postgres:${password}@${config.host}:5432/postgres`;
    } else {
        connectionString = `postgres://postgres.${projectRef}:${password}@${config.host}:6543/postgres`;
    }

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000 
    });

    try {
        await client.connect();
        console.log("   ✅ SUCESSO! Conectado.");
        return client;
    } catch (err) {
        console.log(`   ❌ Falhou: ${err.message}`);
        return null;
    }
}

async function runMigration(password) {
    const configs = [
        { name: "Pooler AWS-1 (Correto)", host: "aws-1-us-east-1.pooler.supabase.com", type: 'pooler' },
        { name: "Conexão Direta (Padrão)", host: `db.${projectRef}.supabase.co`, type: 'direct' },
        { name: "Pooler EUA (N. Virginia)", host: "aws-0-us-east-1.pooler.supabase.com", type: 'pooler' },
    ];

    let client = null;
    for (const config of configs) {
        client = await tryConnect(config, password);
        if (client) break;
    }

    if (!client) {
        console.error("\n❌ NÃO FOI POSSÍVEL CONECTAR.");
        process.exit(1);
    }

    try {
        console.log("\n🚀 Criando Tabela (Consent Forms)...");

        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS consent_forms (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
                client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
                signed_at TIMESTAMPTZ DEFAULT NOW(),
                signature_base64 TEXT NOT NULL,
                ip_address TEXT,
                user_agent TEXT,
                form_version TEXT DEFAULT 'v1',
                health_data JSONB,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
            CREATE INDEX IF NOT EXISTS idx_consent_forms_booking_id ON consent_forms(booking_id);
        `;

        await client.query(createTableSQL);
        console.log("✅ Tabela 'consent_forms' pronta!");
        console.log("🎉 SUCESSO.");

    } catch (err) {
        console.error("\n❌ Erro durante a migração:");
        console.error(err.message);
    } finally {
        await client.end();
    }
}
