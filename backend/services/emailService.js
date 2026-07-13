const nodemailer = require('nodemailer');

const sendAnalysisEmail = async (userEmail, pdfBuffer, candidateName, status) => {
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

    await transporter.verify();

    const isSelected = status === 'Selected';
    const subject = isSelected 
      ? `Congratulations! You've been selected for the next round - CareerTrack AI`
      : `Your Resume Analysis Report - CareerTrack AI`;

    const mainMessage = isSelected
      ? `Dear ${candidateName},\n\nWe are thrilled to inform you that after analyzing your resume against our requirements, you have been SELECTED for the next round of interviews!\n\nOur team will reach out to you shortly with more details about the schedule.\n\nPlease find your detailed AI Analysis Report attached below.`
      : `Dear ${candidateName},\n\nThank you for your interest in our company. We have completed the AI analysis of your profile.\n\nWhile we may not be moving forward with your application at this time, we encourage you to review the attached feedback report to help with your future career growth.\n\nPlease find your detailed report attached below.`;

    const mailOptions = {
      from: `"CareerTrack AI Recruitment" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: subject,
      text: `${mainMessage}\n\nBest regards,\nThe Recruitment Team`,
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
    return false;
  }
};

module.exports = { sendAnalysisEmail };
