const nodemailer = require('nodemailer');

const sendAnalysisEmail = async (userEmail, pdfBuffer, candidateName, status) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('⚠️ No Email credentials in .env — skipping email step.');
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // TLS
      family: 4, // force IPv4 to avoid IPv6 connectivity issues on Render
      auth: {
        user: process.env.EMAIL_USER,
        pass: (process.env.EMAIL_PASS || '').replace(/\s/g, ''), // remove spaces from App Password
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Verify connection before sending
    await transporter.verify();
    console.log('✅ SMTP connection verified. Sending email to:', userEmail);

    const isSelected = status === 'Selected';
    const subject = isSelected
      ? `🎉 Congratulations! You've been selected — CareerTrack AI`
      : `Your Resume Analysis Report — CareerTrack AI`;

    const mainMessage = isSelected
      ? `Dear ${candidateName},\n\nWe are thrilled to inform you that after analyzing your resume against our requirements, you have been SELECTED for the next round of interviews!\n\nOur team will reach out to you shortly with more details about the schedule.\n\nPlease find your detailed AI Analysis Report attached below.`
      : `Dear ${candidateName},\n\nThank you for your interest in our company. We have completed the AI analysis of your profile.\n\nWhile we may not be moving forward with your application at this time, we encourage you to review the attached feedback report to help with your future career growth.\n\nPlease find your detailed report attached below.`;

    const mailOptions = {
      from: `"CareerTrack AI Recruitment" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: subject,
      text: `${mainMessage}\n\nBest regards,\nThe Recruitment Team — CareerTrack AI`,
      attachments: pdfBuffer
        ? [
            {
              filename: `${(candidateName || 'Candidate').replace(/\s+/g, '_')}_CareerTrack_Report.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf',
            },
          ]
        : [],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully! Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:');
    console.error('  Code:', error.code);
    console.error('  Message:', error.message);
    if (error.code === 'EAUTH') {
      console.error('  → Gmail authentication failed. Make sure EMAIL_PASS is a valid Gmail App Password (not your account password).');
      console.error('  → Generate one at: https://myaccount.google.com/apppasswords');
    }
    if (error.code === 'ECONNREFUSED') {
      console.error('  → Could not connect to Gmail SMTP. Check internet connection.');
    }
    return false;
  }
};

/**
 * Send a test email to verify credentials work
 */
const sendTestEmail = async (toEmail) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      family: 4, // force IPv4
      auth: {
        user: process.env.EMAIL_USER,
        pass: (process.env.EMAIL_PASS || '').replace(/\s/g, ''),
      },
      tls: { rejectUnauthorized: false },
    });

    await transporter.verify();

    await transporter.sendMail({
      from: `"CareerTrack AI" <${process.env.EMAIL_USER}>`,
      to: toEmail || process.env.EMAIL_USER,
      subject: '✅ CareerTrack AI — Email Test Successful',
      text: 'If you received this email, your email configuration is working correctly!',
    });

    return { success: true, message: 'Test email sent successfully!' };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      hint:
        error.code === 'EAUTH'
          ? 'Gmail App Password is wrong. Generate one at https://myaccount.google.com/apppasswords'
          : 'Check your internet connection and email credentials.',
    };
  }
};

module.exports = { sendAnalysisEmail, sendTestEmail };
