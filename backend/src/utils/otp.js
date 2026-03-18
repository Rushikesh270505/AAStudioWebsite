const nodemailer = require("nodemailer");
const env = require("../config/env");

let cachedTransporter = null;

function generateOtpCode() {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
}

function normalizeRecipient(channel, value) {
  return channel === "email" ? value.trim().toLowerCase() : value.trim();
}

function buildEmailContent({ recipient, code, purpose }) {
  const subjectMap = {
    signup: "Verify your email address",
    login: "Your sign-in OTP",
    reset: "Your password reset OTP",
  };
  const headingMap = {
    signup: "Verify your email",
    login: "Use this OTP to sign in",
    reset: "Use this OTP to reset access",
  };
  const supportTextMap = {
    signup: "Enter this code to complete your account creation.",
    login: "Enter this code on the sign-in screen to continue.",
    reset: "Enter this code on the forgot-password screen to continue.",
  };
  const subject = subjectMap[purpose] || "Your OTP code";
  const heading = headingMap[purpose] || "Your OTP code";
  const supportText = supportTextMap[purpose] || "Enter this code to continue.";
  const expires = `${env.OTP_TTL_MINUTES} minutes`;

  return {
    subject,
    text: [
      `Hello,`,
      ``,
      `${heading}`,
      `OTP: ${code}`,
      ``,
      `${supportText}`,
      `This code expires in ${expires}.`,
      ``,
      `If you did not request this, you can ignore this email.`,
      ``,
      `Art and Architecture Studios`,
    ].join("\n"),
    html: `
      <div style="margin:0;padding:32px 20px;background:#f6f1ea;font-family:Inter,Arial,sans-serif;color:#2c2c2c;">
        <div style="max-width:560px;margin:0 auto;background:#fffaf4;border:1px solid #e6e1da;border-radius:28px;overflow:hidden;box-shadow:0 24px 70px rgba(44,44,44,0.08);">
          <div style="padding:28px 32px;background:linear-gradient(135deg,#faf8f4 0%,#f3efea 60%,#eee8e1 100%);border-bottom:1px solid #e6e1da;">
            <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.28em;text-transform:uppercase;color:#8f6532;">Art and Architecture Studios</p>
            <h1 style="margin:0;font-family:'Playfair Display',Georgia,serif;font-size:34px;line-height:1.04;font-weight:600;color:#2c2c2c;">${heading}</h1>
          </div>
          <div style="padding:32px;">
            <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#5c5c5c;">Hello ${recipient},</p>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.8;color:#5c5c5c;">${supportText}</p>
            <div style="margin:0 0 24px;padding:18px 20px;border-radius:24px;border:1px solid #e6e1da;background:#f8f5f1;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.24em;text-transform:uppercase;color:#8f6532;">One-time password</p>
              <p style="margin:0;font-size:32px;letter-spacing:0.34em;font-weight:700;color:#2c2c2c;">${code}</p>
            </div>
            <p style="margin:0 0 12px;font-size:14px;line-height:1.8;color:#5c5c5c;">This code expires in <strong>${expires}</strong>.</p>
            <p style="margin:0;font-size:14px;line-height:1.8;color:#5c5c5c;">If you did not request this, you can safely ignore this email.</p>
          </div>
        </div>
      </div>
    `,
  };
}

function getTransporter() {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_USER || !env.SMTP_PASS || !env.SMTP_FROM_EMAIL) {
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  return cachedTransporter;
}

async function deliverOtp({ channel, recipient, code, purpose = "signup" }) {
  const message =
    channel === "email"
      ? `OTP for ${recipient}: ${code}`
      : `Phone OTP for ${recipient}: ${code}`;

  console.log(message);

  if (channel === "email") {
    const transporter = getTransporter();

    if (transporter) {
      const emailContent = buildEmailContent({ recipient, code, purpose });

      await transporter.sendMail({
        from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
        to: recipient,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      });

      return {
        delivered: true,
      };
    }
  }

  if (env.OTP_DEBUG_FALLBACK) {
    return {
      delivered: true,
      debugCode: code,
    };
  }

  throw new Error(
    channel === "email"
      ? "Email OTP delivery is not configured. Set SMTP env vars on the backend."
      : "Phone OTP delivery is not configured.",
  );
}

module.exports = {
  generateOtpCode,
  normalizeRecipient,
  deliverOtp,
};
