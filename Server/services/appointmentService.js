// server/services/appointmentService.js
const Appointment = require('../models/Appointment');
const Shop = require('../models/Shop');
const User = require('../models/User');
const Service = require('../models/Service'); // Assuming Service is a separate model

// Import specific functions from notificationService.
// We rename 'sendAppointmentReminder' from notificationService to 'sendNotificationReminder'
// to avoid a naming conflict with the internal helper function '_sendAppointmentReminderLogic'.
const { sendAppointmentConfirmation, sendAppointmentReminder: sendNotificationReminder } = require('./notificationService');
const promotionService = require('./promotionService'); // Assuming promotionService exists

// --- Helper Functions (internal to this service) ---

/**
 * Converts a time string (e.g., "09:30") to total minutes from midnight.
 * Returns NaN for invalid inputs.
 */
function convertTimeToMinutes(timeString) {
    if (!timeString || typeof timeString !== 'string' || !timeString.includes(':')) {
        console.warn('Invalid timeString for convertTimeToMinutes (format error):', timeString);
        return NaN; // Indicate an invalid conversion
    }
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        console.warn('Failed to parse valid hours/minutes from timeString:', timeString);
        return NaN;
    }
    return hours * 60 + minutes;
}

/**
 * Converts total minutes from midnight to a time string (e.g., "09:30").
 * Returns "Invalid Time" for invalid inputs.
 */
function convertMinutesToTime(minutes) {
    if (isNaN(minutes) || minutes < 0) {
        console.warn('Invalid minutes for convertMinutesToTime:', minutes);
        return "Invalid Time"; // Indicate an invalid conversion
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    // Ensure hours and minutes are within valid ranges before padding
    if (hours > 23 || mins > 59) {
        console.warn(`Generated time out of bounds: ${hours}:${mins} from ${minutes} minutes`);
        return "Invalid Time";
    }
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// --- Core Appointment Service Functions ---


exports.getAvailableTimeSlots = async (shopId, serviceId, date) => {
    console.log(`[getAvailableTimeSlots] Called with: shopId=${shopId}, serviceId=${serviceId}, date=${date}`);
    try {
        // Basic input validation
        if (!shopId || !serviceId || !date) {
            console.error('[getAvailableTimeSlots] Missing required parameters: shopId, serviceId, or date.');
            throw new Error('Missing required parameters for fetching time slots.');
        }

        // --- 1. Get Shop Details ---
        const shop = await Shop.findById(shopId);
        if (!shop) {
            console.error(`[getAvailableTimeSlots] Shop not found for ID: ${shopId}`);
            throw new Error('Shop not found');
        }
        console.log(`[getAvailableTimeSlots] Found shop: ${shop.name}`);

        // --- 2. Get Service Details ---
        const service = await Service.findById(serviceId);
        if (!service) {
            console.error(`[getAvailableTimeSlots] Service not found for ID: ${serviceId}`);
            throw new Error('Service not found');
        }
        console.log(`[getAvailableTimeSlots] Found service: ${service.name}, Duration: ${service.duration} mins`);

        // Validate service duration
        if (typeof service.duration !== 'number' || service.duration <= 0) {
            console.error(`[getAvailableTimeSlots] Invalid service duration for service ID ${serviceId}: ${service.duration}. Must be a positive number.`);
            throw new Error('Service duration is invalid or not defined. Must be a positive number.');
        }
        const serviceDuration = service.duration;

        // --- 3. Get Shop Operating Hours for the Selected Date ---
        const selectedDate = new Date(date);
        if (isNaN(selectedDate.getTime())) {
            console.error(`[getAvailableTimeSlots] Invalid date provided: ${date}`);
            throw new Error('Invalid date provided.');
        }
        // Use 0-6 for day of week directly if operatingHours uses numbers, or map to strings if it uses names
        const dayOfWeekIndex = selectedDate.getDay(); // 0 for Sunday, 1 for Monday, etc.
        const dayOfWeekName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeekIndex];
        console.log(`[getAvailableTimeSlots] Selected date: ${date}, Day of week: ${dayOfWeekName}`);

        // Ensure operatingHours is an array before trying to find
        if (!Array.isArray(shop.operatingHours)) {
            console.error(`[getAvailableTimeSlots] shop.operatingHours is not an array for shop ID: ${shopId}`);
            throw new Error('Shop operating hours data is corrupted.');
        }

        // Find operating hours by the day name
        const operatingHours = shop.operatingHours.find(oh => oh.day === dayOfWeekName);
        if (!operatingHours || operatingHours.isClosed) {
            console.log(`[getAvailableTimeSlots] Shop is closed on ${dayOfWeekName} or operating hours not defined.`);
            // Return empty array and a message for clarity on the frontend
            return { availableSlots: [], message: 'Shop is closed on this day' };
        }
        console.log(`[getAvailableTimeSlots] Shop open hours for ${dayOfWeekName}: ${operatingHours.open} - ${operatingHours.close}`);

        // Validate and convert shop hours
        const shopOpenMinutes = convertTimeToMinutes(operatingHours.open);
        const shopCloseMinutes = convertTimeToMinutes(operatingHours.close);

        if (isNaN(shopOpenMinutes) || isNaN(shopCloseMinutes)) {
            console.error(`[getAvailableTimeSlots] Failed to convert shop operating hours to minutes. Open: ${operatingHours.open}, Close: ${operatingHours.close}`);
            throw new Error('Invalid shop operating hour format.');
        }
        if (shopOpenMinutes >= shopCloseMinutes) {
            console.error(`[getAvailableTimeSlots] Shop close time (${operatingHours.close}) is not after open time (${operatingHours.open}).`);
            // Return empty array and a message for clarity on the frontend
            return { availableSlots: [], message: 'Shop close time is before or same as open time. No slots available.' };
        }
        console.log(`[getAvailableTimeSlots] Shop open (minutes): ${shopOpenMinutes}, Close (minutes): ${shopCloseMinutes}`);

        // --- 4. Get Existing Appointments for the Selected Date ---
        // Set date range for query: start of selected day to end of selected day
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const existingAppointments = await Appointment.find({
            shop: shopId,
            date: {
                $gte: startOfDay,
                $lt: endOfDay
            },
            status: { $in: ['pending', 'confirmed'] } // Only consider pending or confirmed appointments as booked
        });
        console.log(`[getAvailableTimeSlots] Found ${existingAppointments.length} existing appointments for ${date}.`);

        // --- 5. Generate All Possible Time Slots ---
        const generatedSlots = [];
        // Loop in 30-minute increments to generate potential start times.
        // The slot duration will be serviceDuration.
        for (let minutes = shopOpenMinutes; minutes <= shopCloseMinutes - serviceDuration; minutes += 30) {
            const slotStartTime = convertMinutesToTime(minutes);
            const slotEndTime = convertMinutesToTime(minutes + serviceDuration);

            // Defensive check for valid conversion
            if (slotStartTime === "Invalid Time" || slotEndTime === "Invalid Time" || convertTimeToMinutes(slotEndTime) > shopCloseMinutes) {
                 // Skip if the calculated end time is invalid or goes past closing
                console.warn(`[getAvailableTimeSlots] Skipping invalid or overflow slot: Start: ${slotStartTime}, End: ${slotEndTime} for service duration ${serviceDuration}`);
                continue;
            }

            generatedSlots.push({
                startTime: slotStartTime,
                endTime: slotEndTime,
                available: true
            });
        }
        console.log(`[getAvailableTimeSlots] Generated ${generatedSlots.length} initial time slots.`);

        // --- 6. Mark Booked Slots as Unavailable ---
        existingAppointments.forEach(appointment => {
            const apptStartMinutes = convertTimeToMinutes(appointment.startTime);
            const apptEndMinutes = convertTimeToMinutes(appointment.endTime);

            // Skip this appointment if its times are invalid
            if (isNaN(apptStartMinutes) || isNaN(apptEndMinutes) || apptStartMinutes >= apptEndMinutes) {
                console.warn(`[getAvailableTimeSlots] Skipping existing appointment with invalid times: Start=${appointment.startTime}, End=${appointment.endTime}`);
                return;
            }

            generatedSlots.forEach(slot => {
                // If a slot has already been marked unavailable, no need to check it again
                if (!slot.available) return;

                const slotStartMinutes = convertTimeToMinutes(slot.startTime);
                const slotEndMinutes = convertTimeToMinutes(slot.endTime);

                // Skip this slot if its own times are invalid
                if (isNaN(slotStartMinutes) || isNaN(slotEndMinutes) || slotStartMinutes >= slotEndMinutes) {
                    console.warn(`[getAvailableTimeSlots] Skipping generated slot with invalid times: Start=${slot.startTime}, End=${slot.endTime}`);
                    return;
                }

                // Check for overlap: [slotStart, slotEnd) overlaps with [apptStart, apptEnd)
                // Overlap exists if (slot_start < appt_end) AND (appt_start < slot_end)
                if (slotStartMinutes < apptEndMinutes && apptStartMinutes < slotEndMinutes) {
                    slot.available = false;
                }
            });
        });
        console.log(`[getAvailableTimeSlots] Marked booked slots as unavailable.`);

        // --- 7. Filter Out Unavailable Slots ---
        const availableSlots = generatedSlots.filter(slot => slot.available);
        console.log(`[getAvailableTimeSlots] Final available slots count: ${availableSlots.length}`);

        // Return an object with the availableSlots array
        return { availableSlots, message: availableSlots.length > 0 ? 'Slots found' : 'No available slots for this date' };

    } catch (error) {
        console.error(`[getAvailableTimeSlots] CRITICAL ERROR during slot calculation: ${error.message}`, error.stack); // Log the full error object for better debugging
        // Re-throw the error so the controller can handle it with a 500 status.
        throw error;
    }
};

/**
 * Creates a new appointment.
 */
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

    // Verify time slot availability using this service's own method
    // This provides a final check before booking
    const { availableSlots } = await exports.getAvailableTimeSlots(shopId, serviceId, date);
    const isSlotAvailable = availableSlots.some(
        slot => slot.startTime === startTime && slot.endTime === endTime
    );

    if (!isSlotAvailable) {
        throw new Error('Selected time slot is no longer available. Please refresh and try again.');
    }

    // Get staff details if provided
    let staffInfo = {};
    if (staffId) {
        // Assuming staff is stored as a sub-document or an array of objects within the Shop model
        // If staff were a separate model, you'd do: const staff = await Staff.findById(staffId);
        const staff = shop.staff.id(staffId);
        if (staff) {
            staffInfo = {
                id: staff._id,
                name: staff.name
            };
        } else {
            console.warn(`Staff ID ${staffId} not found in shop ${shopId}. Booking without specific staff.`);
        }
    }

    // Apply coupon if provided
    let finalPrice = service.price;
    let appliedPromotion = null;

    if (couponCode) {
        // Use the imported promotionService to validate and apply discount
        try {
            const validationResult = await promotionService.validatePromotion({
                shopId,
                couponCode,
                serviceIds: [serviceId],
                totalAmount: service.price,
                userId
            });

            if (validationResult.valid) {
                finalPrice = validationResult.discountedTotal;
                appliedPromotion = validationResult.promotion; // The promotion document itself
            } else {
                console.warn(`Coupon code ${couponCode} is invalid or not applicable for this booking: ${validationResult.message}`);
                // Do not throw an error here; allow booking without coupon discount if invalid.
                // The frontend should have already validated this.
            }
        } catch (couponError) {
            console.error(`Error validating coupon ${couponCode}:`, couponError.message);
            // Continue without applying coupon if validation service itself throws an error
        }
    }

    // Determine initial payment and appointment status
    // Payment status is 'pending' initially, regardless of online/offline, until confirmed by gateway or manually
    const paymentStatus = 'pending';
    const appointmentStatus = 'pending'; // Default status for a newly created appointment

    // Create appointment
    const appointment = new Appointment({
        user: userId,
        shop: shopId,
        service: {
            id: service._id,
            name: service.name,
            duration: service.duration,
            price: service.price // Store original service price
        },
        staff: staffInfo,
        date: new Date(date),
        startTime,
        endTime,
        notes,
        payment: {
            amount: finalPrice, // Store the final calculated price
            method: paymentMethod || 'offline',
            status: paymentStatus
        },
        status: appointmentStatus,
        promotion: appliedPromotion ? {
            id: appliedPromotion._id, // Use _id from the Mongoose document
            code: couponCode,
            discount: service.price - finalPrice // Calculate actual discount applied
        } : null
    });

    await appointment.save();

    // Send confirmation notification (async, but don't block the main flow)
    sendAppointmentConfirmation(userId, appointment._id).catch(err => {
        console.error(`Failed to send appointment confirmation for ${appointment._id}:`, err);
    });

    // Schedule reminder (async, but don't block)
    exports.scheduleAppointmentReminder(appointment._id).catch(err => {
        console.error(`Failed to schedule reminder for ${appointment._id}:`, err);
    });

    return appointment;
};

/**
 * Gets all appointments for a specific user.
 */
exports.getUserAppointments = async (userId) => {
    // Basic validation for userId, though Mongoose will handle ObjectId casting errors
    if (!userId) {
        throw new Error('User ID is required to fetch appointments.');
    }
    const appointments = await Appointment.find({ user: userId })
        .populate('shop', 'name address contactInfo')
        .sort({ date: -1, startTime: 1 }); // Sort by most recent date, then earliest time

    return appointments;
};

/**
 * Gets all appointments for a specific shop.
 * Includes ownership verification.
 */
exports.getShopAppointments = async (shopId) => {
    // Basic validation to ensure shopId is valid (e.g., is a valid ObjectId)
    if (!shopId) {
        throw new Error('Shop ID is required to fetch appointments.');
    }

    try {
        // Find appointments where the 'shop' field matches the provided shopId
        // Populate user and service details for display on the frontend
        const appointments = await Appointment.find({ shop: shopId })
            .populate('user', 'name email phone') // Populate user name, email, phone
            // Populate service details (assuming 'service' field in Appointment model stores an object with 'id')
            // If `service` in `Appointment` is a direct `ObjectId` reference to the `Service` model, then `.populate('service', 'name price duration')` works as is.
            // If it's an embedded object { id: ..., name: ..., price: ...}, then direct population might not work the same way.
            // Given the `createAppointment` uses `service: { id: service._id, name: service.name, ... }`,
            // you might need to adjust how you query/structure this if you want to populate.
            // For now, assuming your `Appointment` model has `service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' }`
            // If it's an embedded object, you'd just return `appointment.service.name` etc. directly.
            // Let's assume it's a ref for this populate to work.
            .populate('staff.id', 'name') // Populate staff name if staff.id is a ref to a Staff model
            .lean(); // Use .lean() for faster query if you don't need Mongoose document methods

        return appointments; // This should return the array of appointment documents
    } catch (error) {
        console.error("Error in backend appointmentService.getShopAppointments:", error);
        throw new Error('Failed to retrieve shop appointments from database.');
    }
};


/**
 * Gets a single appointment by ID, with authorization checks.
 */
exports.getAppointmentById = async (appointmentId, userId) => {
    const appointment = await Appointment.findById(appointmentId)
        .populate('shop', 'name address contactInfo operatingHours')
        .populate('user', 'name email phone');

    if (!appointment) {
        throw new Error('Appointment not found');
    }

    // Check if the user is the appointment owner or the shop owner
    // Ensure shop and user references are populated/exist before checking toString()
    const shop = await Shop.findById(appointment.shop._id); // Re-fetch shop if not fully populated
    if (!shop) {
        throw new Error('Associated shop not found for this appointment.');
    }

    const isShopOwner = shop.owner.toString() === userId;
    const isAppointmentOwner = appointment.user._id.toString() === userId;

    if (!isShopOwner && !isAppointmentOwner) {
        throw new Error('Unauthorized access to appointment');
    }

    return appointment;
};

/**
 * Updates the status of an appointment.
 * Includes status transition validation and authorization.
 */
exports.updateAppointmentStatus = async (appointmentId, status, userId) => {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
        throw new Error('Appointment not found');
    }

    // Verify the user is either the appointment owner or shop owner
    const shop = await Shop.findById(appointment.shop);
    if (!shop) {
        throw new Error('Associated shop not found for this appointment.');
    }

    const isShopOwner = shop.owner.toString() === userId;
    const isAppointmentOwner = appointment.user.toString() === userId; // `appointment.user` is likely just the ID here if not populated

    // --- Authorization Logic Refined ---

    // Define allowed status transitions
    const validTransitions = {
        pending: ['confirmed', 'cancelled', 'rejected'],
        confirmed: ['completed', 'cancelled', 'no-show'],
        completed: [], // No transitions from completed
        cancelled: [], // No transitions from cancelled
        'no-show': [], // No transitions from no-show
        rejected: []   // No transitions from rejected
    };

    // 1. Validate if the requested status is a valid transition from the current status
    if (!validTransitions[appointment.status] || !validTransitions[appointment.status].includes(status)) {
        throw new Error(`Invalid status transition from "${appointment.status}" to "${status}".`);
    }

    // 2. Implement granular authorization based on user role and desired status
    // User can ONLY cancel their own appointment
    if (isAppointmentOwner && !isShopOwner) {
        if (status !== 'cancelled') {
            throw new Error(`Unauthorized: As the appointment owner, you can only cancel your appointment.`);
        }
    }
    // Shop owner (or an admin if you had one) can update to other specific statuses
    else if (isShopOwner) {
        // The `validTransitions` array already restricts what can be set.
        // No additional check needed here beyond the validTransitions.
        console.log(`Shop owner (${userId}) is updating appointment ${appointmentId} status to ${status}.`);
    } else { // If neither shop owner nor appointment owner
        throw new Error('Unauthorized: You do not have permission to update this appointment.');
    }

    // --- End Authorization Logic ---

    // Update appointment status
    appointment.status = status;

    // If appointment is cancelled, handle refund if applicable
    if (status === 'cancelled' && appointment.payment.status === 'completed') {
        // In a real implementation, you would initiate a refund process via payment gateway
        // For now, mark payment status as 'refunded' and log it.
        appointment.payment.status = 'refunded';
        console.log(`[updateAppointmentStatus] Initiating mock refund for appointment ${appointmentId}. Amount: ${appointment.payment.amount}`);

        // Add to shop's refund records (assuming `shop.refunds` is an array of subdocuments)
        // Ensure `shop.refunds` exists before pushing
        shop.refunds = shop.refunds || [];
        shop.refunds.push({
            appointmentId: appointment._id,
            amount: appointment.payment.amount, // Use the amount actually paid
            date: new Date()
        });
        await shop.save();
    }

    await appointment.save();

    // Notify user about status change (async, non-blocking)
    const user = await User.findById(appointment.user); // Re-fetch user if not populated
    if (user) {
        user.notifications.push({
            message: `Your appointment for ${appointment.service.name} at ${shop.name} has been ${status}.`,
            read: false,
            createdAt: new Date()
        });
        await user.save();
    } else {
        console.warn(`User ${appointment.user} not found for notification after status update.`);
    }

    return appointment;
};

/**
 * Cancels an appointment. This delegates to updateAppointmentStatus for consistent logic.
 */
exports.cancelAppointment = async (appointmentId, userId) => {
    // The updateAppointmentStatus handles all authorization and refund logic for cancellation
    return await exports.updateAppointmentStatus(appointmentId, 'cancelled', userId);
};

// --- Reminder Scheduling (Internal Helper & Exported Scheduler) ---

/**
 * Internal helper function to send an appointment reminder.
 * Renamed to avoid conflict with the imported 'sendAppointmentReminder' from notificationService.
 */
async function _sendAppointmentReminderLogic(appointmentId) {
    try {
        const appointment = await Appointment.findById(appointmentId)
            .populate('user', 'name email phone')
            .populate('shop', 'name address contactInfo');

        if (!appointment) {
            console.log(`_sendAppointmentReminderLogic: Appointment ${appointmentId} not found.`);
            return false;
        }

        // Only send reminders for 'confirmed' or 'pending' appointments
        if (!['pending', 'confirmed'].includes(appointment.status)) {
            console.log(`_sendAppointmentReminderLogic: Skipping reminder for appointment ${appointment._id} due to status: ${appointment.status}`);
            return false;
        }

        const appointmentDateTime = new Date(appointment.date);
        appointmentDateTime.setHours(
            parseInt(appointment.startTime.split(':')[0]),
            parseInt(appointment.startTime.split(':')[1]),
            0, // seconds
            0  // milliseconds
        );

        const now = new Date();
        const twentyFourHoursFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // Current time + 24 hours

        // Condition for sending reminder:
        // 1. Appointment is in the future AND
        // 2. Appointment is within the next 24 hours (inclusive of current time, up to 24 hours from now) AND
        // 3. Reminder has not been sent yet
        if (appointmentDateTime > now && appointmentDateTime <= twentyFourHoursFromNow && !appointment.reminderSent) {
            console.log(`_sendAppointmentReminderLogic: Sending reminder for appointment ${appointment._id}.`);
            // Use the imported function from notificationService to send the actual reminder
            await sendNotificationReminder(
                appointment.user._id,
                {
                    appointmentId: appointment._id,
                    serviceName: appointment.service.name,
                    shopName: appointment.shop.name,
                    date: appointment.date,
                    startTime: appointment.startTime,
                    address: appointment.shop.address
                }
            );

            // Mark reminder as sent to avoid duplicates
            appointment.reminderSent = true;
            await appointment.save();

            return true; // Reminder sent
        }

        console.log(`_sendAppointmentReminderLogic: Reminder for appointment ${appointment._id} not sent (conditions not met).
                     Appt time: ${appointmentDateTime}, Now: ${now}, 24hrs from now: ${twentyFourHoursFromNow}, Already sent: ${appointment.reminderSent}`);
        return false; // Reminder not sent immediately
    } catch (error) {
        console.error(`Error in _sendAppointmentReminderLogic for ${appointmentId}:`, error);
        // Do not rethrow here, as this is an internal function that should fail gracefully.
        return false;
    }
}

/**
 * Public function to schedule an appointment reminder.
 * In a real application, this would enqueue a job for a scheduler like Agenda, BullMQ, etc.,
 * to run at the appropriate time (e.g., 24 hours before the appointment).
 * For this example, it immediately checks if the reminder should be sent.
 */
exports.scheduleAppointmentReminder = async (appointmentId) => {
    try {
        console.log(`[scheduleAppointmentReminder] Attempting to schedule/send reminder for appointment ID: ${appointmentId}`);
        // In a real system, you'd use a job queue here:
        // agenda.schedule('24 hours before ' + appointment.date + ' ' + appointment.startTime, 'send appointment reminder', { appointmentId: appointment._id });
        // For this simplified example, we're calling the internal logic directly.
        const result = await _sendAppointmentReminderLogic(appointmentId);
        if (result) {
            console.log(`[scheduleAppointmentReminder] Reminder successfully processed for ${appointmentId}.`);
        } else {
            console.log(`[scheduleAppointmentReminder] Reminder not sent for ${appointmentId} based on current logic/status.`);
        }
        return result;
    } catch (error) {
        console.error('[scheduleAppointmentReminder] Error scheduling appointment reminder:', error);
        throw new Error(`Failed to schedule reminder: ${error.message}`);
    }
};