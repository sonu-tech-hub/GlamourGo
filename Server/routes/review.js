// server/routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { auth, shopOwner } = require('../middlewares/authMiddleware');

// Middleware to handle file uploads for creating reviews
const upload = reviewController.upload;

router.post('/', auth, upload, reviewController.createReview);
router.get('/shop/:shopId', reviewController.getShopReviews);
router.post('/:reviewId/response', auth, shopOwner, reviewController.addOwnerResponse);
router.post('/:reviewId/helpful', auth, reviewController.markReviewHelpful);
router.post('/:reviewId/report', auth, reviewController.reportReview);
router.get('/user', auth, reviewController.getUserReviews);
// Assuming you might want to get a single review by ID (publicly or privately)
// router.get('/:reviewId', reviewController.getReviewById);

module.exports = router;