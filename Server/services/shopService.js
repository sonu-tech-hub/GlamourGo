// server/services/shopService.js
const Shop = require('../models/Shop');
const User = require('../models/User');
const mongoose = require('mongoose');

// Create a new shop
exports.createShop = async (shopData, userId) => {
  // Check if user already has a shop
  const existingShop = await Shop.findOne({ owner: userId });
  if (existingShop) {
    throw new Error('You already have a registered shop');
  }
  
  // Create new shop
  const shop = new Shop({
    ...shopData,
    owner: userId,
    isVerified: false, // Shops need admin verification
    isActive: false
  });
  
  await shop.save();
  
  // Update user type to vendor
  await User.findByIdAndUpdate(userId, { userType: 'vendor', shopId: shop._id });
  
  return shop;
};

// Get shop by ID
exports.getShopById = async (shopId, userId = null) => {
  const shop = await Shop.findById(shopId)
    .populate('owner', 'name email phone')
    .populate('reviews');
  
  if (!shop) {
    throw new Error('Shop not found');
  }
  
  // Check if shop is in user's favorites
  let isFavorite = false;
  if (userId) {
    const user = await User.findById(userId);
    isFavorite = user.favorites.includes(shopId);
  }
  
  // Format operating hours
  const formattedShop = shop.toObject();
  formattedShop.isFavorite = isFavorite;
  
  return formattedShop;
};

// Get all shops with filtering
exports.getAllShops = async (filters = {}) => {
  const { 
    category, 
    location, 
    query, 
    rating, 
    priceRange,
    sortBy = 'popularity',
    page = 1,
    limit = 10
  } = filters;
  
  const queryOptions = {};
  
  // Filter by category
  if (category) {
    queryOptions.category = category;
  }
  
  // Filter by location (city or state)
  if (location) {
    queryOptions['$or'] = [
      { 'address.city': { $regex: location, $options: 'i' } },
      { 'address.state': { $regex: location, $options: 'i' } }
    ];
  }
  
  // Filter by search query
  if (query) {
    queryOptions['$or'] = queryOptions['$or'] || [];
    queryOptions['$or'].push(
      { name: { $regex: query, $options: 'i' } },
      { 'services.name': { $regex: query, $options: 'i' } },
      { category: { $regex: query, $options: 'i' } }
    );
  }
  
  // Filter by rating
  if (rating) {
    queryOptions['ratings.average'] = { $gte: Number(rating) };
  }
  
  // Filter by price range
  if (priceRange && priceRange.length === 2) {
    queryOptions['services.price'] = { 
      $gte: Number(priceRange[0]), 
      $lte: Number(priceRange[1]) 
    };
  }
  
  // Only return verified and active shops
  queryOptions.isVerified = true;
  queryOptions.isActive = true;
  
  // Set up sorting
  let sortOptions = {};
  switch (sortBy) {
    case 'popularity':
      sortOptions = { 'stats.totalBookings': -1 };
      break;
    case 'rating':
      sortOptions = { 'ratings.average': -1 };
      break;
    case 'priceAsc':
      // This is a bit tricky as shops have multiple services
      // For simplicity, we're using the average service price
      sortOptions = { 'stats.averagePrice': 1 };
      break;
    case 'priceDesc':
      sortOptions = { 'stats.averagePrice': -1 };
      break;
    default:
      sortOptions = { 'ratings.average': -1 };
  }
  
  // Execute query with pagination
  const shops = await Shop.find(queryOptions)
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(Number(limit));
  
  // Get total count for pagination
  const totalShops = await Shop.countDocuments(queryOptions);
  
  return {
    shops,
    pagination: {
      totalShops,
      totalPages: Math.ceil(totalShops / limit),
      currentPage: Number(page),
      limit: Number(limit)
    }
  };
};

// Get nearby shops
exports.getNearbyShops = async (coordinates, radius = 10, filters = {}) => {
  const { latitude, longitude } = coordinates;
  
  if (!latitude || !longitude) {
    throw new Error('Coordinates are required');
  }
  
  const { category, query, rating } = filters;
  
  // Convert radius from kilometers to meters
  const radiusInMeters = radius * 1000;
  
  const queryOptions = {
    'address.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: radiusInMeters
      }
    },
    isVerified: true,
    isActive: true
  };
  
  // Apply additional filters
  if (category) {
    queryOptions.category = category;
  }
  
  if (rating) {
    queryOptions['ratings.average'] = { $gte: Number(rating) };
  }
  
  if (query) {
    queryOptions['$or'] = [
      { name: { $regex: query, $options: 'i' } },
      { 'services.name': { $regex: query, $options: 'i' } },
      { category: { $regex: query, $options: 'i' } }
    ];
  }
  
  const shops = await Shop.find(queryOptions);
  
  return shops;
};

// Update shop
exports.updateShop = async (shopId, updateData, userId) => {
  const shop = await Shop.findById(shopId);
  
  if (!shop) {
    throw new Error('Shop not found');
  }
  
  // Verify ownership
  if (shop.owner.toString() !== userId) {
    throw new Error('Unauthorized: You are not the owner of this shop');
  }
  
  // Fields that cannot be updated directly
  const restrictedFields = ['owner', 'isVerified', 'ratings', 'reviews'];
  
  // Remove restricted fields from update data
  restrictedFields.forEach(field => {
    if (updateData[field]) {
      delete updateData[field];
    }
  });
  
  // Update shop
  Object.assign(shop, updateData);
  await shop.save();
  
  return shop;
};

// Toggle favorite shop
exports.toggleFavorite = async (shopId, userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const shop = await Shop.findById(shopId);
  
  if (!shop) {
    throw new Error('Shop not found');
  }
  
  const isAlreadyFavorite = user.favorites.includes(shopId);
  
  if (isAlreadyFavorite) {
    // Remove from favorites
    user.favorites = user.favorites.filter(id => id.toString() !== shopId);
  } else {
    // Add to favorites
    user.favorites.push(shopId);
  }
  
  await user.save();
  
  return {
    isFavorite: !isAlreadyFavorite
  };
};

// Get user's favorite shops
exports.getFavoriteShops = async (userId) => {
  const user = await User.findById(userId).populate('favorites');
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user.favorites;
};

// Search shops
exports.searchShops = async (query, filters = {}) => {
  if (!query) {
    return await this.getAllShops(filters);
  }
  
  // Build the search query
  const searchQuery = {
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { category: { $regex: query, $options: 'i' } },
      { 'services.name': { $regex: query, $options: 'i' } },
      { 'address.city': { $regex: query, $options: 'i' } },
      { 'address.state': { $regex: query, $options: 'i' } }
    ],
    isVerified: true,
    isActive: true
  };
  
  // Apply additional filters
  const { category, rating, priceRange } = filters;
  
  if (category) {
    searchQuery.category = category;
  }
  
  if (rating) {
    searchQuery['ratings.average'] = { $gte: Number(rating) };
  }
  
  if (priceRange && priceRange.length === 2) {
    searchQuery['services.price'] = { 
      $gte: Number(priceRange[0]), 
      $lte: Number(priceRange[1]) 
    };
  }
  
  const shops = await Shop.find(searchQuery)
    .sort({ 'ratings.average': -1 });
  
  return shops;
};

// Get featured shops
exports.getFeaturedShops = async (limit = 6) => {
  const featuredShops = await Shop.find({
    featuredUntil: { $gt: new Date() },
    isVerified: true,
    isActive: true
  })
  .sort({ 'ratings.average': -1 })
  .limit(Number(limit));
  
  return featuredShops;
};