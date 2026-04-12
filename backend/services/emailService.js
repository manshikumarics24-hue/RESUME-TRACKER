const nodemailer = require('nodemailer');

const sendAnalysisEmail = async (userEmail, pdfBuffer, candidateName) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('⚠️ No Email credentials in .env — skipping email step.');
      return false;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: (process.env.EMAIL_PASS || '').replace(/\s/g, '')
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify credentials before sending
    await transporter.verify();

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@careertrack.ai',
      to: userEmail,
      subject: `Your AI Resume Analysis Report is Ready!`,
      text: `Hi ${candidateName},\n\nYour resume has been successfully parsed and analyzed against your selected Job Description.\n\nPlease find your detailed feedback and JSON metrics attached as a PDF document.\n\nBest regards,\nThe CareerTrack AI Team`,
      attachments: [
        {
          filename: `${candidateName.replace(/\s+/g, '_')}_CareerTrack_Report.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    // Don't throw so API still succeeds
    return false;
  }
};

module.exports = { sendAnalysisEmail };
