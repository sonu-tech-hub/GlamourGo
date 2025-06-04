// server/routes/promotionRoutes.js
const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { auth, shopOwner } = require('../middlewares/authMiddleware');

// Routes for shop owners (protected by auth and shopOwner)
router.post('/shops/:shopId', auth, shopOwner, promotionController.createPromotion);
router.get('/shops/:shopId', promotionController.getShopPromotions); // Public route to get all promotions for a shop
router.put('/:promotionId', auth, shopOwner, promotionController.updatePromotion);
router.delete('/:promotionId', auth, shopOwner, promotionController.deletePromotion);

// Public route to validate a promotion
router.post('/shops/:shopId/validate', auth, promotionController.validatePromotion); // Requires auth to know the user

// Public route to get active promotions for a shop
router.get('/shops/:shopId/active', promotionController.getActivePromotions);

module.exports = router;