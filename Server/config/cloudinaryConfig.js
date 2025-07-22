// config/cloudinaryConfig.js
const cloudinary = require('cloudinary').v2;
require('dotenv').config(); // Make sure to install dotenv (npm install dotenv) and have your .env file

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true // Ensures URLs are HTTPS
});

module.exports = cloudinary;k