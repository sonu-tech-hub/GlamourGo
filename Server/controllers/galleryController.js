// server/controllers/galleryController.js
const galleryService = require('../services/galleryService');
const multer = require('multer');
const path = require('path');

// Set up multer storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/gallery/');
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `gallery-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Upload middleware
exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
}).array('images', 5); // Allow up to 5 images

// Add gallery items
exports.addGalleryItems = async (req, res) => {
  try {
    const { shopId } = req.params;
    const ownerId = req.user._id;
    const { title, description, category, tags, featured } = req.body;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }
    
    const imageFiles = req.files.map(file => ({
      filename: file.filename,
      path: file.path,
      mimetype: file.mimetype
    }));
    
    const galleryItems = await galleryService.addGalleryItems({
      shopId,
      ownerId,
      title,
      description,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      featured: featured === 'true',
      imageFiles
    });
    
    res.status(201).json({
      message: 'Gallery items added successfully',
      galleryItems
    });
  } catch (error) {
    console.error('Error adding gallery items:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get shop gallery
exports.getShopGallery = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { category } = req.query;
    
    const gallery = await galleryService.getShopGallery(shopId, category);
    
    res.json(gallery);
  } catch (error) {
    console.error('Error fetching shop gallery:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update gallery item
exports.updateGalleryItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const ownerId = req.user._id;
    const { title, description, category, tags, featured } = req.body;
    
    // Handle file upload if included
    let imageFile = null;
    if (req.file) {
      imageFile = {
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype
      };
    }
    
    const galleryItem = await galleryService.updateGalleryItem({
      itemId,
      ownerId,
      title,
      description,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      featured: featured === 'true',
      imageFile
    });
    
    res.json({
      message: 'Gallery item updated successfully',
      galleryItem
    });
  } catch (error) {
    console.error('Error updating gallery item:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete gallery item
exports.deleteGalleryItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const ownerId = req.user._id;
    
    await galleryService.deleteGalleryItem(itemId, ownerId);
    
    res.json({
      message: 'Gallery item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get featured gallery items
exports.getFeaturedGallery = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { limit = 10 } = req.query;
    
    const featuredItems = await galleryService.getFeaturedGallery(shopId, limit);
    
    res.json({
      featuredItems
    });
  } catch (error) {
    console.error('Error fetching featured gallery:', error);
    res.status(400).json({ message: error.message });
  }
};