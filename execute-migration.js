const https = require('https');
const fs = require('fs');

const PROJECT_REF = 'mwqxqvhvudmwdkytwqcm';
const SQL = fs.readFileSync('./combined-migration.sql', 'utf8');

// Get access token from environment (from .env.local)
// Load .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match && !match[1].startsWith('#')) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || envVars.SUPABASE_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error('❌ SUPABASE_ACCESS_TOKEN environment variable not set!');
  console.error('Get your token from: https://supabase.com/dashboard/account/tokens');
  console.error('Then run: export SUPABASE_ACCESS_TOKEN=your_token_here');
  process.exit(1);
}

const postData = JSON.stringify({ query: SQL });

const options = {
  hostname: 'api.supabase.com',
  path: `/v1/projects/${PROJECT_REF}/database/query`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log(`🚀 Executing migration on project: ${PROJECT_REF}`);
console.log(`📝 SQL length: ${SQL.length} characters`);

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    console.log(`\n📊 Status Code: ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log('✅ Migrations applied successfully!');
      try {
        const result = JSON.parse(body);
        console.log('Response:', JSON.stringify(result, null, 2));
      } catch (e) {
        console.log('Response:', body);
      }
    } else {
      console.error('❌ Error applying migrations');
      console.error('Response:', body);
      try {
        const error = JSON.parse(body);
        console.error('Error details:', JSON.stringify(error, null, 2));
      } catch (e) {
        console.error('Raw response:', body);
      }
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e.message);
});

req.write(postData);
req.end();

