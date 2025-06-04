// routes/appointment.js
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { auth, shopOwner } = require('../middlewares/authMiddleware');

router.post('/', auth, appointmentController.createAppointment);
router.get('/user', auth, appointmentController.getUserAppointments);
router.get('/shop/:shopId', auth, shopOwner, appointmentController.getShopAppointments);
router.get('/available-slots',auth, appointmentController.getAvailableTimeSlots);
router.get('/:appointmentId', auth, shopOwner,appointmentController.getAppointmentById);
router.put('/:appointmentId/status', auth,shopOwner, appointmentController.updateAppointmentStatus);
router.delete('/:appointmentId', auth, shopOwner,appointmentController.cancelAppointment);

module.exports = router;

