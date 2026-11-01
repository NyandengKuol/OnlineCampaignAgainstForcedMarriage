const nodemailer = require('nodemailer');

const getTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM) {
    throw new Error('Password reset email is not configured');
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });
};

const sendPasswordResetOtp = async ({ email, code }) => {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Your Online Campaign password reset code',
    text: `Your password reset code is ${code}. It expires in 10 minutes. If you did not request this, you can safely ignore this email.`,
    html: `<p>Your password reset code is:</p><p style="font-size:24px;font-weight:700;letter-spacing:4px">${code}</p><p>This code expires in 10 minutes. If you did not request this, you can safely ignore this email.</p>`,
  });
};

module.exports = { sendPasswordResetOtp };
