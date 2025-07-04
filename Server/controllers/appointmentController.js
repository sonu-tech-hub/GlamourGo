// server/controllers/appointmentController.js
const appointmentService = require('../services/appointmentService'); // Import the service layer

/**
 * GET /api/appointments/available-slots
 * Checks available time slots for a given shop, service, and date.
 */
exports.getAvailableTimeSlots = async (req, res) => {
    try {
        const { shopId, serviceId, date } = req.query;

        // Basic input validation: check for presence.
        if (!shopId || !serviceId || !date) {
            return res.status(400).json({ message: 'Missing required query parameters: shopId, serviceId, and date.' });
        }

        const { availableSlots, message } = await appointmentService.getAvailableTimeSlots(shopId, serviceId, date);

        if (message) {
            // This case indicates shop is closed, which is an expected scenario, not an error.
            return res.json({ availableSlots, message });
        }

        res.json({ availableSlots });
    } catch (error) {
        console.error('Error in getAvailableTimeSlots controller:', error.message);
        // Differentiate errors for better client handling
        if (error.message.includes('Shop not found') || error.message.includes('Service not found')) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Failed to retrieve available time slots. Please try again later.' });
    }
};

/**
 * POST /api/appointments
 * Creates a new appointment.
 */
exports.createAppointment = async (req, res) => {
    try {
        const appointmentData = req.body;
        const userId = req.user.id; // Assuming req.user.id is populated by an authentication middleware

        // Basic validation for essential fields at the controller level
        if (!appointmentData.shopId || !appointmentData.serviceId || !appointmentData.date || !appointmentData.startTime || !appointmentData.endTime) {
            return res.status(400).json({ message: 'Missing required fields for appointment creation.' });
        }

        const newAppointment = await appointmentService.createAppointment(appointmentData, userId);

        res.status(201).json({
            message: 'Appointment booked successfully!',
            appointment: newAppointment
        });
    } catch (error) {
        console.error('Error in createAppointment controller:', error.message);
        // Differentiate errors for better client handling
        if (error.message.includes('Shop not found') || error.message.includes('Service not found') || error.message.includes('Selected time slot is not available')) {
            return res.status(400).json({ message: error.message }); // Bad request due to invalid input/slot
        }
        res.status(500).json({ message: 'Failed to book appointment. Please try again later.' });
    }
};

/**
 * GET /api/appointments/user
 * Gets all appointments for the authenticated user.
 */
exports.getUserAppointments = async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware
        const appointments = await appointmentService.getUserAppointments(userId);
        res.json(appointments);
    } catch (error) {
        console.error('Error in getUserAppointments controller:', error.message);
        res.status(500).json({ message: 'Failed to retrieve user appointments.' });
    }
};

/**
 * GET /api/shops/:shopId/appointments
 * Gets all appointments for a specific shop (requires shop owner authorization).
 */
exports.getShopAppointments = async (req, res) => {
    try {
        const shopId = req.params.shopId; // Get shopId from URL parameters

        // Basic validation for shopId
        if (!shopId) {
            return res.status(400).json({ message: 'Shop ID is required.' });
        }

        // Call your backend service to fetch appointments
        const appointments = await appointmentService.getShopAppointments(shopId);

        // *** THE CRITICAL FIX IS HERE ***
        // Ensure the response is wrapped in an object with the 'appointments' key
        return res.status(200).json({
            message: 'Shop appointments fetched successfully',
            appointments: appointments // Make sure the array is under 'appointments' key
        });

    } catch (error) {
        console.error("Error in getShopAppointments controller:", error);
        // Provide a more informative error message if possible
        return res.status(500).json({ message: error.message || 'Server error fetching shop appointments.' });
    }
};

/**
 * GET /api/appointments/:appointmentId
 * Gets a single appointment by ID (requires user/shop owner authorization).
 */
exports.getAppointmentById = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const userId = req.user.id; // From auth middleware, for authorization check in service

        const appointment = await appointmentService.getAppointmentById(appointmentId, userId);
        res.json(appointment);
    } catch (error) {
        console.error('Error in getAppointmentById controller:', error.message);
        if (error.message.includes('Appointment not found')) {
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes('Unauthorized')) {
            return res.status(403).json({ message: error.message }); // Forbidden
        }
        res.status(500).json({ message: 'Failed to retrieve appointment details.' });
    }
};

/**
 * PUT /api/appointments/:appointmentId/status
 * Updates the status of an appointment.
 */
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { status } = req.body;
        const userId = req.user.id; // From auth middleware, for authorization check in service

        // Basic status validation at controller level (allowed values)
        const allowedStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no-show', 'rejected'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid appointment status provided.' });
        }

        const updatedAppointment = await appointmentService.updateAppointmentStatus(appointmentId, status, userId);

        res.json({ message: 'Appointment status updated successfully.', appointment: updatedAppointment });
    } catch (error) {
        console.error('Error in updateAppointmentStatus controller:', error.message);
        if (error.message.includes('Appointment not found')) {
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes('Unauthorized') || error.message.includes('Cannot change status') || error.message.includes('Only the shop owner can mark appointments')) {
            // Specific errors from service indicate business rule violation or auth failure
            return res.status(403).json({ message: error.message }); // Forbidden
        }
        res.status(500).json({ message: 'Failed to update appointment status. Please try again later.' });
    }
};

/**
 * PUT /api/appointments/:appointmentId/cancel
 * Cancels an appointment. Delegates to updateAppointmentStatus in service.
 */
exports.cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const userId = req.user.id; // From auth middleware

        const cancelledAppointment = await appointmentService.cancelAppointment(appointmentId, userId);

        res.json({ message: 'Appointment cancelled successfully.', appointment: cancelledAppointment });
    } catch (error) {
        console.error('Error in cancelAppointment controller:', error.message);
        if (error.message.includes('Appointment not found')) {
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes('Unauthorized') || error.message.includes('Cannot change status')) {
            return res.status(403).json({ message: error.message }); // Forbidden
        }
        res.status(500).json({ message: 'Failed to cancel appointment. Please try again later.' });
    }
};