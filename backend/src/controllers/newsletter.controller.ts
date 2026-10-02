import type { RequestHandler } from "express";
import { z } from "zod";

import {
  subscribeToNewsletter,
  getNewsletterSubscribers,
} from "../services/newsletter.service.js";

const newsletterSchema = z.object({
  email: z.string().trim().email(),
});

const subscribe: RequestHandler = async (req, res) => {
  const data = newsletterSchema.parse(req.body);

  const result = await subscribeToNewsletter(data.email);

  res.status(result.alreadySubscribed ? 200 : 201).json({
    success: true,
    message: result.alreadySubscribed
      ? "You are already subscribed to Nexora Insights."
      : "You have successfully subscribed to Nexora Insights.",
  });
};

const getSubscribers: RequestHandler = async (_req, res) => {
  const subscribers = await getNewsletterSubscribers();

  res.json({
    success: true,
    data: subscribers,
  });
};

export {
  subscribe,
  getSubscribers,
};