// server/routes/promotionRoutes.js
const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { auth, shopOwner } = require('../middlewares/authMiddleware');

// --- Routes for shop owners (protected by auth and shopOwner) ---

// Create a new promotion for a shop
router.post('/shops/:shopId', auth, shopOwner, promotionController.createPromotion);

// Get all promotions for a specific shop (now protected for shop owners to manage their promotions)
router.get('/shops/:shopId', auth, shopOwner, promotionController.getShopPromotions);

// Update a specific promotion
router.put('/:promotionId', auth, shopOwner, promotionController.updatePromotion);

// Delete a specific promotion
router.delete('/:promotionId', auth, shopOwner, promotionController.deletePromotion);

// --- Public routes ---

// Public route to validate a promotion (requires auth to get user ID for usage checks)
router.post('/shops/:shopId/validate', auth, promotionController.validatePromotion);

// Public route to get active promotions for a shop (visible to all users/customers)
router.get('/shops/:shopId/active', promotionController.getActivePromotions);

module.exports = router;