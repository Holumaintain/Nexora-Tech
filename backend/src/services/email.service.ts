import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const smtpConfigured =
  Boolean(env.SMTP_HOST) &&
  Boolean(env.SMTP_USER) &&
  Boolean(env.SMTP_PASS);

const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    })
  : null;

type SendEmailOptions = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

async function sendEmail({
  to,
  subject,
  text,
  html,
}: SendEmailOptions): Promise<void> {
  if (!transporter) {
    console.warn(
      "SMTP is not configured. Email was not sent.",
    );

    return;
  }

  await transporter.sendMail({
    from: env.MAIL_FROM,
    to,
    subject,
    text,
    html,
  });
}

type ContactNotificationData = {
  name: string;
  email: string;
  company?: string;
  subject?: string;
  message: string;
};

async function sendContactNotification({
  name,
  email,
  company,
  subject,
  message,
}: ContactNotificationData): Promise<void> {
  const emailSubject =
    subject?.trim() || "New Nexora website enquiry";

  const text = [
    "New contact form submission",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Company: ${company || "Not provided"}`,
    `Subject: ${emailSubject}`,
    "",
    "Message:",
    message,
  ].join("\n");

  await sendEmail({
    to: env.CONTACT_RECEIVER,
    subject: emailSubject,
    text,
  });
}

export {
  sendEmail,
  sendContactNotification,
};

export type {
  SendEmailOptions,
  ContactNotificationData,
};