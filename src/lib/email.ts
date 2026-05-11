import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error("Email service not configured. Please check GMAIL_USER and GMAIL_APP_PASSWORD.");
  }

  try {
    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME ?? "ENTPrep"}" <${process.env.GMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Failed to send verification email. Please try again later.");
  }
}
