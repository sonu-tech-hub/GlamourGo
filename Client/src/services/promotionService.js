// client/src/services/promotionService.js

import api from './api'; // Assuming 'api' is your configured Axios instance

/**
 * Creates a new promotion for a given shop.
 * Intended for shop owners.
 * @param {string} shopId - The ID of the shop to create the promotion for.
 * @param {object} promotionData - The data for the new promotion.
 * @returns {Promise<object>} A promise that resolves to the newly created promotion.
 */
export const createPromotion = async (shopId, promotionData) => {
  return api.post(`/promotions/shops/${shopId}`, promotionData);
};

/**
 * Gets all promotions for a specific shop, intended for shop owners/management.
 * This route is protected on the backend.
 * @param {string} shopId - The ID of the shop.
 * @param {string} [status] - Optional. The status to filter by ('active', 'upcoming', 'expired').
 * @returns {Promise<Array<object>>} A promise that resolves to an array of promotion objects.
 */
export const getShopPromotionsForOwner = async (shopId, status) => {
  const params = status ? { params: { status } } : {};
  return api.get(`/promotions/shops/${shopId}`, params);
};

/**
 * Updates an existing promotion.
 * Intended for shop owners.
 * @param {string} promotionId - The ID of the promotion to update.
 * @param {object} updatedData - The data to update the promotion with.
 * @param {string} data
 * @returns {Promise<object>} A promise that resolves to the updated promotion object.
 */
export const updatePromotion = async (promotionId, updatedData, shopId) => {
    const payload = { ...updatedData };
    // This is a workaround. If the backend's PUT route is misconfigured and
    // hitting the POST (create) endpoint, it might expect 'shop' in the body.
    // The ideal RESTful approach is for the backend to derive shopId from the promotion itself.
    if (shopId) {
        payload.shop = shopId;
    }
    return api.put(`/promotions/${promotionId}`, payload);
};
/**
 * Deletes a promotion.
 * Intended for shop owners.
 * @param {string} promotionId - The ID of the promotion to delete.
 * @returns {Promise<object>} A promise that resolves to a success message.
 * @param {string} shopId
 */
export const deletePromotion = async (promotionId,shopId) => {
  // Assumes your routes are mounted under '/promotions' prefix, e.g., /api/promotions/:promotionId
  console.log("delete",shopId)
  const responce = api.delete(`/promotions/${promotionId}`, {
     params: { shopId }, // Pass any additional data if needed, like shopId
  });
  return responce.data
};

// console.log('Promotion service loaded',deletePromotion()); // Debugging log to confirm service load
/**
 * Validates a promotion code for a given shop and transaction details.
 * @param {string} shopId - The ID of the shop where the promotion is being applied.
 * @param {object} validationData - Object containing couponCode, serviceIds, totalAmount, etc.
 * @returns {Promise<object>} A promise that resolves to the validation result.
 */
export const validatePromotion = async (shopId, validationData) => {
  // Backend route is POST /shops/:shopId/validate, so shopId needs to be in the URL
  return api.post(`/promotions/shops/${shopId}/validate`, validationData);
};

/**
 * Gets active promotions for a specific shop, intended for customer viewing.
 * @param {string} shopId - The ID of the shop.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of active promotion objects.
 */
export const getActiveShopPromotionsForCustomers = async (shopId) => {
  // This route is for public/customer-facing active promotions
  return api.get(`/promotions/shops/${shopId}/active`);
};


/**
 * Applies a promotion to an appointment.
 * @param {string} appointmentId - The ID of the appointment.
 * @param {string} couponCode - The coupon code to apply.
 * @returns {Promise<object>} A promise that resolves to the result of applying the promotion.
 */
export const applyPromotion = async (appointmentId, couponCode) => {
  // Assuming this route is correct and exists on the backend within your appointment routes
  return api.post(`/appointments/${appointmentId}/apply-promotion`, { couponCode });
};