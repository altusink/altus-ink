const fs = require('fs');
const { execSync, spawn } = require('child_process');
const path = require('path');

// Read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse Env Vars (Simple parser)
const envVars = {};
envContent.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    
    // Split on first =
    const idx = line.indexOf('=');
    if (idx === -1) return;
    
    const key = line.substring(0, idx);
    let value = line.substring(idx + 1);
    
    // Remove quotes if present
    if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
    }
    
    // Fix newlines for Private Key
    if (key === 'GOOGLE_PRIVATE_KEY') {
        value = value.replace(/\\n/g, '\n');
    }

    envVars[key] = value;
});

// Keys to sync (only the sensitive/new ones to avoid overwriting everything indiscriminately if not needed, 
// but user said "faz isso", implying all relevant ones).
// Let's sync the critical ones for today's features.
const KEYS_TO_SYNC = [
    'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    'GOOGLE_PRIVATE_KEY',
    'GOOGLE_CALENDAR_ID',
    'RESEND_API_KEY',
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_SITE_NAME'
];

async function addEnvVar(key, value) {
    if (!value) return;

    console.log(`Uploading ${key}...`);
    
    // We need to run for Production, Preview, and Development
    const targets = ['production', 'preview', 'development'];
    
    for (const target of targets) {
        // Remove existing first to avoid "already exists" error (optional, but safe)
        try {
            execSync(`vercel env rm ${key} ${target} -y`, { stdio: 'ignore' });
        } catch (e) {
            // Ignore error if key didn't exist
        }

        // Add
        // echo -n value | vercel env add key target
        // But in Node spawn we pipe stdin
        
        await new Promise((resolve, reject) => {
            const child = spawn('vercel', ['env', 'add', key, target], { stdio: ['pipe', 'inherit', 'inherit'], shell: true });
            
            child.stdin.write(value);
            child.stdin.end();
            
            child.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`Failed to add ${key} to ${target}`));
            });
        });
    }
}

async function main() {
    console.log('🚀 Syncing Environment Variables to Vercel...');
    
    for (const key of KEYS_TO_SYNC) {
        if (envVars[key]) {
            await addEnvVar(key, envVars[key]);
        }
    }
    
    console.log('✅ All keys synced successfully!');
    console.log('⚠️ IMPORTANT: You must REDEPLOY for these to take effect.');
}

main().catch(console.error);
