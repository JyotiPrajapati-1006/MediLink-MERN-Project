// middleware/errorMiddleware.js

// Handles requests to non-existent routes (404)
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error); // Pass the error to the global error handler
};

// Global error handler for all other errors
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // --- THIS IS THE FINAL FIX ---
  // Handle Mongoose validation errors by sending a structured object
  if (err.name === "ValidationError") {
    const errors = Object.keys(err.errors).reduce((acc, key) => {
      // The key will be 'name', 'email', 'password', etc.
      acc[key] = err.errors[key].message;
      return acc;
    }, {});

    return res.status(400).json({
      success: false,
      message: "Validation Failed",
      errors: errors, // Send the structured errors object
    });
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    message = `An account with that ${Object.keys(
      err.keyValue
    )} already exists.`;
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export { notFound, errorHandler };
