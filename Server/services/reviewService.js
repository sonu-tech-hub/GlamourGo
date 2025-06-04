// server/services/reviewService.js
const Review = require('../models/Review');
const Shop = require('../models/Shop');
const Appointment = require('../models/Appointment');
const Report = require('../models/Report');
const mongoose = require('mongoose');

// Create a new review
exports.createReview = async ({ shopId, appointmentId, userId, rating, title, content, media }) => {
  // Check if shop exists
  const shop = await Shop.findById(shopId);
  if (!shop) {
    throw new Error('Shop not found');
  } 
  
  // Verify that the user has had an appointment at this shop
  let isVerified = false;
  let appointment = null;
  
  if (appointmentId) {
    appointment = await Appointment.findById(appointmentId);
    if (
      appointment &&
      appointment.user.toString() === userId.toString() &&
      appointment.shop.toString() === shopId &&
      appointment.status === 'completed'
    ) {
      isVerified = true;
      
      // Mark appointment as reviewed
      appointment.isReviewed = true;
      await appointment.save();
    } else if (appointment) {
      throw new Error('Cannot review an appointment that is not completed');
    }
  } else {
    // Check if user has any completed appointments at this shop
    const completedAppointment = await Appointment.findOne({
      user: userId,
      shop: shopId,
      status: 'completed',
      isReviewed: false
    });
    
    if (completedAppointment) {
      isVerified = true;
      appointment = completedAppointment;
      
      // Mark appointment as reviewed
      appointment.isReviewed = true;
      await appointment.save();
    }
  }
  
  // Check if user has already reviewed this shop
  const existingReview = await Review.findOne({
    user: userId,
    shop: shopId
  });
  
  if (existingReview) {
    throw new Error('You have already reviewed this shop');
  }
  
  // Create new review
  const review = new Review({
    user: userId,
    shop: shopId,
    appointment: appointment ? appointment._id : null,
    rating: Number(rating),
    title,
    content,
    media: media || [],
    isVerified,
    status: 'approved' // For simplicity, reviews are auto-approved
  });
  
  await review.save();
  
  // Update shop's average rating
  shop.reviews.push(review._id);
  
  const allShopReviews = await Review.find({ 
    shop: shopId,
    status: 'approved'
  });
  
  const totalRating = allShopReviews.reduce((sum, review) => sum + review.rating, 0);
  shop.ratings.average = totalRating / allShopReviews.length;
  shop.ratings.count = allShopReviews.length;
  
  await shop.save();
  
  return review;
};

// Get all reviews for a shop
exports.getShopReviews = async (shopId, options) => {
  const { page, limit, sort } = options;
  
  // Validate shop existence
  const shop = await Shop.findById(shopId);
  if (!shop) {
    throw new Error('Shop not found');
  }
  
  // Set up sorting
  let sortOption = {};
  if (sort === 'recent') {
    sortOption = { createdAt: -1 };
  } else if (sort === 'highest') {
    sortOption = { rating: -1 };
  } else if (sort === 'lowest') {
    sortOption = { rating: 1 };
  } else if (sort === 'helpful') {
    sortOption = { 'helpful.count': -1 };
  }
  
  // Get reviews with pagination
  const reviews = await Review.find({ 
    shop: shopId,
    status: 'approved'
  })
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('user', 'name profilePicture');
  
  // Get total count
  const totalReviews = await Review.countDocuments({ 
    shop: shopId,
    status: 'approved'
  });
  
  // Calculate rating distribution
  const ratingDistribution = await Review.aggregate([
    { $match: { shop: mongoose.Types.ObjectId(shopId), status: 'approved' } },
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
      average: shop.ratings.average,
      count: shop.ratings.count,
      distribution
    }
  };
};

// Add shop owner response to a review
exports.addOwnerResponse = async (reviewId, content, ownerId) => {
  // Find the review
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new Error('Review not found');
  }
  
  // Verify that the user is the shop owner
  const shop = await Shop.findById(review.shop);
  if (!shop || shop.owner.toString() !== ownerId.toString()) {
    throw new Error('Unauthorized: You are not authorized to respond to this review');
  }
  
  // Add owner response
  review.ownerResponse = {
    content,
    createdAt: new Date()
  };
  
  await review.save();
  
  return review;
};

// Mark review as helpful
exports.markReviewHelpful = async (reviewId, userId) => {
   // Find the review
   const review = await Review.findById(reviewId);
   if (!review) {
     throw new Error('Review not found');
   }
   
   // Check if user has already marked this review as helpful
   const alreadyMarked = review.helpful.users.includes(userId);
   
   if (alreadyMarked) {
     // Remove the helpful mark
     review.helpful.users = review.helpful.users.filter(id => id.toString() !== userId.toString());
     review.helpful.count -= 1;
   } else {
     // Mark as helpful
     review.helpful.users.push(userId);
     review.helpful.count += 1;
   }
   
   await review.save();
   
   return {
     message: alreadyMarked ? 'Helpful mark removed' : 'Marked as helpful',
     helpful: {
       count: review.helpful.count,
       isMarkedByUser: !alreadyMarked
     }
   };
 };
 
 // Report a review
 exports.reportReview = async (reviewId, reason, userId) => {
   // Find the review
   const review = await Review.findById(reviewId);
   if (!review) {
     throw new Error('Review not found');
   }
   
   // Create a report
   const report = new Report({
     reportedBy: userId,
     reportType: 'review',
     review: reviewId,
     reason,
     status: 'pending'
   });
   
   await report.save();
   
   return report;
 };
 
 // Get user's reviews
 exports.getUserReviews = async (userId, options) => {
   const { page, limit } = options;
   
   // Get reviews with pagination
   const reviews = await Review.find({ user: userId })
     .sort({ createdAt: -1 })
     .skip((page - 1) * limit)
     .limit(limit)
     .populate('shop', 'name category address');
   
   // Get total count
   const totalReviews = await Review.countDocuments({ user: userId });
   
   return {
     reviews,
     pagination: {
       totalReviews,
       totalPages: Math.ceil(totalReviews / limit),
       currentPage: page,
       limit
     }
   };
 };