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
 * @param {Object} serviceData
 * @returns {Promise}
 */
export const updateService = async (serviceId, serviceData) => {
  return api.put(`/services/${serviceId}`, serviceData);
};

/**
 * Delete a service by ID.
 * @param {string} serviceId
 * @returns {Promise}
 */
export const deleteService = async (serviceId) => {
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
