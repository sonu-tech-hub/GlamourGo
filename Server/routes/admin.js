const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const adminAnalyticsController = require('../controllers/adminAnalyticsController');

const { auth, isAdmin } = require('../middlewares/authMiddleware');

// Dashboard
router.get('/dashboard', auth, isAdmin, adminController.getDashboardStats);

// Shops
router.get('/shops/pending', auth, isAdmin, adminController.getPendingShops);
router.put('/shops/:shopId/approve', auth, isAdmin, adminController.approveShop);
router.put('/shops/:shopId/reject', auth, isAdmin, adminController.rejectShop);

// Users
router.get('/users', auth, isAdmin, adminController.getAllUsers);
router.put('/users/:userId/status', auth, isAdmin, adminController.updateUserStatus);
router.get('/users/recent', auth, isAdmin, adminAnalyticsController.getRecentUsers); // ✅ New recent users route

// Reports
router.get('/reports', auth, isAdmin, adminController.getReports);
router.put('/reports/:reportId/status', auth, isAdmin, adminController.updateReportStatus);

// Analytics / Stats
router.get('/stats', auth, isAdmin, adminAnalyticsController.getSystemStats); // ✅ New system stats route
router.get('/analytics/revenue', auth, isAdmin, adminAnalyticsController.getRevenueAnalytics); // ✅ Revenue chart route
router.get('/popular-services', auth, isAdmin, adminAnalyticsController.getPopularServicesByRating);
router.get('/service-categories', auth, isAdmin, adminAnalyticsController.getServiceCategoriesCount);

module.exports = router;
