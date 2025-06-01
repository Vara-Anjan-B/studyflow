import nodemailer from 'nodemailer';

export async function sendEmail({ to, subject, html }) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
      user: process.env.SMTP_USER || 'your_ethereal_user',
      pass: process.env.SMTP_PASS || 'your_ethereal_pass',
    },
  });

  const info = await transporter.sendMail({
    from: '"StudyFlow" <no-reply@studyflow.com>',
    to,
    subject,
    html,
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }
}
