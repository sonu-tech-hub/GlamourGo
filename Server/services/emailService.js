// Update server/services/emailService.js (create this if it doesn't exist)
const nodemailer = require('nodemailer');
const config = require('../config/config');

// Initialize transporter
let transporter;


const initTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail', // Or your preferred email service
      auth: {
        user: config.emailUser,
        pass: config.emailPassword
      }
    });
  }
  return transporter;
};

/**
 * Send email
 * @param {Object} options - Email options
 */
exports.sendEmail = async (options) => {
  try {
    const mailTransporter = initTransporter();
    
    const mailOptions = {
      from: `"Beauty Booking" <${config.emailUser}>`,
      to: options.to,
      subject: options.subject,
      html: options.html
    };
    
    await mailTransporter.sendMail(mailOptions);
    console.log(`Email sent to: ${options.to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send OTP verification email
 * @param {String} email - Recipient email
 * @param {String} otp - OTP code
 */
exports.sendOtpEmail = async (email, otp) => {
  try {
    const mailOptions = {
      to: email,
      subject: 'Your Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #doa189; text-align: center;">Verification Code</h2>
          <p style="margin: 20px 0; text-align: center; font-size: 16px;">Use the following code to verify your account:</p>
          <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">${otp}</div>
          <p style="margin: 20px 0; text-align: center; color: #777; font-size: 14px;">This code will expire in 10 minutes.</p>
          <p style="margin: 20px 0; text-align: center; color: #777; font-size: 14px;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `
    };
    
    await this.sendEmail(mailOptions);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};

/**
 * Send password reset email
 * @param {String} email - Recipient email
 * @param {String} resetUrl - Password reset URL
 */
exports.sendPasswordResetEmail = async (email, resetUrl) => {
  try {
    const mailOptions = {
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #doa189; text-align: center;">Password Reset</h2>
          <p style="margin: 20px 0; text-align: center; font-size: 16px;">You requested a password reset. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #doa189; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p style="margin: 20px 0; text-align: center; color: #777; font-size: 14px;">This link will expire in 1 hour.</p>
          <p style="margin: 20px 0; text-align: center; color: #777; font-size: 14px;">If you didn't request this reset, you can safely ignore this email.</p>
        </div>
      `
    };
    
    await this.sendEmail(mailOptions);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

/**
 * Send password changed confirmation email
 * @param {String} email - Recipient email
 */
exports.sendPasswordChangedEmail = async (email) => {
  try {
    const mailOptions = {
      to: email,
      subject: 'Password Changed Successfully',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #doa189; text-align: center;">Password Updated</h2>
          <p style="margin: 20px 0; text-align: center; font-size: 16px;">Your password has been successfully changed.</p>
          <p style="margin: 20px 0; text-align: center; font-size: 16px;">If you didn't make this change, please contact our support team immediately.</p>
        </div>
      `
    };
    
    await this.sendEmail(mailOptions);
  } catch (error) {
    console.error('Error sending password changed email:', error);
    throw error;
  }
};

/**
 * Send welcome email
 * @param {String} email - Recipient email
 * @param {String} name - User's name
 */
exports.sendWelcomeEmail = async (email, name) => {
  try {
    const mailOptions = {
      to: email,
      subject: 'Welcome to Beauty Booking!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #doa189; text-align: center;">Welcome to Beauty Booking</h2>
          <p style="margin: 20px 0; text-align: center; font-size: 16px;">Hi ${name},</p>
          <p style="margin: 20px 0; text-align: center; font-size: 16px;">Thank you for joining Beauty Booking! We're excited to have you as a member of our community.</p>
          <p style="margin: 20px 0; text-align: center; font-size: 16px;">You can now book appointments, explore services, and more.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${config.frontendUrl}/explore" style="background-color: #doa189; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Explore Services</a>
          </div>
        </div>
      `
    };
    
    await this.sendEmail(mailOptions);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};