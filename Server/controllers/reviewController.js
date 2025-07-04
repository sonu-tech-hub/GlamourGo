// server/controllers/reviewController.js
const reviewService = require('../services/reviewService');
const mongoose = require('mongoose');
const AppError = require('../utils/appError');
const cloudinary = require('../config/cloudinaryConfig');
const multerMiddleware = require('../middlewares/multerMiddleware');

exports.upload = multerMiddleware.array('media', 5);

exports.createReview = async (req, res, next) => {
    try {
        const { shopId, appointmentId, rating, title, content } = req.body;
        const userId = req.user._id;

        const mediaFiles = [];

        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(async (file) => {
                const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
                if (!allowedMimeTypes.includes(file.mimetype)) {
                    throw new AppError(`Unsupported file type: ${file.originalname}.`, 400);
                }

                return new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        {
                            folder: 'reviews',
                            transformation: [{ width: 500, height: 500, crop: 'limit' }]
                        },
                        (error, result) => {
                            if (error) {
                                console.error('Cloudinary upload error:', error);
                                return reject(new AppError('Failed to upload image to Cloudinary.', 500));
                            }
                            resolve(result.secure_url);
                        }
                    ).end(file.buffer);
                });
            });

            const uploadedUrls = await Promise.all(uploadPromises);
            mediaFiles.push(...uploadedUrls);
        }

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
            status: 'success',
            message: 'Review submitted successfully',
            data: { review }
        });
    } catch (error) {
        console.error('Error creating review in controller:', error);
        if (error.message === 'Only image files (JPEG, JPG, PNG, GIF) are allowed!') {
            return next(new AppError(error.message, 400));
        }
        next(error);
    }
};

exports.getShopReviews = async (req, res, next) => {
    try {
        const { shopId } = req.params;
        const { page = 1, limit = 10, sort = 'recent' } = req.query;

        if (!shopId) {
            return next(new AppError('Shop ID is required for fetching reviews.', 400));
        }
        if (!mongoose.Types.ObjectId.isValid(shopId)) {
            return next(new AppError('Invalid Shop ID format.', 400));
        }

        const reviewsData = await reviewService.getShopReviews(shopId, {
            page: Number(page),
            limit: Number(limit),
            sort
        });

        res.json(reviewsData);
    } catch (error) {
        console.error('Error fetching shop reviews:', error.message);
        next(error);
    }
};

exports.addOwnerResponse = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const { content } = req.body;
        const ownerId = req.user?._id;

        if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) {
            console.error(`Validation Error: Invalid or missing reviewId - ${reviewId}`);
            return next(new AppError('Invalid or missing review ID.', 400));
        }

        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            console.error(`Validation Error: Reply content is empty or invalid for review ${reviewId}`);
            return next(new AppError('Reply content is required and cannot be empty.', 400));
        }

        if (!ownerId) {
            console.error(`Authentication Error: Owner ID not found in token for review ${reviewId}`);
            return next(new AppError('Authentication required: Owner ID not available.', 401));
        }

        const review = await reviewService.addOwnerResponse(reviewId, content, ownerId);

        res.status(200).json({
            status: 'success',
            message: 'Response added successfully',
            data: { review }
        });

    } catch (error) {
        console.error(`Failed to add owner response to review ${req.params.reviewId}:`, error);
        next(error);
    }
};

exports.markReviewHelpful = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user._id;

        const result = await reviewService.markReviewHelpful(reviewId, userId);

        res.json(result);
    } catch (error) {
        console.error('Error marking review as helpful:', error);
        next(error);
    }
};

exports.reportReview = async (req, res, next) => {
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
        next(error);
    }
};

exports.getUserReviews = async (req, res, next) => {
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
        next(error);
    }
};