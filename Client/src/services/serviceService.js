// client/src/api/serviceApi.js
import api from './api';

/**
 * Get all services for a specific shop.
 * @param {string} shopId
 * @returns {Promise}
 */
export const getShopServices = async (shopId) => {
  return api.get(`/services/${shopId}`);
};

/**
 * Create a new service for a shop.
 * @param {string} shopId
 * @param {Object} serviceData
 * @returns {Promise}
 */
export const createService = async (shopId, serviceData) => {
  return api.post(`/services/${shopId}`, serviceData);
};

/**
 * Update an existing service.
 * @param {string} serviceId
 * @param {Object} serviceData - Should contain all fields to update, including shopId if necessary for backend validation.
 * @returns {Promise}
 */
export const updateService = async (serviceId, serviceData) => { // Removed shopId from arguments here, as it's passed in serviceData or derived
  // If your backend *requires* shopId in the body for update, ensure serviceData contains it.
  // Based on serviceService.js, it's not strictly needed in the body for update, but it's good to include it for consistency or if backend validation expects it.
  return api.put(`/services/${serviceId}`, serviceData);
};

/**
 * Delete a service by ID.
 * @param {string} serviceId
 * @param {string} shopId - Passed as part of config.data for DELETE requests if the backend expects it in the body.
 * Alternatively, if it's a query param, use { params: { shopId } }.
 * Given your backend deleteService controller, shopId is NOT expected in the request body or query.
 * It only takes serviceId from params and ownerId from req.user.
 * So, the shopId here is redundant for the backend's current implementation.
 * However, if your backend *middleware* checks for it, you might need it.
 * For now, let's remove it as the backend doesn't explicitly use it for `deleteService` other than implicitly via `service.shop`.
 * Let's keep the client-side signature simpler if the backend doesn't need it.
 * @returns {Promise}
 */
export const deleteService = async (serviceId) => { // Removed shopId from arguments
  return api.delete(`/services/${serviceId}`);
};

/**
 * Get details of a specific service by ID.
 * @param {string} serviceId
 * @returns {Promise}
 */
export const getServiceDetails = async (serviceId) => {
  return api.get(`/services/${serviceId}`);
};