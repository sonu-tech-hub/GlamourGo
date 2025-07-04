// client/src/services/adminService.js

import api from "./api";

// Get system statistics
export const getSystemStats = async () => {
  return api.get("/admin/stats");
};

// Get pending shop approvals
export const getPendingApprovals = async () => {
  // Ensure your backend route matches this exactly.
  // It could also be '/shops/admin/all?isVerified=false' depending on your API.
  return api.get("/admin/shops/pending");
};

// Approve shop: Sending message under 'message' and 'verificationDetails'
export const approveShop = async (
  shopId,
  approvalMessage = "Approved by admin"
) => {
  try {
    const response = await api.put(`/admin/shops/${shopId}/approve`, {
      message: approvalMessage, // Common field name for approval message
      verificationDetails: approvalMessage, // Used by your shopService in shopController (from earlier context)
      isVerified: true, // Explicitly state verification status
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error approving shop ${shopId}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

// Reject shop: Sending reason under 'reason' and 'verificationDetails'
export const rejectShop = async (shopId, rejectionReason) => {
  try {
    const response = await api.put(`/admin/shops/${shopId}/reject`, {
      reason: rejectionReason, // Common field name for rejection reason
      verificationDetails: rejectionReason, // Used by your shopService in shopController (from earlier context)
      isVerified: false, // Explicitly state verification status
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error rejecting shop ${shopId}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

// Get all users
export const getAllUsers = async () => {
  return api.get("/admin/users");
};

// Get recent users
export const getRecentUsers = async () => {
  return api.get("/admin/users/recent");
};

// Get all shops (admin view)
export const getAllShopsAdmin = async () => {
  return api.get("/shops/admin/all");
};

// Update user status
export const updateUserStatus = async (userId, status) => {
  return api.put(`/admin/users/${userId}/status`, {
    status,
    reason: "Admin update",
  });
};

// Get system reports
export const getSystemReports = async () => {
  return api.get("/admin/reports");
};

// Get revenue analytics
export const getRevenueAnalyticsAdmin = async (period = "month") => {
  return api.get(`/admin/analytics/revenue?period=${period}`);
};

// Get popular services by rating
export const getPopularServicesByRating = async () => {
  return api.get("/admin/popular-services");
};
// Get service categories count
export const getServiceCategoriesCount = async () => {
  return api.get("/admin/service-categories");
};
