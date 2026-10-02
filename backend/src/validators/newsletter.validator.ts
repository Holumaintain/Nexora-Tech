import { z } from "zod";

const newsletterSchema = z.object({
  email: z.string().trim().email(),
});

export { newsletterSchema };