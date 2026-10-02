import { Contact } from "../models/Contact.js";
import { sendContactNotification } from "./email.service.js";

type ContactMessageData = {
  name: string;
  email: string;
  company?: string;
  subject?: string;
  message: string;
};

async function createContactMessage(data: ContactMessageData) {
  const contact = await Contact.create(data);

  try {
    await sendContactNotification(data);
  } catch (error) {
    console.error("Contact email notification failed:", error);
  }

  return contact;
}

async function getContactMessages() {
  return Contact.find()
    .sort({ createdAt: -1 })
    .lean();
}

export {
  createContactMessage,
  getContactMessages,
};

export type {
  ContactMessageData,
};