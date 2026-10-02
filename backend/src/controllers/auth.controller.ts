import type { RequestHandler } from "express";
import { z } from "zod";
import * as UserModule from "../models/User.js";

const User = ("User" in UserModule ? UserModule.User : (UserModule as any).default) as any;

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const register: RequestHandler = async (req, res) => {
  const data = registerSchema.parse(req.body);

  const authService: any = await import("../services/auth.service.js");
  const registerUserFn =
    typeof authService.registerUser === "function"
      ? authService.registerUser
      : typeof authService.default?.registerUser === "function"
        ? authService.default.registerUser
        : undefined;

  if (!registerUserFn) {
    res.status(500).json({
      success: false,
      message: "User registration is unavailable",
    });

    return;
  }

  const result = await registerUserFn(data.name, data.email, data.password);

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: result,
  });
};

const login: RequestHandler = async (req, res) => {
  const data = loginSchema.parse(req.body);

  const authService: any = await import("../services/auth.service.js");
  const loginUserFn =
    typeof authService.loginUser === "function"
      ? authService.loginUser
      : typeof authService.default?.loginUser === "function"
        ? authService.default.loginUser
        : undefined;

  if (!loginUserFn) {
    res.status(500).json({
      success: false,
      message: "User authentication is unavailable",
    });

    return;
  }

  const result = await loginUserFn(data.email, data.password);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
};

const getMe: RequestHandler = async (req, res) => {
  if (!req.user?.id) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });

    return;
  }

  const user = await User.findById(req.user.id).select("-password").lean();

  if (!user) {
    res.status(404).json({
      success: false,
      message: "User not found",
    });

    return;
  }

  res.json({
    success: true,
    data: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

export { register, login, getMe };