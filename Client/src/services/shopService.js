// client/src/services/shopService.js
import api from './api';

// Get all shops
export const getAllShops = async () => {
  return api.get('/shops/vendor/shop');
};

// Get shop by ID
export const getShopById = async (shopId) => {
  return api.get(`/shops/${shopId}`);
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
  return api.post(`/shops/${shopId}/toggle-favorite`);
};

// Get favorite shops
export const getFavoriteShops = async () => {
  return api.get('/shops/favorites');
  
};
