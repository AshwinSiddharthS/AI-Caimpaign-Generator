import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/retry.js";
import { env } from "../config/env.js";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.requestId ?? "unknown";

  if (err instanceof AppError) {
    // Known application error — safe to surface code/message
    if (env.NODE_ENV !== "production") {
      console.error(`[${requestId}] AppError ${err.code}:`, err.message);
    } else {
      console.error(`[${requestId}] AppError ${err.code}`);
    }

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
        requestId,
      },
    });
    return;
  }

  // Unknown error — log details server-side, send generic message
  console.error(`[${requestId}] Unhandled error:`, err);

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred. Please try again.",
      requestId,
    },
  });
}
