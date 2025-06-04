// client/src/services/adminService.js
import api from './api';

// Get system statistics
export const getSystemStats = async () => {
  return api.get('/admin/stats');
};

// Get pending shop approvals
export const getPendingApprovals = async () => {
  return api.get('/admin/shops/pending');
};
console.log("getPendingApprovals",getPendingApprovals());
// Approve shop
export const approveShop = async (shopId, message = "Approved by admin") => {
  try {
    const response = await api.put(`/admin/shops/${shopId}/approve`, { message });
    return response.data;
  } catch (error) {
    console.error('Error approving shop:', error.response?.data || error.message);
    throw error;
  }
};

console.log("approveShop",approveShop());
// Reject shop
export const rejectShop = async (shopId, reason) => {
  try {
    const response = await api.put(`/admin/shops/${shopId}/reject`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error rejecting shop:', error.response?.data || error.message);
    throw error;
  }
};
console.log("rejectShop",rejectShop());
// Get all users
export const getAllUsers = async () => {
  return api.get('/admin/users');
};

// Get recent users
export const getRecentUsers = async () => {
  return api.get('/admin/users/recent');
};

// Get all shops
export const getAllShopsAdmin = async () => {
  return api.get('/shops/admin/all');
};

// Update user status
export const updateUserStatus = async (userId, status) => {
  return api.put(`/admin/users/${userId}/status`, { status,reason: 'Admin update' });
};

// Get system reports
export const getSystemReports = async () => {
  return api.get('/admin/reports');
};

// Get revenue analytics
export const getRevenueAnalyticsAdmin = async (period = 'month') => {
  return api.get(`/admin/analytics/revenue?period=${period}`);
};

export const getPopularServicesByRating = async () => {
  return api.get('/admin/popular-services');
}
// Get service categories count
export const getServiceCategoriesCount = async () => {
  return api.get('/admin/service-categories');
};  
console.log("getServiceCategoriesCount",getServiceCategoriesCount());
console.log("getPopularServicesByRating",getPopularServicesByRating());