import nodemailer from "nodemailer";

export function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Gmail App Password
    },
  });
}

export async function sendPasswordResetEmail(
  toEmail: string,
  toName: string,
  resetUrl: string
) {
  const transporter = createTransporter();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reset Your Password</title>
  <style>
    body { margin: 0; padding: 0; background: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .wrapper { max-width: 480px; margin: 40px auto; }
    .card { background: #111111; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 40px; }
    .logo { display: flex; align-items: center; gap: 12px; margin-bottom: 32px; }
    .logo-box { width: 40px; height: 40px; background: #dc2626; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .logo-text { color: white; font-weight: 900; font-size: 13px; }
    .brand { color: white; font-weight: 900; font-size: 18px; letter-spacing: -0.5px; }
    .brand-sub { color: #ef4444; font-size: 10px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; }
    h1 { color: white; font-size: 22px; font-weight: 900; margin: 0 0 8px; }
    p { color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 0 0 24px; }
    .btn { display: block; background: #dc2626; color: white; text-decoration: none; font-weight: 900; font-size: 14px; text-align: center; padding: 14px 24px; border-radius: 10px; margin: 0 0 24px; }
    .divider { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 24px 0; }
    .link-box { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 12px; word-break: break-all; }
    .link-text { color: #6b7280; font-size: 11px; margin: 0 0 6px; }
    .link-url { color: #ef4444; font-size: 12px; }
    .warning { color: #6b7280; font-size: 12px; margin: 0; }
    .footer { text-align: center; margin-top: 24px; color: #374151; font-size: 12px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="logo">
        <div class="logo-box"><span class="logo-text">TD</span></div>
        <div>
          <div class="brand">TOPDOG</div>
          <div class="brand-sub">CRM Platform</div>
        </div>
      </div>

      <h1>Reset Your Password</h1>
      <p>Hi ${toName}, we received a request to reset your password for your TopDog CRM account. Click the button below to choose a new password.</p>

      <a href="${resetUrl}" class="btn">Reset My Password →</a>

      <p style="margin:0 0 16px">This link expires in <strong style="color:white">1 hour</strong>. If you didn't request a password reset, you can safely ignore this email — your password will not change.</p>

      <hr class="divider">

      <div class="link-box">
        <p class="link-text">If the button doesn't work, copy this link into your browser:</p>
        <span class="link-url">${resetUrl}</span>
      </div>

      <hr class="divider">
      <p class="warning">© ${new Date().getFullYear()} Top Dog Leads LLC · Houston, TX</p>
    </div>
    <div class="footer">This email was sent to ${toEmail}</div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"TopDog CRM" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Reset your TopDog CRM password",
    html,
    text: `Hi ${toName},\n\nReset your password by visiting:\n${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, ignore this email.\n\n— TopDog CRM`,
  });
}