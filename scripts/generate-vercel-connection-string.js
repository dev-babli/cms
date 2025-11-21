// Generate correct connection string for Vercel
// This helps ensure the password is properly URL-encoded

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔗 Generate Vercel Connection String\n');
console.log('This will help you create the correct DATABASE_URL for Vercel.\n');

const questions = [
  {
    key: 'projectRef',
    question: 'Enter your Supabase project reference (e.g., ozxrtdqbcfinrnrdelql): ',
  },
  {
    key: 'password',
    question: 'Enter your database password (will be hidden): ',
    hidden: true,
  },
  {
    key: 'region',
    question: 'Enter your region (e.g., ap-south-1, us-east-1): ',
  },
];

const answers = {};

function askQuestion(index) {
  if (index >= questions.length) {
    generateConnectionString();
    return;
  }

  const q = questions[index];
  
  if (q.hidden) {
    // For password, use a different approach
    process.stdout.write(q.question);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    let password = '';
    
    process.stdin.on('data', (char) => {
      char = char.toString();
      
      if (char === '\n' || char === '\r' || char === '\u0004') {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        answers[q.key] = password;
        console.log(''); // New line
        askQuestion(index + 1);
      } else if (char === '\u0003') {
        process.exit(0);
      } else if (char === '\u007f') {
        if (password.length > 0) {
          password = password.slice(0, -1);
          process.stdout.write('\b \b');
        }
      } else {
        password += char;
        process.stdout.write('*');
      }
    });
  } else {
    rl.question(q.question, (answer) => {
      answers[q.key] = answer.trim();
      askQuestion(index + 1);
    });
  }
}

function generateConnectionString() {
  const projectRef = answers.projectRef;
  const password = answers.password;
  const region = answers.region;
  
  // URL encode the password
  const encodedPassword = encodeURIComponent(password);
  
  // Generate connection string
  const connectionString = `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-${region}.pooler.supabase.com:5432/postgres`;
  
  console.log('\n✅ Generated Connection String:\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(connectionString);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('📋 Next Steps:');
  console.log('1. Copy the connection string above');
  console.log('2. Go to Vercel Dashboard → Your CMS Project');
  console.log('3. Settings → Environment Variables');
  console.log('4. Find or create DATABASE_URL');
  console.log('5. Paste the connection string');
  console.log('6. Make sure it\'s set for Production, Preview, Development');
  console.log('7. Save and Redeploy\n');
  
  console.log('💡 Password encoding:');
  console.log(`   Original: ${password}`);
  console.log(`   Encoded:  ${encodedPassword}`);
  if (password !== encodedPassword) {
    console.log('   ✅ Special characters were encoded');
  } else {
    console.log('   ℹ️  No special characters to encode');
  }
  
  rl.close();
}

// Start asking questions
askQuestion(0);

