import { env } from "../config/env.js";

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number,
    public readonly details?: { field?: string; message: string }[]
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class AIResponseInvalidError extends AppError {
  constructor(message: string) {
    super("AI_RESPONSE_INVALID", message, 502);
  }
}

export class AIProviderError extends AppError {
  constructor(message: string = "The AI service is currently unavailable. Please try again.") {
    super("AI_PROVIDER_ERROR", message, 502);
  }
}

export class RequestTimeoutError extends AppError {
  constructor() {
    super(
      "REQUEST_TIMEOUT",
      "The campaign is taking longer than expected. Please try again.",
      504
    );
  }
}

export class RateLimitedError extends AppError {
  constructor(message: string = "We're getting a lot of requests. Please try again in a minute.") {
    super("RATE_LIMITED", message, 429);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string = "The AI service is temporarily experiencing high demand. Please try again.") {
    super("SERVICE_UNAVAILABLE", message, 503);
  }
}

/**
 * Retry wrapper with exponential-ish backoff.
 * Retries on transient errors; never retries on 4xx client errors.
 */
export async function withRetry<T>(
  fn: (attempt: number, feedback: string[]) => Promise<T>,
  maxRetries: number = env.AI_MAX_RETRIES
): Promise<T> {
  let lastError: unknown;
  let feedback: string[] = [];

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn(attempt, feedback);
    } catch (err) {
      lastError = err;

      // Never retry on AppError with 4xx (client errors)
      if (err instanceof AppError && err.statusCode < 500) {
        throw err;
      }

      // Collect feedback for next attempt
      if (err instanceof Error) {
        feedback = [err.message];
      }

      if (attempt < maxRetries) {
        const delay = Math.min(500 * Math.pow(2, attempt), 3000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Creates an AbortController that times out after ms milliseconds.
 */
export function createTimeoutController(ms: number): AbortController {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  // Clear timer if signal is already aborted externally
  controller.signal.addEventListener("abort", () => clearTimeout(timer));
  return controller;
}
