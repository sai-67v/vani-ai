/**
 * src/lib/errors.js
 * Centralized error classes for the Vaani AI backend.
 * Skill: nodejs-best-practices — "Centralized Error Handling" pattern.
 *
 * Usage:
 *   const { ValidationError, NotFoundError } = require("./lib/errors");
 *   throw new ValidationError("Phone number must be in E.164 format");
 *
 * These are "operational" errors (expected failures, safe to expose to client).
 * Programmer errors (unexpected) should NOT use these — let them crash so
 * the unhandledRejection handler can catch them.
 */

class AppError extends Error {
  /**
   * @param {string} message   - User-facing error message
   * @param {number} statusCode - HTTP status code
   * @param {string} code       - Machine-readable error code
   */
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true; // flag: safe to expose to client
    Error.captureStackTrace(this, this.constructor);
  }
}

/** 400 — client sent invalid/malformed data */
class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

/** 404 — requested resource doesn't exist */
class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

/** 503 — upstream dependency (Twilio, Supabase) is unavailable */
class ServiceUnavailableError extends AppError {
  constructor(service = "External service") {
    super(`${service} is currently unavailable`, 503, "SERVICE_UNAVAILABLE");
  }
}

/**
 * Express error-handling middleware.
 * MUST be registered AFTER all routes: app.use(errorHandler)
 *
 * @param {Error} err
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.statusCode || 500;
  const isOperational = err.isOperational === true;

  // Always log full details server-side
  console.error(`[error][${req.method}][${req.originalUrl}]`, {
    code: err.code,
    message: err.message,
    stack: err.stack,
  });

  // Send sanitized response to client
  res.status(status).json({
    ok: false,
    code: err.code || "INTERNAL_ERROR",
    // Only expose message if it's an operational/expected error
    error: isOperational ? err.message : "An unexpected error occurred. Please try again.",
  });
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  ServiceUnavailableError,
  errorHandler,
};
