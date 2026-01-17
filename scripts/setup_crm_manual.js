const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("\n🔗 \x1b[36mAltus Ink - Conexão Manual\x1b[0m");
console.log("------------------------------------------------");
console.log("O modo automático falhou (DNS). Vamos usar o endereço direto.");
console.log("\n1. Vá no Supabase: Settings > Database.");
console.log("2. Procure 'Connection String' > 'Node.js'.");
console.log("3. Copie o texto que começa com 'postgres://...'");
console.log("   (Se tiver '[YOUR-PASSWORD]', substitua pela senha real antes ou depois).");
console.log("\nCole a Connection String INTEIRA abaixo:");

rl.question('👉 String: ', (inputString) => {
    rl.close();
    
    // Clean string (remove quotes if user pasted them)
    let connectionString = inputString.trim().replace(/"/g, '').replace(/'/g, '');
    
    // Fix password placeholder if present
    if (connectionString.includes('[YOUR-PASSWORD]')) {
        console.log("\n⚠️  Achei o placeholder '[YOUR-PASSWORD]'.");
        console.log("Vamos substituir pela sua senha 'bTEtpHoGTPjvobW5'...");
        connectionString = connectionString.replace('[YOUR-PASSWORD]', 'bTEtpHoGTPjvobW5');
    }

    runMigration(connectionString);
});

async function runMigration(connectionString) {
    console.log(`\n⏳ Conectando em: ${connectionString.split('@')[1]}...`);

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000 
    });

    try {
        await client.connect();
        console.log("✅ SUCESSO! Conectado.");

        // Read SQL
        const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251219160000_create_clients_table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log("\n🚀 Criando Tabela (Clients)...");
        await client.query(sql);
        console.log("✅ Tabela CRM Criada!");
        
        // Backfill logic
        console.log("🔄 Populando dados (Backfill)...");
        const { rows: bookings } = await client.query(`
            SELECT DISTINCT ON (client_email) client_email, client_name, client_phone, booking_date
            FROM bookings ORDER BY client_email, booking_date DESC
        `);

        console.log(`📊 Clientes encontrados: ${bookings.length}`);
        
        let inserted = 0;
        for (const b of bookings) {
            const {rows: existing} = await client.query(`SELECT id FROM clients WHERE email = $1`, [b.client_email]);
            if (existing.length === 0) {
               const {rows: stats} = await client.query(`SELECT count(*) as count, sum(estimated_price) as spent FROM bookings WHERE client_email = $1`, [b.client_email]);
               await client.query(`
                   INSERT INTO clients (email, name, phone, total_bookings, total_spent, last_visit, whatsapp_status, tags)
                   VALUES ($1, $2, $3, $4, $5, $6, 'untouched', '{backfilled}')
               `, [b.client_email, b.client_name, b.client_phone, stats[0].count, stats[0].spent || 0, b.booking_date]);
               inserted++;
            }
        }
        
        console.log(`✅ CRM Inicializado! ${inserted} clientes importados.`);
        console.log("\n🎉 CONCLUÍDO! Pode fechar.");

    } catch (err) {
        console.error("\n❌ Falhou novamente:");
        console.error(err.message);
    } finally {
        await client.end();
    }
}
