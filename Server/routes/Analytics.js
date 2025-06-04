const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const {auth,shopOwner } = require('../middlewares/authMiddleware.js');

// All routes below require authentication (i.e., shop owner must be logged in)

// GET /api/analytics/shop/:shopId/dashboard
router.get('/shop/:shopId/dashboard',auth, shopOwner, analyticsController.getShopDashboardStats);

// GET /api/analytics/shop/:shopId/revenue?period=week|month|year
router.get('/shop/:shopId/revenue',auth, shopOwner, analyticsController.getRevenueAnalytics);

// GET /api/analytics/shop/:shopId/customers
router.get('/shop/:shopId/customers',auth, shopOwner, analyticsController.getCustomerAnalytics);

module.exports = router;
