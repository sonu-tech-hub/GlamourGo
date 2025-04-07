// server/controllers/reviewController.js
const reviewService = require('../services/reviewService');
const multer = require('multer');
const path = require('path');

// Set up multer storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/reviews/');
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `review-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Upload middleware
exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
}).array('media', 5); // Allow up to 5 images

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { shopId, appointmentId, rating, title, content } = req.body;
    const userId = req.user._id;
    
    // Handle media files
    const mediaFiles = req.files ? req.files.map(file => `/uploads/reviews/${file.filename}`) : [];
    
    const review = await reviewService.createReview({
      shopId,
      appointmentId,
      userId,
      rating,
      title,
      content,
      media: mediaFiles
    });
    
    res.status(201).json({
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get all reviews for a shop
exports.getShopReviews = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { page = 1, limit = 10, sort = 'recent' } = req.query;
    
    const reviewsData = await reviewService.getShopReviews(shopId, {
      page: Number(page),
      limit: Number(limit),
      sort
    });
    
    res.json(reviewsData);
  } catch (error) {
    console.error('Error fetching shop reviews:', error);
    res.status(400).json({ message: error.message });
  }
};

// Add shop owner response to a review
exports.addOwnerResponse = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { content } = req.body;
    const ownerId = req.user._id;
    
    const review = await reviewService.addOwnerResponse(reviewId, content, ownerId);
    
    res.json({
      message: 'Response added successfully',
      review
    });
  } catch (error) {
    console.error('Error adding owner response:', error);
    res.status(400).json({ message: error.message });
  }
};

// Mark review as helpful
exports.markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;
    
    const result = await reviewService.markReviewHelpful(reviewId, userId);
    
    res.json(result);
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    res.status(400).json({ message: error.message });
  }
};

// Report a review
exports.reportReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;
    
    const report = await reviewService.reportReview(reviewId, reason, userId);
    
    res.json({
      message: 'Review reported successfully',
      report
    });
  } catch (error) {
    console.error('Error reporting review:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get user's reviews
exports.getUserReviews = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;
    
    const reviewsData = await reviewService.getUserReviews(userId, {
      page: Number(page),
      limit: Number(limit)
    });
    
    res.json(reviewsData);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(400).json({ message: error.message });
  }
};