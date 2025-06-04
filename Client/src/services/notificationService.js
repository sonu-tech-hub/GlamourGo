// client/src/services/notificationService.js

import api from './api';

/**
 * Request to send OTP to user via email or phone.
 * @param {Object} payload - Object containing email or phone and OTP
 * @param {string} [payload.email] - User email (optional)
 * @param {string} [payload.phone] - User phone number (optional)
 * @param {string} payload.otp - OTP to send
 */
export const sendOTP = async (payload) => {
  return api.post('/notifications/send-otp', payload);
};

/**
 * Trigger appointment confirmation notification (email + SMS + in-app).
 * Usually handled after appointment creation.
 * @param {string} userId - ID of the user
 * @param {string} appointmentId - ID of the appointment
 */
export const sendAppointmentConfirmation = async (userId, appointmentId) => {
  return api.post('/notifications/appointment-confirmation', { userId, appointmentId });
};

/**
 * Send appointment reminder (email + SMS + in-app).
 * Usually called by a scheduler (e.g. cron job or background service).
 * @param {string} appointmentId - ID of the appointment
 */
export const sendAppointmentReminder = async (appointmentId) => {
  return api.post('/notifications/appointment-reminder', { appointmentId });
};

/**
 * Notify shop owner about approval or rejection.
 * @param {string} shopId - ID of the shop
 * @param {boolean} isApproved - true if approved, false if rejected
 */
export const sendShopApprovalNotification = async (shopId, isApproved) => {
  return api.post('/notifications/shop-approval', { shopId, isApproved });
};
