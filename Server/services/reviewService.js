// server/services/reviewService.js
const Review = require("../models/Review");
const Shop = require("../models/Shop");
const Appointment = require("../models/Appointment");
const Report = require("../models/Report");
const mongoose = require("mongoose");
const AppError = require("../utils/appError");

// Create a new review
exports.createReview = async ({
  shopId,
  appointmentId,
  userId,
  rating,
  title,
  content,
  media,
}) => {
  const shop = await Shop.findById(shopId);
  if (!shop) {
    throw new AppError("Shop not found", 404);
  }

  let isVerified = false;
  let appointment = null;

  if (appointmentId) {
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      throw new AppError("Invalid appointment ID format.", 400);
    }

    appointment = await Appointment.findById(appointmentId);
    if (
      appointment &&
      appointment.user.toString() === userId.toString() &&
      appointment.shop.toString() === shopId &&
      appointment.status === "completed"
    ) {
      isVerified = true;
      appointment.isReviewed = true;
      await appointment.save();
    } else if (appointment) {
      throw new AppError("Cannot review an appointment that is not completed or does not belong to you/this shop.", 400);
    } else {
        throw new AppError("Appointment not found.", 404);
    }
  } else {
    const completedAppointment = await Appointment.findOne({
      user: userId,
      shop: shopId,
      status: "completed",
      isReviewed: false,
    });

    if (completedAppointment) {
      isVerified = true;
      appointment = completedAppointment;
      appointment.isReviewed = true;
      await appointment.save();
    }
  }

  const existingReview = await Review.findOne({
    user: userId,
    shop: shopId,
  });

  if (existingReview) {
    throw new AppError("You have already reviewed this shop", 409);
  }

  const review = new Review({
    user: userId,
    shop: shopId,
    appointment: appointment ? appointment._id : null,
    rating: Number(rating),
    title,
    content,
    media: media || [],
    isVerified,
    status: "approved",
  });

  await review.save();

  shop.reviews.push(review._id);

  const allShopReviews = await Review.find({
    shop: shopId,
    status: "approved",
  });

  const totalRating = allShopReviews.reduce(
    (sum, review) => sum + review.rating,
    0
  );
  shop.ratings.average = totalRating / allShopReviews.length;
  shop.ratings.count = allShopReviews.length;

  await shop.save();

  return review;
};

exports.getShopReviews = async (shopId, options) => {
  const { page, limit, sort } = options;

  const shop = await Shop.findById(shopId);
  if (!shop) {
    throw new AppError('Shop not found', 404);
  }

  let sortOption = {};
  if (sort === 'recent') {
    sortOption = { createdAt: -1 };
  } else if (sort === 'highest') {
    sortOption = { rating: -1 };
  } else if (sort === 'lowest') {
    sortOption = { rating: 1 };
  } else if (sort === 'helpful') {
    sortOption = { 'helpful.count': -1 };
  } else {
    sortOption = { createdAt: -1 };
  }

  const reviews = await Review.find({
    shop: shopId,
    status: 'approved'
  })
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('user', 'name profilePicture');

  const totalReviews = await Review.countDocuments({
    shop: shopId,
    status: 'approved'
  });

  const ratingDistribution = await Review.aggregate([
    { $match: { shop: new mongoose.Types.ObjectId(shopId), status: 'approved' } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } }
  ]);

  const distribution = {
    5: 0, 4: 0, 3: 0, 2: 0, 1: 0
  };

  ratingDistribution.forEach(item => {
    distribution[item._id] = item.count;
  });

  return {
    reviews,
    pagination: {
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
      currentPage: page,
      limit
    },
    ratingStats: {
      average: shop.ratings.average || 0,
      count: shop.ratings.count || 0,
      distribution
    }
  };
};

exports.addOwnerResponse = async (reviewId, content, ownerId) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new AppError("Review not found", 404);
  }

  const shop = await Shop.findById(review.shop);
  if (!shop || shop.owner.toString() !== ownerId.toString()) {
    throw new AppError(
      "Unauthorized: You are not authorized to respond to this review",
      403
    );
  }

  review.ownerResponse = {
    content,
    createdAt: new Date(),
  };

  await review.save();

  return review;
};

exports.markReviewHelpful = async (reviewId, userId) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new AppError("Review not found", 404);
  }

  const alreadyMarked = review.helpful.users.includes(userId);

  if (alreadyMarked) {
    review.helpful.users = review.helpful.users.filter(
      (id) => id.toString() !== userId.toString()
    );
    review.helpful.count -= 1;
  } else {
    review.helpful.users.push(userId);
    review.helpful.count += 1;
  }

  await review.save();

  return {
    message: alreadyMarked ? "Helpful mark removed" : "Marked as helpful",
    helpful: {
      count: review.helpful.count,
      isMarkedByUser: !alreadyMarked,
    },
  };
};

exports.reportReview = async (reviewId, reason, userId) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new AppError("Review not found", 404);
  }

  const report = new Report({
    reportedBy: userId,
    reportType: "review",
    review: reviewId,
    reason,
    status: "pending",
  });

  await report.save();

  return report;
};

exports.getUserReviews = async (userId, options) => {
  const { page, limit } = options;

  const reviews = await Review.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("shop", "name category address");

  const totalReviews = await Review.countDocuments({ user: userId });

  return {
    reviews,
    pagination: {
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
      currentPage: page,
      limit,
    },
  };
};