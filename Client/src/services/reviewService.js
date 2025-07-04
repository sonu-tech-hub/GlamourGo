// client/src/services/reviewService.js
import api from "./api";

// Get reviews for a shop
export const getShopReviews = (shopId, params) => {
  // Example for getShopReviews, assuming it fetches reviews for a specific shop
  return api.get(`/reviews/shop/${shopId}`, { params });
};

// Submit a review
export const submitReview = async (formData) => {
  return api.post("/reviews", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Reply to a review (for vendors)
export const replyToReview = (reviewId, data) => {
  // data should now be an object like { content: "...", shopId: "..." }
  return api.post(`/reviews/${reviewId}/response`, data);
};

// Mark review as helpful
export const markReviewAsHelpful = async (reviewId) => {
  return api.post(`/reviews/${reviewId}/helpful`);
};

// Get user's reviews
export const getUserReviews = async () => {
  return api.get("/reviews/user");
};
