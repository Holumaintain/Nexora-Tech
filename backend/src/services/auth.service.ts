import { User } from "../models/User.js";
import {
  hashPassword,
  comparePassword,
} from "../utils/password.js";
import { signToken } from "../utils/jwt.js";

async function registerUser(
  name: string,
  email: string,
  password: string,
) {
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw new Error("An account with this email already exists");
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,
    role: "user",
  });

  const token = signToken({
    id: user._id.toString(),
    role: user.role,
  });

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
}

async function loginUser(
  email: string,
  password: string,
) {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordMatches = await comparePassword(
    password,
    user.password,
  );

  if (!passwordMatches) {
    throw new Error("Invalid email or password");
  }

  const token = signToken({
    id: user._id.toString(),
    role: user.role,
  });

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
}

export {
  registerUser,
  loginUser,
};