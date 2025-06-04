// controllers/appointmentController.js
const Appointment = require('../models/Appointment');
const Shop = require('../models/Shop');
const User = require('../models/User');
const { sendAppointmentConfirmation, sendAppointmentReminder } = require('../services/notificationService');

// Check available time slots
exports.getAvailableTimeSlots = async (req, res) => {
  try {
    const { shopId, serviceId, date } = req.query;
    
    // Validate inputs
    if (!shopId || !serviceId || !date) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    // Get shop details
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    
    // Get service details
    const service = shop.services.id(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    const serviceDuration = service.duration;
    
    // Get shop operating hours for the selected date
    const selectedDate = new Date(date);
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedDate.getDay()];
    
    const operatingHours = shop.operatingHours.find(oh => oh.day === dayOfWeek);
    if (!operatingHours || operatingHours.isClosed) {
      return res.json({ availableSlots: [], message: 'Shop is closed on this day' });
    }
    
    // Convert shop hours to minutes since midnight for easier calculations
    const shopOpenMinutes = convertTimeToMinutes(operatingHours.open);
    const shopCloseMinutes = convertTimeToMinutes(operatingHours.close);
    
    // Get existing appointments for the selected date
    const existingAppointments = await Appointment.find({
      shop: shopId,
      date: {
        $gte: new Date(selectedDate.setHours(0, 0, 0)),
        $lt: new Date(selectedDate.setHours(23, 59, 59))
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
    
    res.json({ availableSlots });
  } catch (error) {
    console.error('Error fetching available time slots:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new appointment
exports.createAppointment = async (req, res) => {
  try {
    const {
      shopId,
      serviceId,
      staffId,
      date,
      startTime,
      endTime,
      notes,
      paymentMethod
    } = req.body;
    
    const userId = req.user.id; // From auth middleware
    
    // Validate inputs
    if (!shopId || !serviceId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Get shop and service details
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    
    const service = shop.services.id(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
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
    
    // Create new appointment
    const appointment = new Appointment({
      user: userId,
      shop: shopId,
      service: {
        id: service._id,
        name: service.name,
        duration: service.duration,
        price: service.price
      },
      staff: staffInfo,
      date: new Date(date),
      startTime,
      endTime,
      notes,
      payment: {
        amount: service.price,
        method: paymentMethod || 'offline',
        status: paymentMethod === 'online' ? 'completed' : 'pending'
      },
      status: paymentMethod === 'online' ? 'confirmed' : 'pending'
    });
    
    await appointment.save();
    
    // Send confirmation notification
    await sendAppointmentConfirmation(userId, appointment._id);
    
    // Schedule reminder for 24 hours before appointment
    const reminderDate = new Date(date);
    reminderDate.setDate(reminderDate.getDate() - 1);
    
    // In a production app, you would use a job scheduler like Agenda, Bull, etc.
    // For simplicity, we're just logging this action
    console.log(`Reminder scheduled for ${reminderDate}`);
    
    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
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
// Get user's appointments
exports.getUserAppointments = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const appointments = await Appointment.find({ user: userId })
      .populate('shop', 'name') // Populate shop details
      .sort({ date: 1, startTime: 1 }); // Sort by date and time
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching user appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.getShopAppointments = async (req, res) => {
  try {
    const { shopId } = req.params;
    // Add middleware to ensure the user is authorized to view these appointments

    const appointments = await Appointment.find({ shop: shopId })
      .populate('user', 'name') // Populate user details
      .sort({ date: 1, startTime: 1 });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching shop appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.getAppointmentById = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const appointment = await Appointment.findById(appointmentId)
      .populate('user', 'name') // Populate user details
      .populate('shop', 'name') // Populate shop details
      .populate('staff', 'name'); // Populate staff details if available
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
      const { appointmentId } = req.params;
      const { status } = req.body;
      const userId = req.user.id; // From auth middleware (likely for authorization checks)

      // Validate the status (you might want to define allowed status values)
      const allowedStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'];
      if (!allowedStatuses.includes(status)) {
          return res.status(400).json({ message: 'Invalid appointment status' });
      }

      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
          return res.status(404).json({ message: 'Appointment not found' });
      }

      // Implement authorization logic here if needed
      // For example, only shop owners might be allowed to confirm or complete appointments

      appointment.status = status;
      await appointment.save();

      res.json({ message: 'Appointment status updated successfully', appointment });

  } catch (error) {
      console.error('Error updating appointment status:', error);
      res.status(500).json({ message: 'Server error' });
  }
};
// Cancel appointment
exports.cancelAppointment = async (req, res) => {
  try {
      const { appointmentId } = req.params;

      const updatedAppointment = await Appointment.findByIdAndUpdate(
          appointmentId,
          { status: 'cancelled' },
          { new: true }
      );

      if (!updatedAppointment) {
          return res.status(404).json({ message: 'Appointment not found' });
      }

      res.json({ message: 'Appointment cancelled successfully', appointment: updatedAppointment });
  } catch (error) {
      console.error('Error cancelling appointment:', error);
      res.status(500).json({ message: 'Server error' });
  }
};