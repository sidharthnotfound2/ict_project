/**
 * Central Error Handler Middleware
 * Formats every error to { success: false, message: string, data: null }
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Internal Error';

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    if (err.keyPattern && (err.keyPattern.titleLower || err.keyPattern.releaseYear)) {
      message = 'A movie with this title and release year already exists.';
    } else {
      message = 'Duplicate field value entered.';
    }
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map((val) => val.message);
    message = messages.join('. ');
  }

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field '${err.path}': ${err.value}`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    data: null
  });
};

module.exports = errorHandler;
