const env = require("../config/env");

function generateOtpCode() {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
}

function normalizeRecipient(channel, value) {
  return channel === "email" ? value.trim().toLowerCase() : value.trim();
}

async function deliverOtp({ channel, recipient, code }) {
  const message =
    channel === "email"
      ? `OTP for ${recipient}: ${code}`
      : `Phone OTP for ${recipient}: ${code}`;

  console.log(message);

  if (env.OTP_DEBUG_FALLBACK) {
    return {
      delivered: true,
      debugCode: code,
    };
  }

  return {
    delivered: false,
  };
}

module.exports = {
  generateOtpCode,
  normalizeRecipient,
  deliverOtp,
};
