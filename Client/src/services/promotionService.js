// client/src/services/promotionService.js
import api from './api';

// Validate promotion code
export const validatePromotion = async (data) => {
  return api.post('/promotions/validate', data);
};

// Get shop promotions (for customers)
export const getShopPromotions = async (shopId) => {
  return api.get(`/shops/${shopId}/promotions`);
};

// Apply promotion to appointment
export const applyPromotion = async (appointmentId, couponCode) => {
  return api.post(`/appointments/${appointmentId}/apply-promotion`, { couponCode });
};
