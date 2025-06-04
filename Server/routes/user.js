const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Assuming this exists
const { auth ,isAdmin} = require('../middlewares/authMiddleware'); // Assuming this exists

router.get('/profile', auth, userController.getUserProfile); // this is get the user profile
router.put('/profile',auth , userController.updateUserProfile); // this is used to update the user profile
router.put('/change-password', auth, userController.changePassword); // this is used to change the user password
router.post('/wallet/add-funds', auth, userController.addFunds); // this is used to add funds to the user's wallet
router.post('/verify-otp', userController.verifyOTP); // this is used to verify the OTP
router.get('/notifications', auth, userController.getUserNotifications); // <--- POTENTIAL ISSUE
router.put('/notifications/:notificationId/read', auth, userController.markNotificationAsRead); // this is used to mark a notification as read
router.put('/notifications/mark-all-read', auth, userController.markAllNotificationsAsRead);  // this is used to mark all notifications as read
router.delete('/notifications/:notificationId', auth, userController.deleteNotification); // this is used to delete a specific notification
router.delete('/notifications/clear-all', auth, userController.clearAllNotifications); // this is used to clear all notifications

// Admin routes
router.get('/admin/users', isAdmin, /* admin middleware */ userController.getAllUsers); // this is used to get all users
router.get('/admin/users/:userId',auth,isAdmin, /* admin middleware */ userController.getUserById); // this routes used to get a specific user by ID
router.put('/admin/users/:userId', isAdmin, /* admin middleware */ userController.updateUserById); // this is used to update a specific user by ID
router.delete('/admin/users/:userId', isAdmin, /* admin middleware */ userController.deleteUserById); // this is used to delete a specific user by ID

module.exports = router;