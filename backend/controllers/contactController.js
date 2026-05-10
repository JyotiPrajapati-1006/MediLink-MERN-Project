// backend/controllers/contactController.js
import asyncHandler from "express-async-handler";
import ContactMessage from "../models/contactMessage.js";
import { transporter, contactHtml } from "../utils/emailService.js";
import dotenv from "dotenv";
dotenv.config();

export const submitContactMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    res.status(400);
    throw new Error("All fields are required.");
  }

  await ContactMessage.create({ name, email, subject, message });

  await transporter.sendMail({
    from: process.env.FROM_EMAIL, // branding-friendly address
    to: process.env.TO_EMAIL, // owner/admin email
    replyTo: email, // owner “Reply” kare to user ne jaye
    subject: `New Contact: ${name} (${email})`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    html: contactHtml({ Name: name, Email: email, Message: message }),
  });

  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: email, // user email
    subject: "We received your message",
    text: `Hi ${name},\n\nThanks for contacting us. We'll get back to you soon.\n\n— Team`,
    html: `<p>Hi ${name},</p><p>Thanks for contacting us. We'll get back to you soon.</p><p>— Team</p>`,
  });

  res.status(201).json({
    success: true,
    message: "Your message has been submitted successfully!",
  });
});
