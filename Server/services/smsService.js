// server/services/smsService.js
const config = require('../config/config');

/**
 * Send SMS
 * @param {String} phone - Recipient phone number
 * @param {String} message - SMS message
 */
exports.sendSMS = async (phone, message) => {
  try {
    // This is a mock implementation
    // In a real application, you would use a service like Twilio, Nexmo, etc.
    console.log(`[SMS MOCK] To: ${phone}, Message: ${message}`);
    
    // Return a success response to simulate sending
    return { success: true };
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw new Error('Failed to send SMS');
  }
};

/**
 * Send OTP via SMS
 * @param {String} phone - Recipient phone number
 * @param {String} otp - OTP code
 */
exports.sendOTP = async (phone, otp) => {
  try {
    const message = `Your Beauty Booking verification code is: ${otp}. This code will expire in 10 minutes.`;
    return await this.sendSMS(phone, message);
  } catch (error) {
    console.error('Error sending OTP via SMS:', error);
    throw error;
  }
};