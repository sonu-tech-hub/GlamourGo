// client/src/services/vendorService.js
import api from './api';

// Get shop statistics
export const getShopStats = async () => {
  return api.get('/vendor/stats');
};

// Get upcoming appointments
export const getUpcomingAppointments = async () => {
  return api.get('/vendor/appointments/upcoming');
};

// Get shop revenue analytics
export const getRevenueAnalytics = async (period = 'month') => {
  return api.get(`/vendor/analytics/revenue?period=${period}`);
};

// Get customer analytics
export const getCustomerAnalytics = async () => {
  return api.get('/vendor/analytics/customers');
};

// Get shop customers
export const getShopCustomers = async () => {
  return api.get('/vendor/customers');
};

// Update shop profile
export const updateShopProfile = async (shopData) => {
  return api.put('/vendor/shop', shopData);
};

// Upload shop gallery image
export const uploadGalleryImage = async (formData) => {
  return api.post('/vendor/gallery', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Delete gallery image
export const deleteGalleryImage = async (imageId) => {
  return api.delete(`/vendor/gallery/${imageId}`);
};

// Get shop promotions
export const getShopPromotions = async () => {
  return api.get('/vendor/promotions');
};

// Create promotion
export const createPromotion = async (promotionData) => {
  return api.post('/vendor/promotions', promotionData);
};

// Update promotion
export const updatePromotion = async (promotionId, promotionData) => {
  return api.put(`/vendor/promotions/${promotionId}`, promotionData);
};

// Delete promotion
export const deletePromotion = async (promotionId) => {
  return api.delete(`/vendor/promotions/${promotionId}`);
};
