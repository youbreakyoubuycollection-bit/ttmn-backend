const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendLicenseEmail({ to, licenseKey, client, orderId }) {
  return resend.emails.send({
    from: "Talk To Me Nice <onboarding@resend.dev>",
    to,
    subject: "Your Talk To Me Nice License Key",
    html: `
      <h2>Your License Is Ready 🎉</h2>
      <p><strong>Client:</strong> ${client}</p>
      <p><strong>License Key:</strong></p>
      <pre style="font-size:16px;">${licenseKey}</pre>
      <p><strong>Order ID:</strong> ${orderId || "N/A"}</p>
      <p>You can now use your Talk To Me Nice assistant.</p>
    `
  });
}

module.exports = { sendLicenseEmail };
