import mongoose from "mongoose";
import type {
  ErrorRequestHandler,
} from "express";

const errorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  console.error(error);

  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: Object.values(error.errors).map(
        (item) => item.message,
      ),
    });

    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      message: "Invalid resource ID",
    });

    return;
  }

  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  ) {
    res.status(409).json({
      success: false,
      message:
        "A record with that value already exists",
    });

    return;
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

export { errorHandler };