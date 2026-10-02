import express, {
  type Request,
  type Response,
} from "express";

import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";

import authRoutes from "./routes/auth.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import newsletterRoutes from "./routes/newsletter.routes.js";
import serviceRoutes from "./routes/service.routes.js";
import testimonialRoutes from "./routes/testimonial.routes.js";
import healthRoutes from "./routes/health.routes.js";
import blogRoutes from "./routes/blog.routes.js";

import { apiRateLimit } from "./middleware/rateLimit.middleware.js";
import { notFound } from "./middleware/notFound.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  }),
);

app.use(morgan("dev"));

app.use(apiRateLimit);

app.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Welcome to the Nexora Technologies API",
    version: "1.0.0",
  });
});

app.use("/api/auth", authRoutes);

app.use("/api/health", healthRoutes);

app.use("/api/blog", blogRoutes);

app.use("/api/contact", contactRoutes);

app.use("/api/newsletter", newsletterRoutes);

app.use("/api/services", serviceRoutes);

app.use("/api/testimonials", testimonialRoutes);

app.use(notFound);

app.use(errorHandler);

export default app;