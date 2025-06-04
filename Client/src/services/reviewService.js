// client/src/services/reviewService.js
import api from './api';

// Get reviews for a shop
export const getShopReviews = async (shopId) => {
  return api.get(`/shops/${shopId}/reviews`);
};

// Submit a review
export const submitReview = async (formData) => {
  return api.post('/reviews', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Reply to a review (for vendors)
export const replyToReview = async (reviewId, content) => {
  return api.post(`/reviews/${reviewId}/reply`, { content });
};

// Mark review as helpful
export const markReviewAsHelpful = async (reviewId) => {
  return api.post(`/reviews/${reviewId}/helpful`);
};

// Get user's reviews
export const getUserReviews = async () => {
  return api.get('/reviews/user');
};
