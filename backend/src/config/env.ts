import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z
    .coerce
    .number()
    .int()
    .positive()
    .default(5000),

  CLIENT_URL: z
    .string()
    .default("http://localhost:5500"),

  MONGODB_URI: z
    .string()
    .min(1),

  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters"),

  JWT_EXPIRES_IN: z
    .string()
    .default("7d"),

  SMTP_HOST: z
    .string()
    .optional(),

  SMTP_PORT: z
    .coerce
    .number()
    .int()
    .positive()
    .default(587),

  SMTP_USER: z
    .string()
    .optional(),

  SMTP_PASS: z
    .string()
    .optional(),

  MAIL_FROM: z
    .string()
    .email()
    .default("no-reply@nexora.tech"),

  CONTACT_RECEIVER: z
    .string()
    .email()
    .default("hello@nexora.tech"),
});

const env = envSchema.parse(process.env);

export {
  env,
};