// Script to check if required environment variables are set
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Checking environment variables...\n');

const requiredVars = {
  'SUPABASE_URL': process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
  'DATABASE_URL': process.env.DATABASE_URL,
  'NEXTAUTH_SECRET': process.env.NEXTAUTH_SECRET,
  'NEXTAUTH_URL': process.env.NEXTAUTH_URL,
};

let allSet = true;

for (const [key, value] of Object.entries(requiredVars)) {
  if (value) {
    // Mask sensitive values
    const displayValue = key.includes('KEY') || key.includes('SECRET') || key.includes('PASSWORD')
      ? '✅ Set (hidden)'
      : value.length > 50
      ? value.substring(0, 50) + '...'
      : value;
    console.log(`✅ ${key}: ${displayValue}`);
  } else {
    console.log(`❌ ${key}: NOT SET`);
    allSet = false;
  }
}

console.log('\n');

if (allSet) {
  console.log('✅ All required environment variables are set!');
} else {
  console.log('❌ Missing environment variables!');
  console.log('\n📝 Add missing variables to cms/.env.local:');
  console.log('\nRequired:');
  if (!requiredVars.SUPABASE_URL) {
    console.log('  SUPABASE_URL=https://ozxrtdqbcfinrnrdelql.supabase.co');
  }
  if (!requiredVars.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here');
    console.log('  (Get from Supabase Dashboard → Settings → API)');
  }
  if (!requiredVars.DATABASE_URL) {
    console.log('  DATABASE_URL=postgresql://...');
  }
  if (!requiredVars.NEXTAUTH_SECRET) {
    console.log('  NEXTAUTH_SECRET=generate-with-node-command');
  }
  if (!requiredVars.NEXTAUTH_URL) {
    console.log('  NEXTAUTH_URL=http://localhost:3001');
  }
}

