// server/services/promotionService.js
const Promotion = require('../models/Promotion');
const Shop = require('../models/Shop');
const Transaction = require('../models/Transaction');

// Create a new promotion
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

// Get all promotions for a shop
exports.getShopPromotions = async (shopId, status) => {
  let query = { shop: shopId };
  
  // Filter by status
  if (status === 'active') {
    const today = new Date();
    query = {
      ...query,
      isActive: true,
      startDate: { $lte: today },
      endDate: { $gte: today }
    };
  } else if (status === 'upcoming') {
    const today = new Date();
    query = {
      ...query,
      isActive: true,
      startDate: { $gt: today }
    };
  } else if (status === 'expired') {
    const today = new Date();
    query = {
      ...query,
      $or: [
        { isActive: false },
        { endDate: { $lt: today } }
      ]
    };
  }
  
  const promotions = await Promotion.find(query)
    .sort({ startDate: 1 });
  
  return promotions;
};

// Update a promotion
exports.updatePromotion = async (promotionId, updatedData, ownerId) => {
  const promotion = await Promotion.findById(promotionId);
  
  if (!promotion) {
    throw new Error('Promotion not found');
  }
  
  // Verify shop ownership
  const shop = await Shop.findById(promotion.shop);
  
  if (!shop || shop.owner.toString() !== ownerId.toString()) {
    throw new Error('Unauthorized: You are not the owner of this shop');
  }
  
  // Update promotion fields
  Object.keys(updatedData).forEach(field => {
    promotion[field] = updatedData[field];
  });
  
  await promotion.save();
  
  return promotion;
};

// Delete a promotion
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
  
  return { success: true };
};

// Validate a promotion (coupon code)
exports.validatePromotion = async ({ shopId, couponCode, serviceIds, totalAmount, userId }) => {
  // Find the promotion by coupon code and shop
  const promotion = await Promotion.findOne({
    shop: shopId,
    couponCode,
    isActive: true
  });
  
  if (!promotion) {
    throw new Error('Invalid coupon code');
  }
  
  // Check if promotion is currently valid
  const today = new Date();
  if (today < promotion.startDate || today > promotion.endDate) {
    throw new Error('Coupon code is not valid at this time');
  }
  
  // Check usage limit
  if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
    throw new Error('This promotion has reached its usage limit');
  }
  
  // Check minimum spend
  if (totalAmount < promotion.minSpend) {
    throw new Error(`Minimum spend of ₹${promotion.minSpend} required for this coupon`);
  }
  
  // Check if services are applicable
  if (promotion.applicableServices.length > 0) {
    // Check if any of the selected services are applicable
    const hasApplicableService = serviceIds.some(id => 
      promotion.applicableServices.map(s => s.toString()).includes(id)
    );
    
    if (!hasApplicableService) {
      throw new Error('This coupon is not applicable for the selected services');
    }
  }
  
  // Check user usage
  if (userId && promotion.usagePerCustomer) {
    const transactions = await Transaction.countDocuments({
      user: userId,
      'promotion.id': promotion._id
    });
    
    if (transactions >= promotion.usagePerCustomer) {
      throw new Error('You have already used this promotion the maximum number of times');
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
  
  return {
    valid: true,
    promotion: {
      id: promotion._id,
      title: promotion.title,
      description: promotion.description,
      type: promotion.type,
      value: promotion.value
    },
    discount,
    discountedTotal: totalAmount - discount
  };
};

// Get active promotions for a shop (public)
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