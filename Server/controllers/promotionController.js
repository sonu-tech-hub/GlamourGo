// server/controllers/promotionController.js
const promotionService = require('../services/promotionService');

/**
 * Handles the creation of a new promotion.
 * Expects shopId in params, ownerId from req.user, and promotionData in req.body.
 */
exports.createPromotion = async (req, res) => {
  try {
    const shopId = req.params.shopId;
    const ownerId = req.user._id; // Assumes user ID is available from authentication middleware
    const promotionData = req.body;

    // Basic input validation: check for required fields if necessary at controller level
    if (!shopId || !ownerId || !promotionData || Object.keys(promotionData).length === 0) {
      return res.status(400).json({ message: 'Missing required promotion data or shop ID.' });
    }

    const promotion = await promotionService.createPromotion(promotionData, shopId, ownerId);

    res.status(201).json({
      message: 'Promotion created successfully',
      promotion
    });
  } catch (error) {
    console.error('Error creating promotion:', error);
    // More specific error handling based on message from service layer
    if (error.message.includes('Shop not found')) {
      res.status(404).json({ message: error.message });
    } else if (error.message.includes('Unauthorized')) {
      res.status(403).json({ message: error.message }); // 403 Forbidden is often more appropriate than 401 for authorization
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};

/**
 * Handles fetching all promotions for a given shop.
 * Expects shopId in params and an optional status in query.
 */
exports.getShopPromotions = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { status } = req.query; // 'active', 'upcoming', 'expired', or undefined

    // Basic input validation for shopId
    if (!shopId) {
      return res.status(400).json({ message: 'Shop ID is required.' });
    }

    const promotions = await promotionService.getShopPromotions(shopId, status);

    res.json({
      promotions
    });
  } catch (error) {
    console.error('Error fetching shop promotions:', error);
    // For read operations, a 404 might be appropriate if the shop itself isn't found
    if (error.message.includes('Shop not found')) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Failed to retrieve promotions. Please try again later.' }); // Generic server error
    }
  }
};

/**
 * Handles updating an existing promotion.
 * Expects promotionId in params, ownerId from req.user, and updatedData in req.body.
 */
exports.updatePromotion = async (req, res) => {
  try {
    const { promotionId } = req.params;
    const ownerId = req.user._id;

    // Ensure updatedData is not empty
    const updatedData = req.body;
    if (!promotionId || !ownerId || !updatedData || Object.keys(updatedData).length === 0) {
      return res.status(400).json({ message: 'Missing promotion ID, owner ID, or update data.' });
    }

    const promotion = await promotionService.updatePromotion(promotionId, updatedData, ownerId);

    res.json({
      message: 'Promotion updated successfully',
      promotion
    });
  } catch (error) {
    console.error('Error updating promotion:', error);
    if (error.message.includes('Promotion not found') || error.message.includes('Shop not found')) {
      res.status(404).json({ message: error.message });
    } else if (error.message.includes('Unauthorized')) {
      res.status(403).json({ message: error.message });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};

/**
 * Handles deleting a promotion.
 * Expects promotionId in params and ownerId from req.user.
 */
exports.deletePromotion = async (req, res) => {
  try {
    const { promotionId } = req.params;
    const ownerId = req.user._id;

    if (!promotionId || !ownerId) {
      return res.status(400).json({ message: 'Missing promotion ID or owner ID.' });
    }

    const result = await promotionService.deletePromotion(promotionId, ownerId); // Service now returns an object with message

    res.json({
      message: result.message // Use message from service response
    });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    if (error.message.includes('Promotion not found') || error.message.includes('Shop not found')) {
      res.status(404).json({ message: error.message });
    } else if (error.message.includes('Unauthorized')) {
      res.status(403).json({ message: error.message });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};

/**
 * Handles validating a promotion (coupon code).
 * Expects shopId in params and couponCode, serviceIds, totalAmount in req.body.
 * userId is optional from req.user.
 */
exports.validatePromotion = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { couponCode, serviceIds, totalAmount } = req.body;
    const userId = req.user ? req.user._id : undefined; // userId is optional

    // Validate required inputs for promotion validation
    if (!shopId || !couponCode || !serviceIds || totalAmount === undefined || totalAmount === null) {
      return res.status(400).json({ message: 'Missing required validation parameters: shopId, couponCode, serviceIds, or totalAmount.' });
    }

    if (!Array.isArray(serviceIds)) {
      return res.status(400).json({ message: 'Service IDs must be an array.' });
    }
    if (typeof totalAmount !== 'number' || totalAmount < 0) {
      return res.status(400).json({ message: 'Total amount must be a non-negative number.' });
    }


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
    // Specific error messages from the service are handled here
    if (error.message.includes('Invalid coupon code') ||
        error.message.includes('not valid at this time') ||
        error.message.includes('usage limit') ||
        error.message.includes('Minimum spend') ||
        error.message.includes('not applicable') ||
        error.message.includes('already used')) {
      res.status(400).json({ message: error.message }); // Bad Request for specific validation failures
    } else if (error.message.includes('Shop not found')) {
      res.status(404).json({ message: error.message });
    }
    else {
      res.status(500).json({ message: 'Failed to validate promotion. Please try again later.' });
    }
  }
};

/**
 * Handles fetching active promotions for a shop (public access).
 * Expects shopId in params.
 */
exports.getActivePromotions = async (req, res) => {
  try {
    const { shopId } = req.params;

    if (!shopId) {
      return res.status(400).json({ message: 'Shop ID is required.' });
    }

    const promotions = await promotionService.getActivePromotions(shopId);

    res.json({
      promotions
    });
  } catch (error) {
    console.error('Error fetching active promotions:', error);
    if (error.message.includes('Shop not found')) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Failed to retrieve active promotions. Please try again later.' });
    }
  }
};