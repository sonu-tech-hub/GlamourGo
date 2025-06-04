
// server/routes/galleryRoutes.js
const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const { auth, shopOwner } = require('../middlewares/authMiddleware');
const multer = require('multer');

// Middleware for handling multiple image uploads
const uploadMultiple = galleryController.upload;

// Middleware for handling single image upload (for updating)
const uploadSingle = multer({
    storage: galleryController.upload.storage,
    fileFilter: galleryController.upload.fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
}).single('image'); // Expecting a single field named 'image'

// Routes for adding gallery items (protected by auth and shopOwner)
router.post('/shops/:shopId', auth, shopOwner, uploadMultiple, galleryController.addGalleryItems);

// Public route to get the gallery for a specific shop (with optional category filter)
router.get('/shops/:shopId', galleryController.getShopGallery);

// Routes for updating a specific gallery item (protected by auth and shopOwner)
router.put('/:itemId', auth, shopOwner, uploadSingle, galleryController.updateGalleryItem);

// Routes for deleting a specific gallery item (protected by auth and shopOwner)
router.delete('/:itemId', auth, shopOwner, galleryController.deleteGalleryItem);

// Public route to get featured gallery items for a specific shop
router.get('/shops/:shopId/featured', galleryController.getFeaturedGallery);

module.exports = router;