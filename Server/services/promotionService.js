// server/services/promotionService.js
const Promotion = require('../models/Promotion');
const Shop = require('../models/Shop');
const Transaction = require('../models/Transaction');

/**
 * Creates a new promotion for a given shop, ensuring the requesting user is the shop owner.
 * @param {object} promotionData - The data for the new promotion.
 * @param {string} shopId - The ID of the shop to associate the promotion with.
 * @param {string} ownerId - The ID of the user attempting to create the promotion.
 * @returns {Promise<object>} The newly created promotion object.
 * @throws {Error} If the shop is not found or the user is not authorized.
 */
exports.createPromotion = async (promotionData, shopId, ownerId) => {
  // Verify shop ownership
  const shop = await Shop.findById(shopId);

  if (!shop) {
    throw new Error('Shop not found');
  }

  if (shop.owner.toString() !== ownerId.toString()) {
    throw new Error('Unauthorized: You are not the owner of this shop');
  }

  // Create new promotion
  const promotion = new Promotion({
    ...promotionData,
    shop: shopId
  });

  await promotion.save();

  return promotion;
};

/**
 * Retrieves promotions for a specific shop, optionally filtered by status.
 * @param {string} shopId - The ID of the shop.
 * @param {string} [status] - Optional. The status to filter by ('active', 'upcoming', 'expired').
 * @returns {Promise<Array<object>>} An array of promotion objects.
 */
exports.getShopPromotions = async (shopId, status) => {
  let query = { shop: shopId };
  const today = new Date(); // Instantiate once for efficiency

  // Filter by status
  if (status === 'active') {
    query = {
      ...query,
      isActive: true,
      startDate: { $lte: today },
      endDate: { $gte: today }
    };
  } else if (status === 'upcoming') {
    query = {
      ...query,
      isActive: true, // Upcoming promotions should generally be active
      startDate: { $gt: today }
    };
  } else if (status === 'expired') {
    query = {
      ...query,
      $or: [
        { isActive: false }, // Explicitly inactive
        { endDate: { $lt: today } } // End date has passed
      ]
    };
  }

  const promotions = await Promotion.find(query)
    .sort({ startDate: 1 }); // Sort by start date for better readability

  return promotions;
};

/**
 * Updates an existing promotion, ensuring the requesting user is the shop owner.
 * @param {string} promotionId - The ID of the promotion to update.
 * @param {object} updatedData - The data to update the promotion with.
 * @param {string} ownerId - The ID of the user attempting to update the promotion.
 * @returns {Promise<object>} The updated promotion object.
 * @throws {Error} If the promotion or shop is not found, or the user is not authorized.
 */
exports.updatePromotion = async (promotionId,ownerId, updatedData ) => {
  let promotion = await Promotion.findById(promotionId);

  if (!promotion) {
    throw new Error('Promotion not found');
  }

  // Verify shop ownership
  const shop = await Shop.findById(promotion.shop);

  if (!shop || shop.owner.toString() !== ownerId.toString()) {
    throw new Error('Unauthorized: You are not the owner of this shop');
  }

  // Use findByIdAndUpdate for a more atomic and efficient update
  promotion = await Promotion.findByIdAndUpdate(
    promotionId,
    { $set: updatedData }, // Use $set to update only the provided fields
    { new: true, runValidators: true } // Return the updated document and run Mongoose validators
  );

  return promotion;
};

/**
 * Deletes a promotion, ensuring the requesting user is the shop owner.
 * @param {string} promotionId - The ID of the promotion to delete.
 * @param {string} ownerId - The ID of the user attempting to delete the promotion.
 * @returns {Promise<object>} An object indicating success.
 * @throws {Error} If the promotion or shop is not found, or the user is not authorized.
 */
exports.deletePromotion = async (promotionId, ownerId) => {
  const promotion = await Promotion.findById(promotionId);

  if (!promotion) {
    throw new Error('Promotion not found');
  }

  // Verify shop ownership
  const shop = await Shop.findById(promotion.shop);

  if (!shop || shop.owner.toString() !== ownerId.toString()) {
    throw new Error('Unauthorized: You are not the owner of this shop');
  }

  await Promotion.findByIdAndDelete(promotionId);

  return { success: true, message: 'Promotion deleted successfully' }; // Added a success message
};

/**
 * Validates a promotion (coupon code) against various criteria.
 * @param {object} params - The parameters for validation.
 * @param {string} params.shopId - The ID of the shop where the promotion is being applied.
 * @param {string} params.couponCode - The coupon code to validate.
 * @param {Array<string>} params.serviceIds - An array of service IDs being purchased.
 * @param {number} params.totalAmount - The total amount of the transaction before discount.
 * @param {string} [params.userId] - Optional. The ID of the user attempting to use the promotion.
 * @returns {Promise<object>} An object containing validation status, promotion details, and calculated discount.
 * @throws {Error} If the promotion is invalid or conditions are not met.
 */
exports.validatePromotion = async ({ shopId, couponCode, serviceIds, totalAmount, userId }) => {
  const today = new Date(); // Instantiate once for efficiency

  // Find the promotion by coupon code and shop
  const promotion = await Promotion.findOne({
    shop: shopId,
    couponCode,
    isActive: true
  });

  if (!promotion) {
    throw new Error('Invalid coupon code or promotion is not active'); // More specific message
  }

  // Check if promotion is currently valid based on dates
  if (today < promotion.startDate || today > promotion.endDate) {
    throw new Error('Coupon code is not valid at this time (outside valid date range)');
  }

  // Check usage limit
  if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
    throw new Error('This promotion has reached its overall usage limit');
  }

  // Check minimum spend
  if (totalAmount < promotion.minSpend) {
    throw new Error(`Minimum spend of ₹${promotion.minSpend.toFixed(2)} required for this coupon`); // Format amount for currency
  }

  // Check if services are applicable
  if (promotion.applicableServices && promotion.applicableServices.length > 0) {
    // Ensure serviceIds are converted to strings for consistent comparison
    const serviceIdsAsString = serviceIds.map(id => id.toString());
    const promotionApplicableServicesAsString = promotion.applicableServices.map(s => s.toString());

    const hasApplicableService = serviceIdsAsString.some(id =>
      promotionApplicableServicesAsString.includes(id)
    );

    if (!hasApplicableService) {
      throw new Error('This coupon is not applicable for any of the selected services');
    }
  }

  // Check user usage
  if (userId && promotion.usagePerCustomer) {
    const transactions = await Transaction.countDocuments({
      user: userId,
      'promotion.id': promotion._id // Ensure this matches how promotion is stored in Transaction
    });

    if (transactions >= promotion.usagePerCustomer) {
      throw new Error('You have already used this promotion the maximum number of times per customer');
    }
  }

  // Calculate discount
  let discount = 0;

  if (promotion.type === 'percentage') {
    discount = (totalAmount * promotion.value) / 100;

    // Apply max discount if applicable
    if (promotion.maxDiscount && discount > promotion.maxDiscount) {
      discount = promotion.maxDiscount;
    }
  } else if (promotion.type === 'fixed') {
    discount = promotion.value;

    // Ensure discount doesn't exceed total amount
    if (discount > totalAmount) {
      discount = totalAmount;
    }
  }

  // Ensure discount is not negative
  discount = Math.max(0, discount);

  return {
    valid: true,
    promotion: {
      id: promotion._id,
      title: promotion.title,
      description: promotion.description,
      type: promotion.type,
      value: promotion.value,
      couponCode: promotion.couponCode, // Include coupon code for frontend display
      minSpend: promotion.minSpend,
      maxDiscount: promotion.maxDiscount
    },
    discount: parseFloat(discount.toFixed(2)), // Return discount formatted
    discountedTotal: parseFloat((totalAmount - discount).toFixed(2)) // Return discounted total formatted
  };
};

/**
 * Retrieves all active promotions for a given shop (publicly accessible).
 * @param {string} shopId - The ID of the shop.
 * @returns {Promise<Array<object>>} An array of active promotion objects with selected fields.
 */
exports.getActivePromotions = async (shopId) => {
  const today = new Date();

  const promotions = await Promotion.find({
    shop: shopId,
    isActive: true,
    startDate: { $lte: today },
    endDate: { $gte: today }
  }).select('title description type value couponCode minSpend maxDiscount applicableServices');

  return promotions;
};