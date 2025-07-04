// backend/controllers/galleryController.js

const galleryService = require("../services/galleryService");
const multer = require("multer");
const cloudinary = require("../config/cloudinaryConfig");
const asyncHandler = require('express-async-handler');

// --- Multer Configuration for Cloudinary (Memory Storage) ---
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("INVALID_FILE_TYPE: Only image files (JPEG, JPG, PNG, GIF) are allowed!"), false);
    }
};

exports.uploadMultiple = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
}).array("images", 5);

exports.uploadSingle = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
}).single("image");

// --- Controller Functions ---

exports.addGalleryItems = asyncHandler(async (req, res) => {
    const { shopId } = req.params;
    const ownerId = req.user._id;
    const { title, description, category, tags, featured } = req.body;

    if (!req.files || req.files.length === 0) {
        res.status(400);
        throw new Error("No images uploaded. Please select at least one image.");
    }

    const newGalleryItemsData = [];
    for (const file of req.files) {
        try {
            const result = await cloudinary.uploader.upload(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`, {
                folder: 'gallery',
            });
            newGalleryItemsData.push({
                imageUrl: result.secure_url,
                publicId: result.public_id,
                title: title || 'Untitled',
                description: description || '',
                category: category || 'Uncategorized',
                tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
                featured: featured === "true",
                owner: ownerId
            });
        } catch (uploadError) {
            console.error("Cloudinary upload error:", uploadError);
            res.status(500);
            throw new Error(`Failed to upload image to Cloudinary: ${uploadError.message}`);
        }
    }

    const galleryItemsResponse = await galleryService.addGalleryItemsToShop(shopId, newGalleryItemsData);

    res.status(201).json({
        message: "Gallery items added successfully",
        galleryItems: galleryItemsResponse,
    });
});

exports.getShopGallery = asyncHandler(async (req, res) => {
    const { shopId } = req.params;
    const { category } = req.query;

    const gallery = await galleryService.getShopGallery(shopId, category);

    res.json(gallery);
});

exports.updateGalleryItem = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const ownerId = req.user._id;
    const { title, description, category, tags, featured } = req.body;

    let updateData = {
        title,
        description,
        category,
        tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
        featured: featured === "true",
        owner: ownerId,
    };

    if (req.file) {
        try {
            const currentItem = await galleryService.getGalleryItemById(itemId);
            if (!currentItem) {
                res.status(404);
                throw new Error("Gallery item not found for update.");
            }

            if (currentItem.publicId) {
                await cloudinary.uploader.destroy(currentItem.publicId);
                console.log(`Cloudinary: Old image ${currentItem.publicId} deleted.`);
            }

            const result = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, {
                folder: 'gallery',
            });

            updateData.imageUrl = result.secure_url;
            updateData.publicId = result.public_id;

        } catch (uploadError) {
            console.error("Cloudinary update/upload error:", uploadError);
            res.status(500);
            throw new Error(`Failed to upload new image to Cloudinary: ${uploadError.message}`);
        }
    }

    const galleryItem = await galleryService.updateGalleryItem(itemId, ownerId, updateData);

    if (!galleryItem) {
        res.status(404);
        throw new Error("Failed to update gallery item, it might have been removed.");
    }

    res.json({
        message: "Gallery item updated successfully",
        galleryItem,
    });
});

exports.deleteGalleryItem = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const ownerId = req.user._id;

    // FIX: First, retrieve the gallery item to ensure it exists and get its publicId
    const galleryItem = await galleryService.getGalleryItemById(itemId);

    if (!galleryItem) {
        res.status(404);
        throw new Error("Gallery item not found.");
    }

    // If the item has a Cloudinary publicId, delete the image from Cloudinary
    if (galleryItem.publicId) {
        try {
            await cloudinary.uploader.destroy(galleryItem.publicId);
            console.log(`Cloudinary: Old image ${galleryItem.publicId} deleted.`);
        } catch (cloudinaryError) {
            console.error("Error deleting image from Cloudinary:", cloudinaryError);
        }
    }

    await galleryService.deleteGalleryItem(itemId, ownerId);

    res.json({
        message: "Gallery item deleted successfully",
    });
});

exports.getFeaturedGallery = asyncHandler(async (req, res) => {
    const { shopId } = req.params;
    const { limit = 10 } = req.query;

    const featuredItems = await galleryService.getFeaturedGallery(
        shopId,
        limit
    );

    res.json({
        featuredItems,
    });
});