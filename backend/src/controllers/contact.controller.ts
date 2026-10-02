import type { RequestHandler } from "express";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(1),
  message: z.string().min(1),
});

const createContactMessage = async (_data: z.infer<typeof contactSchema>) => {
  return { _id: "contact-message-id" };
};

const getContactMessages = async () => {
  return [];
};

const createContact: RequestHandler = async (req, res) => {
  const data = contactSchema.parse(req.body);

  const contact = await createContactMessage(data);

  res.status(201).json({
    success: true,
    message: "Your message has been received. Our team will get back to you.",
    data: {
      id: contact._id,
    },
  });
};

const getContacts: RequestHandler = async (_req, res) => {
  const contacts = await getContactMessages();

  res.json({
    success: true,
    data: contacts,
  });
};

export { createContact, getContacts };