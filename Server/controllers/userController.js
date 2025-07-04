const mongoose = require('mongoose');
const userService = require('../services/userService');
const adminService = require('../services/adminService');
const asyncHandler = require('express-async-handler');
const User = require('../models/User'); // Adjust path as per your project structure
const cloudinary = require('../config/cloudinaryConfig'); // Import your Cloudinary configuration   


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

// --- NEW CONTROLLER FOR PROFILE IMAGE UPLOAD ---
// @desc    Upload user profile image to Cloudinary
// @route   POST /api/users/profile/upload-image (We will use this route)
// @access  Private
exports.uploadProfileImage = asyncHandler(async (req, res) => {
    // Check if a file was actually uploaded by Multer
    if (!req.file) {
        res.status(400).json({ message: 'No profile image file provided.' });
        return;
    }

    const userId = req.user.id; // Assuming authentication middleware populates req.user.id
    const user = await User.findById(userId);

    if (!user) {
        res.status(404).json({ message: 'User not found.' });
        return;
    }

    try {
        // Upload image to Cloudinary
        // req.file.buffer contains the image data from memoryStorage
        // 'data:image/jpeg;base64,...' is a data URI, which Cloudinary can directly process.
        const result = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, {
            folder: 'profile', // This is the Cloudinary folder you created for profiles
            // You can also add a unique public_id if you want to manage images by user ID
            // public_id: `user-profile-${userId}`,
            // overwrite: true // If you use public_id, set this to true to update existing image
        });

        // The secure_url is the HTTPS URL of the uploaded image on Cloudinary
        const newProfilePictureUrl = result.secure_url;

        // Update the user's profilePicture field in MongoDB
        user.profilePicture = newProfilePictureUrl;
        await user.save(); // Save the updated user document

        // Send back the new profile picture URL to the frontend
        res.status(200).json({
            message: 'Profile picture uploaded and updated successfully',
            profilePicture: newProfilePictureUrl // Send this back for frontend update
        });

    } catch (error) {
        console.error('Cloudinary upload error:', error);
        res.status(500).json({ message: 'Failed to upload profile picture. Please try again.', error: error.message });
    }
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