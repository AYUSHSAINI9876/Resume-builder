// backend/services/email.js — Transactional email delivery via SendGrid
const sgMail = require("@sendgrid/mail");

const BRAND = {
  name: "ResumeAI",
  primary: "#6c63ff",
  secondary: "#f72585",
  dark: "#1e1e3f",
};

let configured = false;
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  configured = true;
}

const isConfigured = () => configured;

/**
 * Branded OTP email.
 * Built with tables + inline styles because email clients (Outlook especially)
 * ignore <style> blocks, flexbox, and most modern CSS.
 */
const otpTemplate = ({ code, purpose, expiresInMinutes }) => {
  const heading = purpose === "login" ? "Your login code" : "Verify your email";
  const intro =
    purpose === "login"
      ? "Use the code below to sign in to your ResumeAI account."
      : "Welcome to ResumeAI! Use the code below to verify your email address and finish creating your account.";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${heading} — ${BRAND.name}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <!-- Preheader: shown as the inbox preview line, hidden in the body -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    Your ${BRAND.name} verification code is ${code}. It expires in ${expiresInMinutes} minutes.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f8;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(30,30,63,0.08);">

          <!-- Header -->
          <tr>
            <td bgcolor="${BRAND.primary}" style="background:linear-gradient(135deg,${BRAND.primary} 0%,${BRAND.secondary} 100%);padding:32px 32px 28px;text-align:center;">
              <div style="font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">
                ${BRAND.name}
              </div>
              <div style="font-size:13px;color:rgba(255,255,255,0.85);margin-top:4px;">
                AI-Powered Resume Builder
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px 8px;">
              <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:${BRAND.dark};">${heading}</h1>
              <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#55556a;">${intro}</p>

              <!-- Code -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="background-color:#f6f5ff;border:1px solid #e4e1ff;border-radius:12px;padding:24px 16px;">
                    <div style="font-size:12px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:#8b85ff;margin-bottom:10px;">
                      Verification Code
                    </div>
                    <div style="font-size:38px;font-weight:700;letter-spacing:10px;color:${BRAND.dark};font-family:'Courier New',Courier,monospace;">
                      ${code}
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#55556a;">
                This code expires in <strong style="color:${BRAND.dark};">${expiresInMinutes} minutes</strong>.
              </p>
              <p style="margin:12px 0 0;font-size:13px;line-height:1.6;color:#8a8aa0;">
                If you didn't request this, you can safely ignore this email — someone may have typed your address by mistake. Never share this code with anyone.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 32px 32px;">
              <div style="border-top:1px solid #ececf4;padding-top:20px;font-size:12px;line-height:1.6;color:#9a9ab0;text-align:center;">
                Sent by ${BRAND.name} · This is an automated message, please don't reply.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `${heading}

${intro}

Verification code: ${code}

This code expires in ${expiresInMinutes} minutes.
If you didn't request this, you can safely ignore this email. Never share this code with anyone.

— ${BRAND.name}`;

  return { html, text };
};

/**
 * Send a one-time passcode.
 * In development without SendGrid configured, the code is logged to the console
 * instead so the flow stays testable. This never happens in production.
 */
const sendOtpEmail = async ({ email, code, purpose, expiresInMinutes = 10 }) => {
  const subject =
    purpose === "login"
      ? `${code} is your ${BRAND.name} login code`
      : `${code} is your ${BRAND.name} verification code`;

  if (!configured) {
    if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
      throw new Error("SENDGRID_API_KEY is not configured — cannot send email.");
    }
    console.log("\n📧 [DEV] SendGrid not configured — OTP not emailed.");
    console.log(`   To: ${email}`);
    console.log(`   Code: ${code} (valid ${expiresInMinutes} min)\n`);
    return { delivered: false, devFallback: true };
  }

  const { html, text } = otpTemplate({ code, purpose, expiresInMinutes });

  try {
    await sgMail.send({
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: process.env.SENDGRID_FROM_NAME || BRAND.name,
      },
      subject,
      text,
      html,
    });
    return { delivered: true };
  } catch (err) {
    // SendGrid packs the useful detail into response.body.errors
    const detail = err.response?.body?.errors?.map((e) => e.message).join("; ");
    console.error("SendGrid send failed:", detail || err.message);
    throw new Error(detail || "Failed to send verification email.");
  }
};

module.exports = { sendOtpEmail, isConfigured, otpTemplate };
