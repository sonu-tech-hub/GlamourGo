// routes/appointment.js
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { auth, shopOwner } = require('../middlewares/auth');

router.post('/', auth, appointmentController.createAppointment);
router.get('/user', auth, appointmentController.getUserAppointments);
router.get('/shop/:shopId', auth, shopOwner, appointmentController.getShopAppointments);
router.get('/available-slots', appointmentController.getAvailableTimeSlots);
router.get('/:appointmentId', auth, appointmentController.getAppointmentById);
router.put('/:appointmentId/status', auth, appointmentController.updateAppointmentStatus);
router.delete('/:appointmentId', auth, appointmentController.cancelAppointment);

module.exports = router;
