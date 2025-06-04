// server/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { auth } = require('../middlewares/authMiddleware');

// Routes requiring authentication
router.post('/create-order', auth, paymentController.createPaymentOrder);
router.post('/verify-payment', paymentController.verifyPayment); // No auth needed for callback
router.post('/wallet/add', auth, paymentController.addMoneyToWallet);
router.post('/wallet/verify-recharge', auth, paymentController.verifyWalletRecharge);
router.post('/wallet/pay', auth, paymentController.payUsingWallet);
router.get('/history', auth, paymentController.getPaymentHistory);
router.get('/wallet/transactions', auth, paymentController.getWalletTransactions);

module.exports = router;