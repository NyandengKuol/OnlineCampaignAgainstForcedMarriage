const sendPasswordResetOtp = async ({ email, code }) => {
  const { RESEND_API_KEY, RESEND_FROM } = process.env;
  if (!RESEND_API_KEY || !RESEND_FROM) throw new Error('Password reset email is not configured');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: [email],
      subject: 'Your Online Campaign password reset code',
      text: `Your password reset code is ${code}. It expires in 10 minutes. If you did not request this, you can safely ignore this email.`,
      html: `<p>Your password reset code is:</p><p style="font-size:24px;font-weight:700;letter-spacing:4px">${code}</p><p>This code expires in 10 minutes. If you did not request this, you can safely ignore this email.</p>`,
    }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Resend could not deliver the password reset email');
  }
};

module.exports = { sendPasswordResetOtp };
