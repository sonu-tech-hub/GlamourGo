const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const serviceController = require('../controllers/serviceController.js');
const { auth, isAdmin, shopOwner } = require('../middlewares/authMiddleware');

// ---------------------
// Public Routes
// ---------------------
router.get('/', shopController.getAllShops);
router.get('/search', shopController.searchShops);
router.get('/featured', shopController.getFeaturedShops);
router.get('/favorites', auth , shopController.getFavoriteShops);
router.get('/nearby',auth, shopController.getNearbyShops);
router.get('/:shopId', shopController.getShopById); // Keep this LAST among public GETs to avoid shadowing

// ---------------------
// Shop Owner Routes
// ---------------------
router.post('/', auth, shopController.createShop);

router.put('/:shopId', auth, shopOwner, shopController.updateShop);
router.post('/:shopId/favorite', auth, shopOwner, shopController.toggleFavorite);
router.get('/owner/me', auth, shopController.getMyShop);
router.get('/vendor/shop', auth,shopOwner, serviceController.getVendorServices);

// ---------------------
// Admin Routes
// ---------------------
router.get('/owner/:ownerId', auth, isAdmin, shopController.getShopsByOwner);
router.put('/admin/:shopId/verify', auth, isAdmin, shopController.updateVerificationStatus);
router.put('/admin/:shopId/activate', auth, isAdmin, shopController.updateActivationStatus);
router.get('/admin/all', auth, isAdmin, shopController.getAllShopsAdmin);

// ---------------------
module.exports = router;