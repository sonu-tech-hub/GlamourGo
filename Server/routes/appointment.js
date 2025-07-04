// routes/appointment.js
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { auth, shopOwner } = require('../middlewares/authMiddleware');

// Public routes (if any, though generally appointments require auth)
// router.get('/public-slots', appointmentController.getPublicAvailableTimeSlots); // Example if unauthenticated access was allowed

// Authenticated routes
router.post('/', auth, appointmentController.createAppointment);

router.get('/user', auth, appointmentController.getUserAppointments);

router.get('/shop/:shopId', auth, shopOwner, appointmentController.getShopAppointments);

router.get('/available-slots', auth, appointmentController.getAvailableTimeSlots);

// GET /api/appointments/:appointmentId
// Authorization (user owns appointment OR user owns shop) is handled within the controller/service
router.get('/:appointmentId', auth, appointmentController.getAppointmentById);


router.put('/:appointmentId/status', auth, appointmentController.updateAppointmentStatus);


router.put('/:appointmentId/cancel', auth, appointmentController.cancelAppointment); // 'PUT' for status change

// router.delete('/:appointmentId', auth, shopOwner, appointmentController.deleteAppointment); // For hard deletion

module.exports = router;