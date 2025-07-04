// server/server.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const path = require("path");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const multer = require('multer'); // <--- Import multer for error handling
const routes = require("./routes"); // Assuming this imports your main router
const AppError = require("./utils/appError"); // <--- Uncommented and confirmed path

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Suppress Mongoose DeprecationWarning for strictQuery
mongoose.set("strictQuery", false);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// --- Cloudinary Configuration ---
// Ensure Cloudinary configuration is loaded (it auto-configures when required)
// This path assumes your config/cloudinaryConfig.js is at the root of 'server'
require('./config/cloudinaryConfig'); // <--- ADDED: Ensure Cloudinary config is loaded

// Apply security headers
app.use(helmet());

// CORS should generally be configured early, before other parsers or rate limiters
// if you need to allow specific origins.
app.use(cors());

// Rate limiting configuration
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 500, // Temporarily allow 500 requests per minute from each IP for testing
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", apiLimiter); // Apply this broader limiter to all API routes

// Body parsers
app.use(express.json({ limit: '10kb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // Limit URL-encoded payload size

// Logging middleware
app.use(morgan("dev"));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
// The `routes` module should contain all your specific route definitions.
app.use("/api", routes);

// --- GLOBAL ERROR HANDLING MIDDLEWARE ---
// This middleware should be the last one defined after all routes
app.use((err, req, res, next) => {
  // Set default status code and message if not already set by a previous error handler
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log detailed error in development mode
  if (process.env.NODE_ENV === 'development') {
    console.error('GLOBAL ERROR HANDLER 💥', err);
  }

  // Handle specific types of errors
  // 1. Multer Errors
  if (err instanceof multer.MulterError) {
    let statusCode = 400;
    let message = 'File upload failed.';

    if (err.code === 'LIMIT_FILE_SIZE') {
      statusCode = 413;
      message = 'File too large! Max 5MB allowed per image.';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      // This happens if the frontend sends a file field name that Multer doesn't expect
      // (e.g., frontend sends 'myFile' but backend expects 'media')
      statusCode = 400;
      message = `Unexpected file field: "${err.field}". Ensure the file input field name on the frontend matches "media".`;
    } else if (err.code === 'MISSING_FIELD_NAME') {
      statusCode = 400;
      message = 'Missing file field name in request (Multer).';
    }
    console.error('MULTER ERROR CAUGHT IN GLOBAL HANDLER 💥', err);
    return res.status(statusCode).json({
      status: 'fail',
      message: message,
    });
  }

  // 2. Custom Error from Multer's fileFilter (e.g., for disallowed file types)
  // This is a standard Error object, not a MulterError.
  if (err.message === 'Only image files (JPEG, JPG, PNG, GIF) are allowed!') {
    return res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }

  // 3. Operational Errors (AppError instances)
  // These are errors we create ourselves, meaning we know them and can send specific messages.
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // 4. Mongoose CastError (e.g., invalid ObjectId format)
  if (err.name === 'CastError') {
      return res.status(400).json({
          status: 'fail',
          message: `Invalid ${err.path}: ${err.value}.`
      });
  }

  // 5. Mongoose ValidationError (e.g., schema validation fails)
  if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(el => el.message);
      const message = `Invalid input data. ${errors.join('. ')}`;
      return res.status(400).json({
          status: 'fail',
          message: message
      });
  }

  // 6. Generic/Programming Errors (unknown errors)
  // For unexpected errors, send a generic message and log the full error stack in dev.
  console.error('UNEXPECTED SERVER ERROR 💥', err); // Log unhandled errors
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong on our end! Please try again later.',
  });
});


// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build", "index.html"));
  });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;