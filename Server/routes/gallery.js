// server/routes/galleryRoutes.js
const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const { auth, shopOwner } = require('../middlewares/authMiddleware');

const uploadMultiple = galleryController.uploadMultiple;
const uploadSingle = galleryController.uploadSingle;

// Routes for adding gallery items
// Multer middleware runs first to process files and body. Then shopOwner has access to req.body.shop.
router.post('/shops/:shopId', auth, uploadMultiple, shopOwner, galleryController.addGalleryItems);

// Public route to get the gallery for a specific shop
router.get('/shops/:shopId', galleryController.getShopGallery);

// Routes for updating a specific gallery item
// Multer middleware runs first to process files and body. Then shopOwner has access to req.body.shop.
router.put('/:itemId', auth, uploadSingle, shopOwner, galleryController.updateGalleryItem);

// Routes for deleting a specific gallery item
// shopOwner needs req.query.shopId. Multer is not involved for DELETE.
router.delete('/:itemId', auth, shopOwner, galleryController.deleteGalleryItem);

// Public route to get featured gallery items for a specific shop
router.get('/shops/:shopId/featured', galleryController.getFeaturedGallery);

module.exports = router;