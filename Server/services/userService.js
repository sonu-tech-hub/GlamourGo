// server/services/userService.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register new user
exports.registerUser = async (userData) => {
  const { name, email, phone, password, userType } = userData;
  
  // Check if email already exists
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    throw new Error('Email already in use');
  }
  
  // Check if phone already exists
  const phoneExists = await User.findOne({ phone });
  if (phoneExists) {
    throw new Error('Phone number already in use');
  }
  
  // Create new user
  const user = new User({
    name,
    email,
    phone,
    password, // Will be hashed in the User model pre-save hook
    userType: userType || 'customer'
  });
  
  await user.save();
  
  // Generate JWT token
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
  
  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      profilePicture: user.profilePicture,
      isVerified: user.isVerified
    },
    token
  };
};

// Login user
exports.loginUser = async (email, password) => {
  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  // Check if password is correct
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }
  
  // Generate JWT token
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
  
  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      profilePicture: user.profilePicture,
      isVerified: user.isVerified,
      shopId: user.shopId
    },
    token
  };
};

// Get user profile
exports.getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
};

// Update user profile
exports.updateUserProfile = async (userId, updateData) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Fields that cannot be updated directly
  const restrictedFields = ['password', 'userType', 'isVerified', 'wallet'];
  
  // Remove restricted fields from update data
  restrictedFields.forEach(field => {
    if (updateData[field]) {
      delete updateData[field];
    }
  });
  
  // Update user
  Object.assign(user, updateData);
  await user.save();
  
  return user;
};

// Change password
exports.changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new Error('Current password is incorrect');
  }
  
  // Update password
  user.password = newPassword; // Will be hashed in the User model pre-save hook
  await user.save();
  
  return { success: true };
};

// Add funds to wallet
exports.addFundsToWallet = async (userId, amount, transactionDetails) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Update wallet balance
  user.wallet.balance += amount;
  
  // Add transaction to wallet history
  user.wallet.transactions.push({
    amount,
    description: 'Wallet recharge',
    type: 'credit',
    transactionId: transactionDetails.transactionId,
    timestamp: new Date()
  });
  
  await user.save();
  
  return {
    balance: user.wallet.balance,
    transaction: user.wallet.transactions[user.wallet.transactions.length - 1]
  };
};

// Verify email or phone with OTP
exports.verifyOTP = async (contact, otp) => {
  // Find user by email or phone first
  const user = await User.findOne({
    $or: [{ email: contact }, { phone: contact }]
  });

  if (!user) {
    throw new Error('User not found');
  }

  // For testing purposes, OTP is hardcoded
  if (otp !== '123456') {
    throw new Error('Invalid OTP');
  }

  // Mark user as verified
  user.isVerified = true;
  await user.save();

  return { success: true };
};


// Get user's notifications
exports.getUserNotifications = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user.notifications;
};

// Mark notification as read
exports.markNotificationAsRead = async (userId, notificationId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const notification = user.notifications.id(notificationId);
  
  if (!notification) {
    throw new Error('Notification not found');
  }
  
  notification.read = true;
  await user.save();
  
  return notification;
};
exports.markAllNotificationsAsRead = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  user.notifications.forEach(notification => {
    notification.read = true;
  });

  await user.save();
  return user.notifications;
};
exports.deleteNotification = async (userId, notificationId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  const notification = user.notifications.id(notificationId);

  if (!notification) {
    throw new Error('Notification not found');
  }

  notification.remove(); // Mongoose subdoc method
  await user.save();
};
exports.clearAllNotifications = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  user.notifications = [];
  await user.save();
};