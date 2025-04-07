// server/routes/index.js
const express = require('express');
const authRoutes = require('./auth');
const userRoutes = require('./user');
const shopRoutes = require('./shop');
const serviceRoutes = require('./service');
const appointmentRoutes = require('./appointment');
const reviewRoutes = require('./review');
const paymentRoutes = require('./payment');
const promotionRoutes = require('./promotion');
const adminRoutes = require('./admin');
const galleryRoutes = require('./gallery');

const router = express.Router();

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/shops', shopRoutes);
router.use('/services', serviceRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/payments', paymentRoutes);
router.use('/promotions', promotionRoutes);
router.use('/admin', adminRoutes);
router.use('/gallery', galleryRoutes);

module.exports = router;