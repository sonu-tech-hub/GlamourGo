// routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, isAdmin } = require('../middlewares/auth');

router.get('/dashboard', auth, isAdmin, adminController.getDashboardStats);
router.get('/shops/pending', auth, isAdmin, adminController.getPendingShops);
router.put('/shops/:shopId/approve', auth, isAdmin, adminController.approveShop);
router.put('/shops/:shopId/reject', auth, isAdmin, adminController.rejectShop);
router.get('/users', auth, isAdmin, adminController.getAllUsers);
router.put('/users/:userId/status', auth, isAdmin, adminController.updateUserStatus);
router.get('/reports', auth, isAdmin, adminController.getReports);
router.put('/reports/:reportId/status', auth, isAdmin, adminController.updateReportStatus);

module.exports = router;
