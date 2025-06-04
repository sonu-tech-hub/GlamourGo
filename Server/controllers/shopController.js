const shopService = require('../services/shopService');
const asyncHandler = require('express-async-handler');

// @desc    Create a new shop
// @route   POST /api/shops
// @access  Private (customer - to become vendor)
exports.createShop = asyncHandler(async (req, res) => {
    const shop = await shopService.createShop(req.body, req.user.id);
    res.status(201).json(shop);
});

// @desc    Get shop by ID
// @route   GET /api/shops/:shopId
// @access  Public
exports.getShopById = asyncHandler(async (req, res) => {
    const { shopId } = req.params;
    const shop = await shopService.getShopById(shopId, req.user ? req.user.id : null);
    res.json(shop);
});

// @desc    Get all shops with filtering
// @route   GET /api/shops
// @access  Public
exports.getAllShops = asyncHandler(async (req, res) => {
    const shopsData = await shopService.getAllShops(req.query);
    res.json(shopsData);
});

// @desc    Get nearby shops
// @route   GET /api/shops/nearby
// @access  Public
exports.getNearbyShops = asyncHandler(async (req, res) => {
    const { latitude, longitude, radius, ...filters } = req.query;
    const coordinates = { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
    const shops = await shopService.getNearbyShops(coordinates, parseFloat(radius), filters);
    res.json(shops);
});

// @desc    Update shop
// @route   PUT /api/shops/:shopId
// @access  Private (owner)
exports.updateShop = asyncHandler(async (req, res) => {
    const { shopId } = req.params;
    const updatedShop = await shopService.updateShop(shopId, req.body, req.user.id);
    res.json(updatedShop);
});

// @desc    Toggle favorite shop
// @route   POST /api/shops/:shopId/favorite
// @access  Private (customer)
exports.toggleFavorite = asyncHandler(async (req, res) => {
    const { shopId } = req.params;
    const result = await shopService.toggleFavorite(shopId, req.user.id);
    res.json(result);
});

// @desc    Get user's favorite shops
// @route   GET /api/shops/favorites
// @access  Private (customer)
exports.getFavoriteShops = asyncHandler(async (req, res) => {
    const favoriteShops = await shopService.getFavoriteShops(req.user.id);
    res.json(favoriteShops);
});

// @desc    Search shops
// @route   GET /api/shops/search
// @access  Public
exports.searchShops = asyncHandler(async (req, res) => {
    const { query, ...filters } = req.query;
    const shops = await shopService.searchShops(query, filters);
    res.json(shops);
});

// @desc    Get featured shops
// @route   GET /api/shops/featured
// @access  Public
exports.getFeaturedShops = asyncHandler(async (req, res) => {
    const { limit } = req.query;
    const featuredShops = await shopService.getFeaturedShops(limit);
    res.json(featuredShops);
});

// @desc    Get logged-in vendor's shop
// @route   GET /api/shops/owner/me
// @access  Private (vendor)
exports.getMyShop = asyncHandler(async (req, res) => {
    const shop = await shopService.getShopsByOwner(req.user.id);
    // Assuming a vendor only has one shop
    res.json(shop ? shop[0] : null);
});

// @desc    Get shops by owner ID (admin)
// @route   GET /api/shops/owner/:ownerId
// @access  Private (admin)
exports.getShopsByOwner = asyncHandler(async (req, res) => {
    const { ownerId } = req.params;
    const shops = await shopService.getShopsByOwner(ownerId);
    res.json(shops);
});

// @desc    Update shop verification status (admin)
// @route   PUT /api/shops/admin/:shopId/verify
// @access  Private (admin)
exports.updateVerificationStatus = asyncHandler(async (req, res) => {
    const { shopId } = req.params;
    const { isVerified, verificationDetails } = req.body;
    const updatedShop = await shopService.updateVerificationStatus(shopId, isVerified, verificationDetails);
    res.json(updatedShop);
});

// @desc    Update shop activation status (admin)
// @route   PUT /api/shops/admin/:shopId/activate
// @access  Private (admin)
exports.updateActivationStatus = asyncHandler(async (req, res) => {
    const { shopId } = req.params;
    const { isActive } = req.body;
    const updatedShop = await shopService.updateActivationStatus(shopId, isActive);
    res.json(updatedShop);
});

// @desc    Get all shops for admin
// @route   GET /api/shops/admin/all
// @access  Private (admin)
exports.getAllShopsAdmin = asyncHandler(async (req, res) => {
    const shopsData = await shopService.getAllShopsAdmin(req.query);
    res.json(shopsData);
});
// @desc    Get shop by vendor (owner) ID
// @route   GET /api/shops/vendor
// @access  Private (vendor only)
exports.getShopByVendor = async (req, res) => {
  try {
    const ownerId = req.user.id; // From token via protect middleware
    const shop = await shopService.getShopByVendorId(ownerId);
    res.status(200).json(shop);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

