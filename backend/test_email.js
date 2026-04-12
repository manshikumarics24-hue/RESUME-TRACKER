// Quick email test — run: node test_email.js
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  const user = process.env.EMAIL_USER;
  const pass = (process.env.EMAIL_PASS || '').replace(/\s/g, '');

  console.log('EMAIL_USER:', user);
  console.log('EMAIL_PASS length:', pass.length, '(should be 16)');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  });

  try {
    await transporter.verify();
    console.log('✅ SMTP credentials verified OK');

    await transporter.sendMail({
      from: user,
      to: user, // send to yourself as a test
      subject: 'CareerTrack AI — Email Test',
      text: 'If you see this, email is working correctly!'
    });
    console.log('✅ Test email sent! Check your inbox (and spam).');
  } catch (err) {
    console.error('❌ Email error:', err.message);
    console.error('Full error:', err);
  }
}

testEmail();
