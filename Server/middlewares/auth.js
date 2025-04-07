// server/middlewares/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Shop = require('../models/Shop');

// Authentication middleware
exports.auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Shop owner verification middleware
exports.shopOwner = async (req, res, next) => {
  try {
    const shopId = req.params.shopId || req.body.shopId;
    
    if (!shopId) {
      return res.status(400).json({ message: 'Shop ID is required' });
    }
    
    const shop = await Shop.findById(shopId);
    
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    
    if (shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: You are not the owner of this shop' });
    }
    
    req.shop = shop;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin verification middleware
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.userType === 'admin') {
    return next();
  }
  
  res.status(403).json({ message: 'Unauthorized: Admin access required' });
};