import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),

  email: z.string().trim().email(),

  company: z
    .string()
    .trim()
    .max(160)
    .optional()
    .or(z.literal("")),

  subject: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal("")),

  message: z.string().trim().min(5).max(5000),
});

export { contactSchema };