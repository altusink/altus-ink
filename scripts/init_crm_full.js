const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Credentials provided by user
const DB_PASS = 'MRvHiuLbsaDs06dv';

// Get Project Ref to build connection string
const envPath = path.join(__dirname, '..', '.env.local');
let projectRef = '';
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=https:\/\/([a-z0-9]+)\.supabase\.co/);
    if (match && match[1]) projectRef = match[1];
    else throw new Error("Project Ref not found");
} catch (err) {
    console.error("❌ Failed to parse .env.local for Project URL");
    process.exit(1);
}

// Try Pooler Connection (Sao Paulo)
// User: postgres.[project-ref]
// Host: aws-0-sa-east-1.pooler.supabase.com
// Port: 6543
const connectionString = `postgres://postgres.${projectRef}:${DB_PASS}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`;

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();
        console.log("✅ Database Connected.");

        // 1. Run Schema Migration
        const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251219160000_create_clients_table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log("🚀 Creating 'clients' table...");
        await client.query(sql);

        // 2. Run Backfill (Populate from Bookings)
        console.log("🔄 Backfilling data from 'bookings'...");
        
        // Fetch all unique emails from bookings
        const { rows: bookings } = await client.query(`
            SELECT DISTINCT ON (client_email) 
                client_email, client_name, client_phone, booking_date
            FROM bookings
            ORDER BY client_email, booking_date DESC
        `);

        console.log(`found ${bookings.length} unique clients to insert.`);

        for (const b of bookings) {
            // Check if exists
            const {rows: existing} = await client.query(`SELECT id FROM clients WHERE email = $1`, [b.client_email]);
            
            if (existing.length === 0) {
                // Calculate stats
                const {rows: stats} = await client.query(`
                    SELECT count(*) as count, sum(estimated_price) as spent 
                    FROM bookings 
                    WHERE client_email = $1
                `, [b.client_email]);
                
                await client.query(`
                    INSERT INTO clients (email, name, phone, total_bookings, total_spent, last_visit, whatsapp_status, tags)
                    VALUES ($1, $2, $3, $4, $5, $6, 'untouched', '{backfilled}')
                `, [
                    b.client_email, 
                    b.client_name, 
                    b.client_phone, 
                    stats[0].count, 
                    stats[0].spent || 0, 
                    b.booking_date
                ]);
            }
        }
        
        console.log("✅ CRM Initialization Complete!");

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        await client.end();
    }
}

run();
