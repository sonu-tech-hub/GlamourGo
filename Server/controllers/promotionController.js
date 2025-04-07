// server/controllers/promotionController.js
const promotionService = require('../services/promotionService');

// Create a new promotion
exports.createPromotion = async (req, res) => {
  try {
    const shopId = req.params.shopId;
    const ownerId = req.user._id;
    const promotionData = req.body;
    
    const promotion = await promotionService.createPromotion(promotionData, shopId, ownerId);
    
    res.status(201).json({
      message: 'Promotion created successfully',
      promotion
    });
  } catch (error) {
    console.error('Error creating promotion:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get all promotions for a shop
exports.getShopPromotions = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { status } = req.query;
    
    const promotions = await promotionService.getShopPromotions(shopId, status);
    
    res.json({
      promotions
    });
  } catch (error) {
    console.error('Error fetching shop promotions:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update a promotion
exports.updatePromotion = async (req, res) => {
  try {
    const { promotionId } = req.params;
    const ownerId = req.user._id;
    const updatedData = req.body;
    
    const promotion = await promotionService.updatePromotion(promotionId, updatedData, ownerId);
    
    res.json({
      message: 'Promotion updated successfully',
      promotion
    });
  } catch (error) {
    console.error('Error updating promotion:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete a promotion
exports.deletePromotion = async (req, res) => {
  try {
    const { promotionId } = req.params;
    const ownerId = req.user._id;
    
    await promotionService.deletePromotion(promotionId, ownerId);
    
    res.json({
      message: 'Promotion deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    res.status(400).json({ message: error.message });
  }
};

// Validate a promotion (coupon code)
exports.validatePromotion = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { couponCode, serviceIds, totalAmount } = req.body;
    const userId = req.user._id;
    
    const validationResult = await promotionService.validatePromotion({
      shopId,
      couponCode,
      serviceIds,
      totalAmount,
      userId
    });
    
    res.json(validationResult);
  } catch (error) {
    console.error('Error validating promotion:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get active promotions for a shop (public)
exports.getActivePromotions = async (req, res) => {
  try {
    const { shopId } = req.params;
    
    const promotions = await promotionService.getActivePromotions(shopId);
    
    res.json({
      promotions
    });
  } catch (error) {
    console.error('Error fetching active promotions:', error);
    res.status(400).json({ message: error.message });
  }
};