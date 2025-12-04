// Helper script to URL-encode database password
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 Database Password URL Encoder\n');
console.log('Enter your database password (input will be hidden):\n');

// Hide password input
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding('utf8');

let password = '';
let masked = '';

process.stdin.on('data', (char) => {
  char = char.toString();
  
  switch (char) {
    case '\n':
    case '\r':
    case '\u0004': // Ctrl+D
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write('\n\n');
      
      // URL encode the password
      const encoded = encodeURIComponent(password);
      
      console.log('📋 Results:');
      console.log('   Original:', password);
      console.log('   Encoded: ', encoded);
      console.log('\n💡 Use the encoded version in your DATABASE_URL');
      console.log('\nExample connection string:');
      console.log(`   postgresql://postgres.xxx:${encoded}@aws-0-region.pooler.supabase.com:5432/postgres`);
      
      process.exit(0);
      break;
    case '\u0003': // Ctrl+C
      process.exit(0);
      break;
    case '\u007f': // Backspace
      if (password.length > 0) {
        password = password.slice(0, -1);
        masked = masked.slice(0, -1);
        process.stdout.write('\b \b');
      }
      break;
    default:
      password += char;
      masked += '*';
      process.stdout.write('*');
      break;
  }
});


