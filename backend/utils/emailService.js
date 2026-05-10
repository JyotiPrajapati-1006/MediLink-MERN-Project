// src/utils/mailer.js
import nodemailer from "nodemailer";

const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, FROM_EMAIL } =
  process.env;

export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT) || 465,
  secure: String(SMTP_SECURE) === "true", // true for 465, false for 587
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

// optional: boot time verify (logs ma success/error dekhay)
export const verifyTransporter = async () => {
  try {
    await transporter.verify();
    console.log("✅ SMTP ready to send mails");
  } catch (err) {
    console.error("❌ SMTP verify failed:", err.message);
  }
};

/** Basic HTML template */
export const contactHtml = ({ Name, Email, Message }) => `
  <div style="font-family:system-ui,Arial;line-height:1.5">
    <h2>New Contact Message</h2>
    <p><b>Name:</b> ${Name || "-"}</p>
    <p><b>Email:</b> ${Email || "-"}</p>
    <p><b>Message:</b><br/>${(Message || "").replace(/\n/g, "<br/>")}</p>
    <hr/>
    <small>Sent from your website contact form.</small>
  </div>
`;
