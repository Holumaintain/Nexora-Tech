import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

import { env } from "../config/env.js";

type AuthTokenPayload = {
  id: string;
  role: "user" | "admin";
};

function signToken(payload: AuthTokenPayload): string {
  const options: SignOptions = {};

  if (env.JWT_EXPIRES_IN !== undefined) {
    options.expiresIn = env.JWT_EXPIRES_IN as SignOptions["expiresIn"];
  }

  return jwt.sign(payload, env.JWT_SECRET, options);
}

function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(
    token,
    env.JWT_SECRET,
  ) as AuthTokenPayload;
}

export {
  signToken,
  verifyToken,
};

export type {
  AuthTokenPayload,
};