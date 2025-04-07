// server/services/notificationService.js
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Shop = require('../models/Shop');
const config = require('../config/config');

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.emailUser,
    pass: config.emailPassword
  }
});

// SMS service configuration (using a hypothetical SMS service)
// In a real application, you would use services like Twilio, Nexmo, etc.
const smsService = {
  sendSMS: async (phoneNumber, message) => {
    // This is a placeholder. In a real application, you would implement 
    // actual SMS sending logic using a service provider's API
    console.log(`Sending SMS to ${phoneNumber}: ${message}`);
    return { success: true };
  }
};

// Send OTP for verification
exports.sendOTP = async (email, phone, otp) => {
  try {
    // Send email OTP
    if (email) {
      const mailOptions = {
        from: config.emailUser,
        to: email,
        subject: 'Your Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fef4ea; border-radius: 10px;">
            <h2 style="color: #a38772; text-align: center;">Verification Code</h2>
            <p style="font-size: 16px; line-height: 1.5;">Thank you for registering with our Beauty & Wellness Booking Platform. To complete your registration, please use the following verification code:</p>
            <div style="text-align: center; padding: 20px;">
              <span style="background-color: #doa189; color: white; font-size: 24px; padding: 10px 20px; border-radius: 5px;">${otp}</span>
            </div>
            <p style="font-size: 16px; line-height: 1.5;">This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
          </div>
        `
      };
      
      await transporter.sendMail(mailOptions);
    }
    
    // Send SMS OTP
    if (phone) {
      await smsService.sendSMS(
        phone,
        `Your verification code for Beauty & Wellness Platform is: ${otp}. This code will expire in 10 minutes.`
      );
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

// Send appointment confirmation
exports.sendAppointmentConfirmation = async (userId, appointmentId) => {
  try {
    const user = await User.findById(userId);
    const appointment = await Appointment.findById(appointmentId)
      .populate('shop', 'name address contactInfo');
    
    if (!user || !appointment) {
      throw new Error('User or appointment not found');
    }
    
    // Format date and time
    const appointmentDate = new Date(appointment.date);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Send confirmation email
    const mailOptions = {
      from: config.emailUser,
      to: user.email,
      subject: 'Appointment Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fef4ea; border-radius: 10px;">
          <h2 style="color: #a38772; text-align: center;">Appointment Confirmed!</h2>
          <p style="font-size: 16px; line-height: 1.5;">Dear ${user.name},</p>
          <p style="font-size: 16px; line-height: 1.5;">Your appointment has been confirmed with the following details:</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Service:</strong> ${appointment.service.name}</p>
            <p><strong>Shop:</strong> ${appointment.shop.name}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${appointment.startTime} - ${appointment.endTime}</p>
            <p><strong>Price:</strong> ₹${appointment.service.price}</p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.5;">Shop Address: ${appointment.shop.address.street}, ${appointment.shop.address.city}</p>
          <p style="font-size: 16px; line-height: 1.5;">Contact: ${appointment.shop.contactInfo.phone}</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${config.frontendUrl}/appointments/${appointment._id}" style="background-color: #doa189; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Appointment</a>
          </div>
          
          <p style="font-size: 14px; line-height: 1.5; margin-top: 30px; color: #666;">If you need to cancel or reschedule, please do so at least 24 hours in advance.</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    // Send confirmation SMS
    if (user.phone) {
      await smsService.sendSMS(
        user.phone,
        `Your appointment at ${appointment.shop.name} on ${formattedDate} at ${appointment.startTime} has been confirmed. View details in app.`
      );
    }
    
    // Create in-app notification
    user.notifications.push({
      message: `Your appointment at ${appointment.shop.name} on ${formattedDate} at ${appointment.startTime} has been confirmed.`,
      read: false,
      createdAt: new Date()
    });
    
    await user.save();
    
    return { success: true };
  } catch (error) {
    console.error('Error sending appointment confirmation:', error);
    throw error;
  }
};

// Send appointment reminder
exports.sendAppointmentReminder = async (appointmentId) => {
  try {
    const appointment = await Appointment.findById(appointmentId)
      .populate('user', 'name email phone notifications')
      .populate('shop', 'name address');
    
    if (!appointment) {
      throw new Error('Appointment not found');
    }
    
    const user = appointment.user;
    
    // Format date and time
    const appointmentDate = new Date(appointment.date);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
       // Send reminder email
       const mailOptions = {
        from: config.emailUser,
        to: user.email,
        subject: 'Appointment Reminder',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fef4ea; border-radius: 10px;">
            <h2 style="color: #a38772; text-align: center;">Appointment Reminder</h2>
            <p style="font-size: 16px; line-height: 1.5;">Dear ${user.name},</p>
            <p style="font-size: 16px; line-height: 1.5;">This is a friendly reminder about your upcoming appointment:</p>
            
            <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Service:</strong> ${appointment.service.name}</p>
              <p><strong>Shop:</strong> ${appointment.shop.name}</p>
              <p><strong>Date:</strong> ${formattedDate} (Tomorrow)</p>
              <p><strong>Time:</strong> ${appointment.startTime} - ${appointment.endTime}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${config.frontendUrl}/appointments/${appointment._id}" style="background-color: #doa189; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Appointment</a>
            </div>
            
            <p style="font-size: 14px; line-height: 1.5; margin-top: 30px; color: #666;">If you need to cancel or reschedule, please do so as soon as possible.</p>
          </div>
        `
      };
      
      await transporter.sendMail(mailOptions);
      
      // Send reminder SMS
      if (user.phone) {
        await smsService.sendSMS(
          user.phone,
          `Reminder: Your appointment at ${appointment.shop.name} is tomorrow at ${appointment.startTime}. We look forward to seeing you!`
        );
      }
      
      // Create in-app notification
      user.notifications.push({
        message: `Reminder: Your appointment at ${appointment.shop.name} is tomorrow at ${appointment.startTime}.`,
        read: false,
        createdAt: new Date()
      });
      
      await user.save();
      
      return { success: true };
    } catch (error) {
      console.error('Error sending appointment reminder:', error);
      throw error;
    }
  };
  
  // Send shop approval notification
  exports.sendShopApprovalNotification = async (shopId, isApproved) => {
    try {
      const shop = await Shop.findById(shopId)
        .populate('owner', 'name email phone notifications');
      
      if (!shop) {
        throw new Error('Shop not found');
      }
      
      const owner = shop.owner;
      const status = isApproved ? 'approved' : 'rejected';
      
      // Send email notification
      const mailOptions = {
        from: config.emailUser,
        to: owner.email,
        subject: `Shop Registration ${isApproved ? 'Approved' : 'Rejected'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fef4ea; border-radius: 10px;">
            <h2 style="color: #a38772; text-align: center;">Shop Registration ${isApproved ? 'Approved' : 'Rejected'}</h2>
            <p style="font-size: 16px; line-height: 1.5;">Dear ${owner.name},</p>
            
            ${isApproved ? `
              <p style="font-size: 16px; line-height: 1.5;">Congratulations! Your shop <strong>${shop.name}</strong> has been approved and is now live on our platform.</p>
              <p style="font-size: 16px; line-height: 1.5;">You can now start adding services, managing your calendar, and accepting bookings from customers.</p>
            ` : `
              <p style="font-size: 16px; line-height: 1.5;">We regret to inform you that your shop <strong>${shop.name}</strong> registration has been rejected.</p>
              <p style="font-size: 16px; line-height: 1.5;">Reason: ${shop.verificationDetails?.message || 'Your shop does not meet our platform requirements.'}</p>
              <p style="font-size: 16px; line-height: 1.5;">You can update your shop details and resubmit for approval. If you need assistance, please contact our support team.</p>
            `}
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${config.frontendUrl}/vendor/dashboard" style="background-color: #doa189; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
            </div>
          </div>
        `
      };
      
      await transporter.sendMail(mailOptions);
      
      // Create in-app notification
      owner.notifications.push({
        message: `Your shop ${shop.name} has been ${status}.${!isApproved ? ' Reason: ' + shop.verificationDetails?.message : ''}`,
        read: false,
        createdAt: new Date()
      });
      
      await owner.save();
      
      return { success: true };
    } catch (error) {
      console.error('Error sending shop approval notification:', error);
      throw error;
    }
  };
  
  // Send booking notification to shop owner
  exports.sendBookingNotificationToOwner = async (appointmentId) => {
    try {
      const appointment = await Appointment.findById(appointmentId)
        .populate('user', 'name')
        .populate('shop');
      
      if (!appointment || !appointment.shop) {
        throw new Error('Appointment or shop not found');
      }
      
      const shop = appointment.shop;
      
      // Get shop owner
      const owner = await User.findById(shop.owner);
      if (!owner) {
        throw new Error('Shop owner not found');
      }
      
      // Format date and time
      const appointmentDate = new Date(appointment.date);
      const formattedDate = appointmentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Send email notification
      const mailOptions = {
        from: config.emailUser,
        to: owner.email,
        subject: 'New Appointment Booking',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fef4ea; border-radius: 10px;">
            <h2 style="color: #a38772; text-align: center;">New Appointment Booked</h2>
            <p style="font-size: 16px; line-height: 1.5;">Dear ${owner.name},</p>
            <p style="font-size: 16px; line-height: 1.5;">You have a new appointment booking for your shop <strong>${shop.name}</strong>:</p>
            
            <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Customer:</strong> ${appointment.user.name}</p>
              <p><strong>Service:</strong> ${appointment.service.name}</p>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${appointment.startTime} - ${appointment.endTime}</p>
              <p><strong>Price:</strong> ₹${appointment.service.price}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${config.frontendUrl}/vendor/appointments" style="background-color: #doa189; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Appointments</a>
            </div>
          </div>
        `
      };
      
      await transporter.sendMail(mailOptions);
      
      // Create in-app notification
      owner.notifications.push({
        message: `New appointment booking by ${appointment.user.name} for ${appointment.service.name} on ${formattedDate} at ${appointment.startTime}.`,
        read: false,
        createdAt: new Date()
      });
      
      await owner.save();
      
      return { success: true };
    } catch (error) {
      console.error('Error sending booking notification to owner:', error);
      throw error;
    }
  };
  
  // Send appointment status update notification
  exports.sendAppointmentStatusUpdate = async (appointmentId, status) => {
    try {
      const appointment = await Appointment.findById(appointmentId)
        .populate('user', 'name email phone notifications')
        .populate('shop', 'name');
      
      if (!appointment) {
        throw new Error('Appointment not found');
      }
      
      const user = appointment.user;
      
      // Format date and time
      const appointmentDate = new Date(appointment.date);
      const formattedDate = appointmentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      let statusText = '';
      let additionalMessage = '';
      
      switch (status) {
        case 'confirmed':
          statusText = 'Confirmed';
          additionalMessage = 'We look forward to serving you.';
          break;
        case 'completed':
          statusText = 'Completed';
          additionalMessage = 'Thank you for choosing us. We hope you enjoyed our service.';
          break;
        case 'cancelled':
          statusText = 'Cancelled';
          additionalMessage = 'We hope to serve you in the future.';
          break;
        case 'no-show':
          statusText = 'Marked as No-Show';
          additionalMessage = 'Please contact the shop if you would like to reschedule.';
          break;
        default:
          statusText = status.charAt(0).toUpperCase() + status.slice(1);
      }
      
      // Send email notification
      const mailOptions = {
        from: config.emailUser,
        to: user.email,
        subject: `Appointment ${statusText}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fef4ea; border-radius: 10px;">
            <h2 style="color: #a38772; text-align: center;">Appointment ${statusText}</h2>
            <p style="font-size: 16px; line-height: 1.5;">Dear ${user.name},</p>
            <p style="font-size: 16px; line-height: 1.5;">Your appointment has been ${status}:</p>
            
            <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Service:</strong> ${appointment.service.name}</p>
              <p><strong>Shop:</strong> ${appointment.shop.name}</p>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${appointment.startTime} - ${appointment.endTime}</p>
            </div>
            
            <p style="font-size: 16px; line-height: 1.5;">${additionalMessage}</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${config.frontendUrl}/appointments/${appointment._id}" style="background-color: #doa189; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Appointment</a>
            </div>
          </div>
        `
      };
      
      await transporter.sendMail(mailOptions);
      
      // Send SMS notification
      if (user.phone) {
        await smsService.sendSMS(
          user.phone,
          `Your appointment at ${appointment.shop.name} on ${formattedDate} at ${appointment.startTime} has been ${status}.`
        );
      }
      
      // Create in-app notification
      user.notifications.push({
        message: `Your appointment at ${appointment.shop.name} on ${formattedDate} at ${appointment.startTime} has been ${status}.`,
        read: false,
        createdAt: new Date()
      });
      
      await user.save();
      
      return { success: true };
    } catch (error) {
      console.error('Error sending appointment status update:', error);
      throw error;
    }
  };
  