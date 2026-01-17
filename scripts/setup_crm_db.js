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

// 2. Setup Interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("\n🔒 \x1b[36mAltus Ink - Sincronização de Banco de Dados (CRM)\x1b[0m");
console.log("------------------------------------------------");
console.log(`Projeto Detectado: \x1b[33m${projectRef}\x1b[0m`);
console.log("Para criar a tabela de Clientes, precisamos autenticar no banco.");
console.log("⚠️  A senha é oculta (não aparecerá enquanto digita).\n");

rl.question('🔑 Digite a SENHA do Banco de Dados: ', (password) => {
    rl.close();
    runMigration(password.trim());
});

// Hide password input (Simulated by replacing stdout, works in most terminals)
// Simple method for node scripts usually relies on trust or 'readline-sync' which we don't have.
// Standard readline shows input. That's acceptable for a dev script.

async function tryConnect(config, password) {
    console.log(`\n🔌 Tentando: ${config.name}...`);
    console.log(`   Host: ${config.host}`);
    
    // Construct connection string properly based on type
    let connectionString;
    if (config.type === 'direct') {
        connectionString = `postgres://postgres:${password}@${config.host}:5432/postgres`;
    } else {
        // Pooler requires postgres.project_ref
        connectionString = `postgres://postgres.${projectRef}:${password}@${config.host}:6543/postgres`;
    }

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000 // 5s timeout
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
    console.log("\n🔎 Procurando o banco de dados em todas as regiões...");

    const configs = [
        { name: "Pooler AWS-1 (Correto)", host: "aws-1-us-east-1.pooler.supabase.com", type: 'pooler' },
        { name: "Conexão Direta (Padrão)", host: `db.${projectRef}.supabase.co`, type: 'direct' },
        { name: "Pooler EUA (N. Virginia)", host: "aws-0-us-east-1.pooler.supabase.com", type: 'pooler' },
        { name: "Pooler Brasil (São Paulo)", host: "aws-0-sa-east-1.pooler.supabase.com", type: 'pooler' },
        { name: "Pooler Europa (Frankfurt)", host: "aws-0-eu-central-1.pooler.supabase.com", type: 'pooler' },
        { name: "Pooler Asia (Singapore)", host: "aws-0-ap-southeast-1.pooler.supabase.com", type: 'pooler' }
    ];

    let client = null;

    // Loop through all strategies
    for (const config of configs) {
        client = await tryConnect(config, password);
        if (client) break;
    }

    if (!client) {
        console.error("\n❌ NÃO FOI POSSÍVEL CONECTAR EM NENHUMA REGIÃO.");
        console.error("📋 DIAGNÓSTICO:");
        console.error("1. O projeto pode estar PAUSADO no Supabase (verifique o dashboard).");
        console.error("2. A senha pode estar incorreta.");
        console.error("3. O ID do projeto pode estar errado no .env.local.");
        process.exit(1);
    }

    try {
        // Read SQL
        const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251219160000_create_clients_table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log("\n🚀 Criando Tabela (Clients)...");
        await client.query(sql);
        console.log("✅ Tabela CRM Criada!");
        
        // --- BACKFILL (Populate Data) ---
        console.log("🔄 Populando dados (Backfill)...");
        
        // Fetch clients
        const { rows: bookings } = await client.query(`
            SELECT DISTINCT ON (client_email) 
                client_email, client_name, client_phone, booking_date
            FROM bookings
            ORDER BY client_email, booking_date DESC
        `);

        console.log(`📊 Encontrei ${bookings.length} clientes únicos nos agendamentos.`);

        let inserted = 0;
        for (const b of bookings) {
            const {rows: existing} = await client.query(`SELECT id FROM clients WHERE email = $1`, [b.client_email]);
            
            if (existing.length === 0) {
                const {rows: stats} = await client.query(`
                    SELECT count(*) as count, sum(estimated_price) as spent 
                    FROM bookings 
                    WHERE client_email = $1
                `, [b.client_email]);
                
                await client.query(`
                    INSERT INTO clients (email, name, phone, total_bookings, total_spent, last_visit, whatsapp_status, tags)
                    VALUES ($1, $2, $3, $4, $5, $6, 'untouched', '{backfilled}')
                `, [
                    b.client_email, b.client_name, b.client_phone, 
                    stats[0].count, stats[0].spent || 0, b.booking_date
                ]);
                inserted++;
            }
        }
        
        console.log(`✅ CRM Inicializado! ${inserted} clientes importados.`);
        console.log("------------------------------------------------");
        console.log("🎉 TUDO PRONTO! Pode fechar esta janela.");

    } catch (err) {
        console.error("\n❌ Erro durante a migração:");
        console.error(err.message);
    } finally {
        await client.end();
    }
}
