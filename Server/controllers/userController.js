const mongoose = require('mongoose');
const userService = require('../services/userService');
const adminService = require('../services/adminService');
const asyncHandler = require('express-async-handler');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = asyncHandler(async (req, res) => {
    const user = await userService.getUserProfile(req.user.id);
    res.json(user);
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = asyncHandler(async (req, res) => {
    const updatedUser = await userService.updateUserProfile(req.user.id, req.body);
    res.json(updatedUser);
});

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    await userService.changePassword(req.user.id, currentPassword, newPassword);
    res.json({ success: true });
});

// @desc    Add funds to wallet
// @route   POST /api/users/wallet/add-funds
// @access  Private
exports.addFunds = asyncHandler(async (req, res) => {
    const { amount, transactionDetails } = req.body;
    const walletInfo = await userService.addFundsToWallet(req.user.id, amount, transactionDetails);
    res.json(walletInfo);
});

// @desc    Verify OTP
// @route   POST /api/users/verify-otp
// @access  Public
exports.verifyOTP = asyncHandler(async (req, res) => {
    const { contact, otp } = req.body;
    const result = await userService.verifyOTP(contact, otp);
    res.json(result);
});

// @desc    Get user's notifications
// @route   GET /api/users/notifications
// @access  Private
exports.getUserNotifications = asyncHandler(async (req, res) => {
    const notifications = await userService.getUserNotifications(req.user.id);
    res.json(notifications);
});

// @desc    Mark notification as read
// @route   PUT /api/users/notifications/:notificationId/read
// @access  Private
exports.markNotificationAsRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    const updatedNotification = await userService.markNotificationAsRead(req.user.id, notificationId);
    res.json(updatedNotification);
});
// @desc    Mark all notifications as read
// @route   PUT /api/users/notifications/mark-all-read
// @access  Private
exports.markAllNotificationsAsRead = asyncHandler(async (req, res) => {
    const updatedNotifications = await userService.markAllNotificationsAsRead(req.user.id);
    res.json(updatedNotifications);
  });
  
  // @desc    Delete a notification
  // @route   DELETE /api/users/notifications/:notificationId
  // @access  Private
  exports.deleteNotification = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    await userService.deleteNotification(req.user.id, notificationId);
    res.status(204).send(); // No content
  });
  
  // @desc    Delete all notifications
  // @route   DELETE /api/users/notifications/clear-all
  // @access  Private
  exports.clearAllNotifications = asyncHandler(async (req, res) => {
    await userService.clearAllNotifications(req.user.id);
    res.status(204).send(); // No content
  });
  

// --- Admin Controller Functions ---

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private (admin)
exports.getAllUsers = asyncHandler(async (req, res) => {
    const usersData = await adminService.getAllUsers(req.query);
    res.status(200).json(usersData);
});



// @desc    Get user by ID (admin)
// @route   GET /api/admin/users/:userId
// @access  Private (admin)
exports.getUserById = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const user = await adminService.getUserByIdAdmin(userId);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
        success: true,
        data: user,
    });
});


// @desc    Update user by ID (admin)
// @route   PUT /api/admin/users/:userId
// @access  Private (admin)
exports.updateUserById = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const updatedUser = await adminService.updateUserByIdAdmin(userId, req.body);
    res.status(200).json({
        success: true,
        data: updatedUser
    });
});

// @desc    Delete user by ID (admin)
// @route   DELETE /api/admin/users/:userId
// @access  Private (admin)
exports.deleteUserById = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const result = await adminService.deleteUserByIdAdmin(userId);
    res.status(200).json({
        success: true,
        message: 'User deleted successfully',
        data: result
    });
});