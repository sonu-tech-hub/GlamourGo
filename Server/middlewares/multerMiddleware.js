// backend/middleware/multerMiddleware.js
const multer = require('multer');

// Configure Multer to store files in memory as a buffer.
// This is ideal when you're immediately passing the file to a cloud service like Cloudinary.
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit (matching frontend validation)
    fileFilter: (req, file, cb) => {
        // Check file type: only allow images
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true); // Accept the file
        } else {
            // Reject the file with a custom error message
            cb(new Error('Only image files (JPEG, JPG, PNG, GIF) are allowed!'), false);
        }
    }
});

module.exports = upload; // Export the configured Multer instance