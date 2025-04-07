// server/services/galleryService.js
const GalleryItem = require('../models/GalleryItem');
const Shop = require('../models/Shop');
const fs = require('fs');
const path = require('path');

// Add gallery items
exports.addGalleryItems = async ({ shopId, ownerId, title, description, category, tags, featured, imageFiles }) => {
  // Verify shop ownership
  const shop = await Shop.findById(shopId);
  
  if (!shop) {
    throw new Error('Shop not found');
  }
  
  if (shop.owner.toString() !== ownerId.toString()) {
    throw new Error('Unauthorized: You are not the owner of this shop');
  }
  
  // Create gallery items for each image
  const galleryItems = [];
  
  for (const imageFile of imageFiles) {
    const imageUrl = `/uploads/gallery/${imageFile.filename}`;
    
    // Create gallery item
    const galleryItem = new GalleryItem({
      shop: shopId,
      title,
      description,
      imageUrl,
      category,
      tags,
      featured
    });
    
    await galleryItem.save();
    galleryItems.push(galleryItem);
    
    // Add to shop's gallery
    shop.gallery.push({
      url: imageUrl,
      caption: title
    });
  }
  
  await shop.save();
  
  return galleryItems;
};

// Get shop gallery
exports.getShopGallery = async (shopId, category) => {
  let query = { shop: shopId };
  
  if (category) {
    query.category = category;
  }
  
  // Fetch gallery items
  const galleryItems = await GalleryItem.find(query)
    .sort({ featured: -1, createdAt: -1 });
  
  // Get categories
  const categories = await GalleryItem.distinct('category', { shop: shopId });
  
  return { galleryItems, categories };
};

// Update gallery item
exports.updateGalleryItem = async ({ itemId, ownerId, title, description, category, tags, featured, imageFile }) => {
  const galleryItem = await GalleryItem.findById(itemId);
  
  if (!galleryItem) {
    throw new Error('Gallery item not found');
  }
  
  // Verify shop ownership
  const shop = await Shop.findById(galleryItem.shop);
  
  if (!shop || shop.owner.toString() !== ownerId.toString()) {
    throw new Error('Unauthorized: You are not the owner of this shop');
  }
  
  // Update fields
  if (title) galleryItem.title = title;
  if (description) galleryItem.description = description;
  if (category) galleryItem.category = category;
  if (tags) galleryItem.tags = tags;
  if (featured !== undefined) galleryItem.featured = featured;
  
  // Update image if provided
  if (imageFile) {
    // Delete old image
    const oldImagePath = path.join(__dirname, '..', galleryItem.imageUrl);
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }
    
    // Update with new image
    const imageUrl = `/uploads/gallery/${imageFile.filename}`;
    galleryItem.imageUrl = imageUrl;
    
    // Update in shop's gallery
    const galleryIndex = shop.gallery.findIndex(g => g.url === galleryItem.imageUrl);
    if (galleryIndex !== -1) {
      shop.gallery[galleryIndex].url = imageUrl;
      shop.gallery[galleryIndex].caption = title || galleryItem.title;
      await shop.save();
    }
  }
  
  await galleryItem.save();
  
  return galleryItem;
};

// Delete gallery item
exports.deleteGalleryItem = async (itemId, ownerId) => {
  const galleryItem = await GalleryItem.findById(itemId);
  
  if (!galleryItem) {
    throw new Error('Gallery item not found');
  }
  
  // Verify shop ownership
  const shop = await Shop.findById(galleryItem.shop);
  
  if (!shop || shop.owner.toString() !== ownerId.toString()) {
    throw new Error('Unauthorized: You are not the owner of this shop');
  }
  
  // Remove from shop's gallery
  shop.gallery = shop.gallery.filter(g => g.url !== galleryItem.imageUrl);
  await shop.save();
  
  // Delete the image file
  const imagePath = path.join(__dirname, '..', galleryItem.imageUrl);
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }
  
  // Delete the gallery item
  await GalleryItem.findByIdAndDelete(itemId);
  
  return { success: true };
};

// Get featured gallery items
exports.getFeaturedGallery = async (shopId, limit) => {
  const featuredItems = await GalleryItem.find({
    shop: shopId,
    featured: true
  })
  .sort({ createdAt: -1 })
  .limit(Number(limit));
  
  return featuredItems;
};