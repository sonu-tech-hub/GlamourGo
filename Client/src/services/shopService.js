// client/src/services/shopService.js
import api from './api';

// Get all shops
export const getAllShops = async () => {
  return api.get('/shops');
};
// Removed console.log("Grt All shpos", getAllShops()); - this would cause an infinite loop or unexpected behavior if not handled carefully.

// Get shop by ID
export const getShopById = async (shopId) => {
  return api.get(`/shops/${shopId}`);
};

// **NEW FUNCTION ADDED:** Get shop profile by owner ID
export const getShopProfileByOwnerId = async (ownerId) => {
  // Assuming your backend has an endpoint like /api/shops/owner/:ownerId
  return api.get(`/shops/owner/${ownerId}`);
};

// Search shops
export const searchShops = async (searchParams) => {
  return api.get('/shops/search', { params: searchParams });
};

// Get popular shops
export const getPopularShops = async () => {
  return api.get('/shops/popular');
};

// Get featured shops
export const getFeaturedShops = async () => {
  return api.get('/shops/featured');
};

// Toggle favorite shop
export const toggleFavoriteShop = async (shopId) => {
  return api.post(`/shops/${shopId}/favorite`);
};

// Get favorite shops
export const getFavoriteShops = async () => {
  return api.get('/shops/favorites');
};