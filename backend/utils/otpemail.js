import nodemailer from "nodemailer";
import config from "../config/index.js";
import { getEmailTemplate } from "./emailTemplates.js";

const sendEmail = async (options) => {
  // 1. Create a transporter object using SMTP details from the .env file
  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure, // Use the secure flag from config (true for port 465)
    auth: {
      user: config.email.user, // Your SMTP username
      pass: config.email.pass, // Your SMTP password or app password
    },
  });

  // 2. Generate the full HTML body using our template
  const htmlBody = getEmailTemplate({
    title: options.subject,
    message: options.message,
    actionText: options.actionText,
    actionUrl: options.actionUrl,
  });

  // 3. Define the final email options
  const mailOptions = {
    from: `"MediLink" <${config.email.user}>`, // Sender address (e.g., "MediLink" <youremail@gmail.com>)
    to: options.to,
    subject: options.subject,
    // Provide both HTML and a plain text fallback
    html: htmlBody,
    text: options.message, // Plain text version for clients that don't support HTML
  };

  // 4. Send the email and handle any errors
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent successfully: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    // Throw a more specific error to be caught by the controller
    throw new Error(
      "Email service failed. Please check your SMTP credentials and configuration in the .env file."
    );
  }
};

export default sendEmail;
