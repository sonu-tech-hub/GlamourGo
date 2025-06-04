// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');
const { auth } = require('../middlewares/authMiddleware.js');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/me', auth, authController.getCurrentUser);
router.put('/update-profile', auth, authController.updateProfile);

module.exports = router;
