// server/services/appointmentService.js
const Appointment = require('../models/Appointment');
const Shop = require('../models/Shop');
const User = require('../models/User');
const Service = require('../models/Service');
const { sendAppointmentConfirmation, sendAppointmentReminder } = require('./notificationService');

// Get available time slots
exports.getAvailableTimeSlots = async (shopId, serviceId, date) => {
  // Get shop details
  const shop = await Shop.findById(shopId);
  if (!shop) {
    throw new Error('Shop not found');
  }
  
  // Get service details
  const service = await Service.findById(serviceId);
  if (!service) {
    throw new Error('Service not found');
  }
  
  const serviceDuration = service.duration;
  
  // Get shop operating hours for the selected date
  const selectedDate = new Date(date);
  const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedDate.getDay()];
  
  const operatingHours = shop.operatingHours.find(oh => oh.day === dayOfWeek);
  if (!operatingHours || operatingHours.isClosed) {
    return { availableSlots: [], message: 'Shop is closed on this day' };
  }
  
  // Convert shop hours to minutes since midnight for easier calculations
  const shopOpenMinutes = convertTimeToMinutes(operatingHours.open);
  const shopCloseMinutes = convertTimeToMinutes(operatingHours.close);
  
  // Get existing appointments for the selected date
  const existingAppointments = await Appointment.find({
    shop: shopId,
    date: {
      $gte: new Date(new Date(date).setHours(0, 0, 0)),
      $lt: new Date(new Date(date).setHours(23, 59, 59))
    },
    status: { $in: ['pending', 'confirmed'] }
  });
  
  // Create array of all possible time slots
  const timeSlots = [];
  for (let minutes = shopOpenMinutes; minutes <= shopCloseMinutes - serviceDuration; minutes += 30) {
    const slotStartTime = convertMinutesToTime(minutes);
    const slotEndTime = convertMinutesToTime(minutes + serviceDuration);
    
    timeSlots.push({
      startTime: slotStartTime,
      endTime: slotEndTime,
      available: true
    });
  }
  
  // Mark booked slots as unavailable
  existingAppointments.forEach(appointment => {
    const apptStartMinutes = convertTimeToMinutes(appointment.startTime);
    const apptEndMinutes = convertTimeToMinutes(appointment.endTime);
    
    timeSlots.forEach(slot => {
      const slotStartMinutes = convertTimeToMinutes(slot.startTime);
      const slotEndMinutes = convertTimeToMinutes(slot.endTime);
      
      // Check if this slot overlaps with the appointment
      if (
        (slotStartMinutes >= apptStartMinutes && slotStartMinutes < apptEndMinutes) ||
        (slotEndMinutes > apptStartMinutes && slotEndMinutes <= apptEndMinutes) ||
        (slotStartMinutes <= apptStartMinutes && slotEndMinutes >= apptEndMinutes)
      ) {
        slot.available = false;
      }
    });
  });
  
  // Filter out unavailable slots
  const availableSlots = timeSlots.filter(slot => slot.available);
  
  return { availableSlots };
};

// Create a new appointment
exports.createAppointment = async (appointmentData, userId) => {
  const {
    shopId,
    serviceId,
    staffId,
    date,
    startTime,
    endTime,
    notes,
    paymentMethod,
    couponCode
  } = appointmentData;
  
  // Validate shop and service
  const shop = await Shop.findById(shopId);
  if (!shop) {
    throw new Error('Shop not found');
  }
  
  const service = await Service.findById(serviceId);
  if (!service) {
    throw new Error('Service not found');
  }
  
  // Verify time slot availability
  const { availableSlots } = await this.getAvailableTimeSlots(shopId, serviceId, date);
  const isSlotAvailable = availableSlots.some(
    slot => slot.startTime === startTime && slot.endTime === endTime
  );
  
  if (!isSlotAvailable) {
    throw new Error('Selected time slot is not available');
  }
  
  // Get staff details if provided
  let staffInfo = {};
  if (staffId) {
    const staff = shop.staff.id(staffId);
    if (staff) {
      staffInfo = {
        id: staff._id,
        name: staff.name
      };
    }
  }
  
  // Apply coupon if provided
  let finalPrice = service.price;
  let appliedPromotion = null;
  
  if (couponCode) {
    const promotionService = require('./promotionService');
    const validationResult = await promotionService.validatePromotion({
      shopId,
      couponCode,
      serviceIds: [serviceId],
      totalAmount: service.price,
      userId
    });
    
    if (validationResult.valid) {
      finalPrice = validationResult.discountedTotal;
      appliedPromotion = validationResult.promotion;
    }
  }
  
  // Create appointment
  const appointment = new Appointment({
    user: userId,
    shop: shopId,
    service: {
      id: service._id,
      name: service.name,
      duration: service.duration,
      price: finalPrice
    },
    staff: staffInfo,
    date: new Date(date),
    startTime,
    endTime,
    notes,
    payment: {
      amount: finalPrice,
      method: paymentMethod || 'offline',
      status: paymentMethod === 'online' ? 'pending' : 'pending'
    },
    status: 'pending',
    promotion: appliedPromotion ? {
      id: appliedPromotion.id,
      code: couponCode,
      discount: service.price - finalPrice
    } : null
  });
  
  await appointment.save();
  
  // Send confirmation notification
  await sendAppointmentConfirmation(userId, appointment._id);
  
  // Schedule reminder for 24 hours before appointment
  const reminderDate = new Date(date);
  reminderDate.setDate(reminderDate.getDate() - 1);
  
  // In a production app, you would use a job scheduler like Agenda, Bull, etc.
  // For simplicity in this implementation, we'll just log the action
  console.log(`Reminder scheduled for ${reminderDate}`);
  
  return appointment;
};

// Get user appointments
exports.getUserAppointments = async (userId) => {
  const appointments = await Appointment.find({ user: userId })
    .populate('shop', 'name address contactInfo')
    .sort({ date: -1, startTime: 1 });
  
  return appointments;
};

// Get shop appointments
exports.getShopAppointments = async (shopId, ownerId) => {
  // Verify shop ownership
  const shop = await Shop.findById(shopId);
  if (!shop) {
    throw new Error('Shop not found');
  }
  
  if (shop.owner.toString() !== ownerId) {
    throw new Error('Unauthorized: You are not the owner of this shop');
  }
  
  const appointments = await Appointment.find({ shop: shopId })
    .populate('user', 'name email phone profilePicture')
    .sort({ date: -1, startTime: 1 });
  
  return appointments;
};

// Get appointment by ID
exports.getAppointmentById = async (appointmentId, userId) => {
  const appointment = await Appointment.findById(appointmentId)
    .populate('shop', 'name address contactInfo operatingHours')
    .populate('user', 'name email phone');
  
  if (!appointment) {
    throw new Error('Appointment not found');
  }
  
  // Check if the user is the appointment owner or the shop owner
  const shop = await Shop.findById(appointment.shop._id);
  const isShopOwner = shop.owner.toString() === userId;
  const isAppointmentOwner = appointment.user._id.toString() === userId;
  
  if (!isShopOwner && !isAppointmentOwner) {
    throw new Error('Unauthorized access to appointment');
  }
  
  return appointment;
};

// Update appointment status
exports.updateAppointmentStatus = async (appointmentId, status, userId) => {
  const appointment = await Appointment.findById(appointmentId);
  
  if (!appointment) {
    throw new Error('Appointment not found');
  }
  
  // Verify the user is either the appointment owner or shop owner
  const shop = await Shop.findById(appointment.shop);
  const isShopOwner = shop.owner.toString() === userId;
  const isAppointmentOwner = appointment.user.toString() === userId;
  
  if (!isShopOwner && !isAppointmentOwner) {
    throw new Error('Unauthorized: You cannot update this appointment');
  }
  
  // Validate status transition
  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['completed', 'cancelled', 'no-show'],
    completed: [],
    cancelled: [],
    'no-show': []
  };
  
  if (!validTransitions[appointment.status].includes(status)) {
    throw new Error(`Cannot change status from ${appointment.status} to ${status}`);
  }
  
  // Only shop owner can mark as completed or no-show
  if ((status === 'completed' || status === 'no-show') && !isShopOwner) {
    throw new Error('Only the shop owner can mark appointments as completed or no-show');
  }
  
  // Update appointment status
  appointment.status = status;
  
  // If appointment is cancelled, handle refund if applicable
  if (status === 'cancelled' && appointment.payment.status === 'completed') {
    // In a real implementation, you would initiate a refund process
    appointment.payment.status = 'refunded';
    
    // Add to shop's refund records
    shop.refunds = shop.refunds || [];
    shop.refunds.push({
      appointmentId: appointment._id,
      amount: appointment.service.price,
      date: new Date()
    });
    
    await shop.save();
  }
  
  await appointment.save();
  
  // Notify user about status change
  const user = await User.findById(appointment.user);
  user.notifications.push({
    message: `Your appointment for ${appointment.service.name} at ${shop.name} has been ${status}.`,
    read: false,
    createdAt: new Date()
  });
  
  await user.save();
  
  return appointment;
};

// Cancel appointment
exports.cancelAppointment = async (appointmentId, userId) => {
  return await this.updateAppointmentStatus(appointmentId, 'cancelled', userId);
};

// Helper functions
function convertTimeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

function convertMinutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}