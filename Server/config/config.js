// server/config/config.js
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  mongoURI: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '30d',
  
  // Email configuration
  emailUser: process.env.EMAIL_USER,
  emailPassword: process.env.EMAIL_PASSWORD,
  
  // Razorpay configuration
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
  
  // Frontend URL for links in emails
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Upload directory
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  
  // Limits
  maxFileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024, // 5MB
  
  // API rate limits
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // max requests per window
  }
};