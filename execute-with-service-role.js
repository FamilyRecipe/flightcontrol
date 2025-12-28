const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://mwqxqvhvudmwdkytwqcm.supabase.co';
const SQL = fs.readFileSync('./combined-migration.sql', 'utf8');

// Service role key is needed for DDL execution
// Get it from: Supabase Dashboard → Project Settings → API → service_role key
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable not set!');
  console.error('Get your service role key from:');
  console.error('https://supabase.com/dashboard/project/mwqxqvhvudmwdkytwqcm/settings/api');
  console.error('Then run: export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🚀 Executing migration...');
console.log(`📝 SQL length: ${SQL.length} characters`);

// Execute SQL via RPC (requires a function to be created first)
// OR use direct PostgreSQL connection
// For now, we'll try using the Management API approach
console.log('\n⚠️  Supabase JS client cannot execute raw DDL SQL.');
console.log('Please use one of these methods:');
console.log('\n1. SUPABASE_ACCESS_TOKEN method:');
console.log('   - Get token from: https://supabase.com/dashboard/account/tokens');
console.log('   - Run: export SUPABASE_ACCESS_TOKEN=your_token && node execute-migration.js');
console.log('\n2. Manual execution:');
console.log('   - Go to: https://supabase.com/dashboard/project/mwqxqvhvudmwdkytwqcm/sql/new');
console.log('   - Paste contents of combined-migration.sql');
console.log('   - Click Run');

