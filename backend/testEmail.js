require('dotenv').config();
const { sendTestEmail } = require('./services/emailService');

async function run() {
  console.log('Testing email credentials with:');
  console.log('User:', process.env.EMAIL_USER);
  console.log('Pass length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);
  
  const result = await sendTestEmail(process.env.EMAIL_USER);
  console.log('\nResult:');
  console.log(result);
  process.exit(result.success ? 0 : 1);
}
run();
