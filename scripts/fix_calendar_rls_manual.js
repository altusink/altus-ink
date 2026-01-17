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

console.log("\n🔒 \x1b[36mAltus Ink - Correção do Calendário (RLS)\x1b[0m");
console.log("------------------------------------------------");
console.log(`Projeto Detectado: \x1b[33m${projectRef}\x1b[0m`);
console.log("Para corrigir o acesso público aos horários, precisamos da SENHA do banco.");
console.log("Isso irá aplicar: ALTER TABLE tour_segments ENABLE ROW LEVEL SECURITY + POLICY public.");

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
    ];

    let client = null;
    for (const config of configs) {
        client = await tryConnect(config, password);
        if (client) break;
    }

    if (!client) {
        console.error("\n❌ NÃO FOI POSSÍVEL CONECTAR. Verifique a senha.");
        process.exit(1);
    }

    try {
        console.log("\n🚀 Aplicando Correção RLS...");

        const sql = `
            -- Enable RLS just in case
            ALTER TABLE "tour_segments" ENABLE ROW LEVEL SECURITY;

            -- Drop existing policy to avoid conflicts
            DROP POLICY IF EXISTS "Enable read access for all users" ON "tour_segments";

            -- Allow Public Read
            CREATE POLICY "Enable read access for all users"
            ON "tour_segments" FOR SELECT
            TO public
            USING (true);
        `;

        await client.query(sql);
        console.log("✅ Políticas atualizadas com sucesso!");
        console.log("🎉 O Calendário deve funcionar agora.");

    } catch (err) {
        console.error("\n❌ Erro durante a migração:");
        console.error(err.message);
    } finally {
        await client.end();
        console.log("\nPressione qualquer tecla para sair...");
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on('data', process.exit.bind(process, 0));
    }
}
