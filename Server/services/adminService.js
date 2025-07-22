// server/services/adminService.js
const Shop = require('../models/Shop');
const User = require('../models/User');
const Report = require('../models/Report');
const Review = require('../models/Review');
const Appointment = require('../models/Appointment');
const Transaction = require('../models/Transaction');
const { sendShopApprovalNotification } = require('./notificationService');

// Get dashboard stats
exports.getDashboardStats = async () => {
  // Get total counts
  const totalShops = await Shop.countDocuments();
  const totalUsers = await User.countDocuments();
  const totalAppointments = await Appointment.countDocuments();
  
  // Get shop approvals pending
  const pendingApprovals = await Shop.countDocuments({ isVerified: false });
  
  // Get active shops
  const activeShops = await Shop.countDocuments({ isVerified: true, isActive: true });
  
  // Get total revenue (completed appointments)
  const completedAppointments = await Appointment.find({ 
    status: 'completed',
    'payment.status': 'completed'
  });
  
  const totalRevenue = completedAppointments.reduce(
    (sum, appointment) => sum + appointment.service.price, 
    0
  );
  
  // Get recent reports count
  const recentReports = await Report.countDocuments({ status: 'pending' });
  
  return {
    totalShops,
    totalUsers,
    totalAppointments,
    totalRevenue,
    pendingApprovals,
    activeShops,
    recentReports
  };
};

// Get pending shop approvals
exports.getPendingShops = async (options) => {
  const { page, limit } = options;
  
  // Get pending shops with pagination
  const pendingShops = await Shop.find({ isVerified: false })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('owner', 'name email phone');
  
  // Get total count
  const totalPendingShops = await Shop.countDocuments({ isVerified: false });
  
  return {
    pendingShops,
    pagination: {
      totalPendingShops,
      totalPages: Math.ceil(totalPendingShops / limit),
      currentPage: page,
      limit
    }
  };
};

// Approve a shop
exports.approveShop = async (shopId, message) => {
  const shop = await Shop.findById(shopId);
  
  if (!shop) {
    throw new Error('Shop not found');
  }
  
  // Update shop status
  shop.isVerified = true;
  shop.isActive = true;
  
  // Add approval details
  shop.verificationDetails = {
    status: 'approved',
    message: message || 'Your shop has been approved by the admin.',
    timestamp: new Date()
  };
  
  await shop.save();
  
  // Notify shop owner
  await sendShopApprovalNotification(shopId, true);
  
  return shop;
};

// Reject a shop
exports.rejectShop = async (shopId, reason) => {
  const shop = await Shop.findById(shopId);
  
  if (!shop) {
    throw new Error('Shop not found');
  }
  
  // Update shop status
  shop.isVerified = false;
  shop.isActive = false;
  
  // Add rejection details
  shop.verificationDetails = {
    status: 'rejected',
    message: reason || 'Your shop registration has been rejected.',
    timestamp: new Date()
  };
  
  await shop.save();
  
  // Notify shop owner
  await sendShopApprovalNotification(shopId, false);
  
  return shop;
};

// Get all users
exports.getAllUsers = async (options) => {
  const { page, limit, userType, search } = options;
  
  let query = {};
  
  // Filter by user type
  if (userType) {
    query.userType = userType;
  }
  
  // Search by name, email, or phone
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Get users with pagination
  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  
  // Get total count
  const totalUsers = await User.countDocuments(query);
  
  return {
    users,
    pagination: {
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      limit
    }
  };
};

// Update user status
exports.updateUserStatus = async (userId, status, reason) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Update user status
  user.isActive = status === 'active';
  
  // Add status change reason if provided
  if (reason) {
    user.statusHistory = user.statusHistory || [];
    user.statusHistory.push({
      status: status === 'active' ? 'activated' : 'deactivated',
      reason,
      timestamp: new Date()
    });
  }
  
  await user.save();
  
  // If user is a shop owner, update shop status as well
  if (user.userType === 'vendor' && user.shopId) {
    const shop = await Shop.findById(user.shopId);
    if (shop) {
      shop.isActive = status === 'active';
      await shop.save();
    }
  }
  
  // Notify user
  user.notifications.push({
    message: `Your account has been ${status === 'active' ? 'activated' : 'deactivated'}${reason ? ': ' + reason : ''}`,
    read: false,
    createdAt: new Date()
  });
  
  await user.save();
  
  return user;
};

// Get reports
exports.getReports = async (options) => {
  const { page, limit, status, type } = options;
  
  let query = {};
  
  // Filter by status
  if (status) {
    query.status = status;
  }
  
  // Filter by report type
  if (type) {
    query.reportType = type;
  }
  
  // Get reports with pagination
  const reports = await Report.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('reportedBy', 'name email')
    .populate('review')
    .populate('shop');
  
  // Get total count
  const totalReports = await Report.countDocuments(query);
  
  return {
    reports,
    pagination: {
      totalReports,
      totalPages: Math.ceil(totalReports / limit),
      currentPage: page,
      limit
    }
  };
};

// Update report status
exports.updateReportStatus = async (reportId, status, action, message) => {
  const report = await Report.findById(reportId);
  
  if (!report) {
    throw new Error('Report not found');
  }
  
  // Update report status
  report.status = status;
  report.adminResponse = {
    message: message || '',
    action: action || 'none',
    timestamp: new Date()
  };
  
  await report.save();
  
  // If report is about a review and action is to remove it
  if (report.reportType === 'review' && action === 'remove' && report.review) {
    const review = await Review.findById(report.review);
    if (review) {
      // Update review status to rejected
      review.status = 'rejected';
      review.rejectionReason = message || 'Removed due to report';
      await review.save();
      
      // Update shop's average rating
      const shop = await Shop.findById(review.shop);
      if (shop) {
        // Remove this review from shop's reviews array
        shop.reviews = shop.reviews.filter(
          reviewId => reviewId.toString() !== review._id.toString()
        );
        
        // Recalculate average rating
        const remainingReviews = await Review.find({ 
          shop: shop._id,
          status: 'approved'
        });
        
        if (remainingReviews.length > 0) {
          const totalRating = remainingReviews.reduce((sum, review) => sum + review.rating, 0);
          shop.ratings.average = totalRating / remainingReviews.length;
        } else {
          shop.ratings.average = 0;
        }
        
        shop.ratings.count = remainingReviews.length;
        
        await shop.save();
      }
    }
  }
  
  // Notify the user who reported
  const user = await User.findById(report.reportedBy);
  if (user) {
    user.notifications.push({
      message: `Your report has been ${status}${message ? ': ' + message : ''}`,
      read: false,
      createdAt: new Date()
    });
    
    await user.save();
  }
  
  return report;
};

// Get system analytics
exports.getSystemAnalytics = async (period) => {
  const today = new Date();
  let startDate, format;
  
  // Set date range based on period
  if (period === 'week') {
    // Last 7 days
    startDate = new Date();
    startDate.setDate(today.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
    format = '%Y-%m-%d';
  } else if (period === 'month') {
    // Current month
    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    format = '%Y-%m-%d';
  } else if (period === 'year') {
    // Current year
    startDate = new Date(today.getFullYear(), 0, 1);
    format = '%Y-%m';
  }
  
  // Revenue analytics
  const revenueData = await Appointment.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: today },
        'payment.status': 'completed'
      }
    },
    {
      $group: {
        _id: { $dateToString: { format, date: '$createdAt' } },
        revenue: { $sum: '$service.price' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
  
  // User registrations
  const userRegistrations = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: today }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format, date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
  
  // Shop registrations
  const shopRegistrations = await Shop.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: today }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format, date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
  
  // Appointment analytics
  const appointmentsByStatus = await Appointment.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: today }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  return {
    revenue: {
      data: revenueData,
      total: revenueData.reduce((sum, item) => sum + item.revenue, 0)
    },
    users: {
      data: userRegistrations,
      total: userRegistrations.reduce((sum, item) => sum + item.count, 0)
    },
    shops: {
      data: shopRegistrations,
      total: shopRegistrations.reduce((sum, item) => sum + item.count, 0)
    },
    appointments: {
      byStatus: appointmentsByStatus,
      total: appointmentsByStatus.reduce((sum, item) => sum + item.count, 0)
    }
  };
};

// Get recent activities
exports.getRecentActivities = async (limit) => {
  // Get recent user registrations
  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('name email userType createdAt');
  
  // Get recent shop registrations
  const recentShops = await Shop.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('name category owner createdAt')
    .populate('owner', 'name');
  
  // Get recent appointments
  const recentAppointments = await Appointment.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('user shop service status createdAt')
    .populate('user', 'name')
    .populate('shop', 'name');
  
  // Get recent transactions
  const recentTransactions = await Transaction.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('user shop amount type status createdAt')
    .populate('user', 'name')
    .populate('shop', 'name');
  
  // Format activities into a single timeline
  const activities = [
    ...recentUsers.map(user => ({
      type: 'user_registration',
      data: user,
      timestamp: user.createdAt
    })),
    ...recentShops.map(shop => ({
      type: 'shop_registration',
      data: shop,
      timestamp: shop.createdAt
    })),
    ...recentAppointments.map(appointment => ({
      type: 'appointment',
      data: appointment,
      timestamp: appointment.createdAt
    })),
    ...recentTransactions.map(transaction => ({
      type: 'transaction',
      data: transaction,
      timestamp: transaction.createdAt
    }))
  ];
  
  // Sort by timestamp (newest first) and limit
  return activities
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
};

exports.getUserByIdAdmin = async (userId) => {
  try {
    if (!userId) throw new Error('User ID is required');
    const user = await User.findById(userId).select('-password');
    if (!user) throw new Error('User not found');
    return user;
  } catch (error) {
    throw new Error(`Error fetching user: ${error.message}`);
  }
};

exports.updateUserByIdAdmin = async (userId, updateData) => {
  try {
    if (!userId || !updateData) throw new Error('User ID and update data are required');
    
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    
    const allowedFields = ['name', 'email', 'phone', 'userType', 'isActive'];
    const updates = {};
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    return updatedUser;
  } catch (error) {
    throw new Error(`Error updating user: ${error.message}`);
  }
};

exports.deleteUserByIdAdmin = async (userId) => {
  try {
    if (!userId) throw new Error('User ID is required');
    
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    
    // Optional: Add checks for associated data
    const hasAppointments = await Appointment.exists({ user: userId });
    if (hasAppointments) {
      throw new Error('Cannot delete user with existing appointments');
    }
    
    await user.deleteOne();
    return { message: 'User successfully deleted' };
  } catch (error) {
    throw new Error(`Error deleting user: ${error.message}`);
  }
};


// kknsjsjksakjsaksas