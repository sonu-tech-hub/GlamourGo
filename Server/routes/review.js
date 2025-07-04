// server/routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { auth, shopOwner } = require('../middlewares/authMiddleware');

// Middleware to handle file uploads for creating reviews
// reviewController.upload now directly corresponds to multerMiddleware.array('media', 5)
const upload = reviewController.upload;

// Route for submitting a new review - Multer middleware 'upload' is correctly placed here
router.post('/', auth, upload, reviewController.createReview);

// Other review routes
router.get('/shop/:shopId', reviewController.getShopReviews);
router.post('/:reviewId/response', auth, shopOwner, reviewController.addOwnerResponse);
router.post('/:reviewId/helpful', auth, reviewController.markReviewHelpful);
router.post('/:reviewId/report', auth, reviewController.reportReview);
router.get('/user', auth, reviewController.getUserReviews);

module.exports = router;