// client/src/services/userService.js
import api from './api';

// Get user profile
export const getUserProfile = async () => {
  return api.get('/users/profile');
};

// Update user profile
export const updateUserProfile = async (userData) => {
  return api.put('/users/profile', userData);
};

// Change password
export const changePassword = async (passwordData) => {
  return api.put('/users/password', passwordData);
};

// Upload profile image
export const uploadProfileImage = async (formData) => {
  return api.post('/users/profile-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Get user notifications
export const getUserNotifications = async () => {
  return api.get('/users/notifications');
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  return api.put(`/users/notifications/${notificationId}/read`);
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  return api.delete(`/users/notifications/${notificationId}`);
};