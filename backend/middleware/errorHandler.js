/**
 * AmpEdge — Global Error Handler & Async Wrapper
 * Production-ready centralized error handling
 */

// Custom API Error class
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Async handler wrapper — eliminates try/catch in every controller
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Central error response middleware
const errorHandler = (err, req, res, _next) => {
  let error = { ...err };
  error.message = err.message;

  // Log for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('[ERROR]', err);
  } else {
    console.error('[ERROR]', err.message);
  }

  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id ${err.value}`;
    error = new ApiError(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `Duplicate value for ${field}. This ${field} already exists.`;
    error = new ApiError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    const message = messages.join('. ');
    error = new ApiError(message, 400);
  }

  // JSON parse error
  if (err.type === 'entity.parse.failed') {
    error = new ApiError('Invalid JSON in request body', 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError('Invalid authentication token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    error = new ApiError('Authentication token has expired', 401);
  }

  // express-validator errors
  if (err.array && typeof err.array === 'function') {
    const messages = err.array().map((e) => e.msg);
    error = new ApiError(messages.join('. '), 400);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { ApiError, asyncHandler, errorHandler };
