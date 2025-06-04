// server/controllers/adminController.js
const adminService = require('../services/adminService');

// Get dashboard stats

exports.getDashboardStats = async (req, res) => {
  try {
    const stats = await adminService.getDashboardStats();
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get pending shop approvals
exports.getPendingShops = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const pendingShops = await adminService.getPendingShops({
      page: Number(page),
      limit: Number(limit)
    });
    
    res.json(pendingShops);
  } catch (error) {
    console.error('Error fetching pending shops:', error);
    res.status(500).json({ message: error.message });
  }
};

// Approve a shop
exports.approveShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Approval message is required' });
    }

    const shop = await adminService.approveShop(shopId, message);
    res.json({
      message: 'Shop approved successfully',
      shop
    });
  } catch (error) {
    console.error('Error approving shop:', error);
    res.status(500).json({ message: error.message });
  }
};


// Reject a shop
exports.rejectShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const shop = await adminService.rejectShop(shopId, reason);
    res.json({
      message: 'Shop rejected successfully',
      shop
    });
  } catch (error) {
    console.error('Error rejecting shop:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, userType, search } = req.query;
    
    const users = await adminService.getAllUsers({
      page: Number(page),
      limit: Number(limit),
      userType,
      search
    });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update user status
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, reason } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const user = await adminService.updateUserStatus(userId, status, reason);
    
    res.json({
      message: `User ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get reports
exports.getReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;
    
    const reports = await adminService.getReports({
      page: Number(page),
      limit: Number(limit),
      status,
      type
    });
    
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update report status
exports.updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, action, message } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const report = await adminService.updateReportStatus(reportId, status, action, message);
    
    res.json({
      message: 'Report updated successfully',
      report
    });
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get system analytics
exports.getSystemAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    const analytics = await adminService.getSystemAnalytics(period);
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching system analytics:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get recent activities
exports.getRecentActivities = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const activities = await adminService.getRecentActivities(Number(limit));
    
    res.json(activities);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ message: error.message });
  }
};