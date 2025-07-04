// server/services/galleryService.js
const GalleryItem = require("../models/GalleryItem");
const Shop = require("../models/Shop");

class ApiError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

exports.addGalleryItemsToShop = async (shopId, newGalleryItemsData) => {
    const shop = await Shop.findById(shopId);

    if (!shop) {
        throw new ApiError("Shop not found", 404);
    }

    const createdGalleryItems = [];
    const shopGalleryUpdates = [];

    for (const itemData of newGalleryItemsData) {
        const galleryItem = new GalleryItem({
            shop: shopId,
            title: itemData.title,
            description: itemData.description,
            imageUrl: itemData.imageUrl,
            publicId: itemData.publicId,
            category: itemData.category,
            tags: itemData.tags,
            featured: itemData.featured,
            owner: itemData.owner
        });

        await galleryItem.save();
        createdGalleryItems.push(galleryItem);

        shopGalleryUpdates.push({
            url: itemData.imageUrl,
            caption: itemData.title,
        });
    }

    shop.gallery.push(...shopGalleryUpdates);
    await shop.save();

    return createdGalleryItems;
};

exports.getShopGallery = async (shopId, category) => {
    let query = { shop: shopId };

    if (category) {
        query.category = category;
    }

    try {
        const galleryItems = await GalleryItem.find(query).sort({
            featured: -1,
            createdAt: -1,
        });
        const categories = await GalleryItem.distinct("category", { shop: shopId });

        return { galleryItems, categories };
    } catch (error) {
        console.error(
            `[galleryService] Error fetching gallery for shopId ${shopId}:`,
            error
        );
        throw new ApiError(`Failed to fetch gallery items: ${error.message}`, 500);
    }
};

exports.getGalleryItemById = async (itemId) => {
    const galleryItem = await GalleryItem.findById(itemId);
    return galleryItem;
};

exports.updateGalleryItem = async (itemId, ownerId, updateData) => {
    const galleryItem = await GalleryItem.findById(itemId);

    if (!galleryItem) {
        throw new ApiError("Gallery item not found", 404);
    }

    const shop = await Shop.findById(galleryItem.shop);

    if (!shop || shop.owner.toString() !== ownerId.toString()) {
        throw new ApiError("Unauthorized: You are not the owner of this shop", 403);
    }

    if (updateData.imageUrl && updateData.publicId) {
        const oldImageUrl = galleryItem.imageUrl;
        galleryItem.imageUrl = updateData.imageUrl;
        galleryItem.publicId = updateData.publicId;

        const galleryIndex = shop.gallery.findIndex((g) => g.url === oldImageUrl);
        if (galleryIndex !== -1) {
            shop.gallery[galleryIndex].url = updateData.imageUrl;
            shop.gallery[galleryIndex].caption = updateData.title || galleryItem.title;
        } else {
            shop.gallery.push({
                url: updateData.imageUrl,
                caption: updateData.title || galleryItem.title,
            });
        }
    }

    if (updateData.title !== undefined) galleryItem.title = updateData.title;
    if (updateData.description !== undefined) galleryItem.description = updateData.description;
    if (updateData.category !== undefined) galleryItem.category = updateData.category;
    if (updateData.tags !== undefined) galleryItem.tags = updateData.tags;
    if (updateData.featured !== undefined) galleryItem.featured = updateData.featured;

    await galleryItem.save();
    await shop.save();

    return galleryItem;
};

exports.deleteGalleryItem = async (itemId, ownerId) => {
    const galleryItem = await GalleryItem.findById(itemId);

    if (!galleryItem) {
        throw new ApiError("Gallery item not found", 404);
    }

    const shop = await Shop.findById(galleryItem.shop);

    if (!shop || shop.owner.toString() !== ownerId.toString()) {
        throw new ApiError("Unauthorized: You are not the owner of this shop", 403);
    }

    shop.gallery = shop.gallery.filter((g) => g.url !== galleryItem.imageUrl);
    await shop.save();

    await GalleryItem.findByIdAndDelete(itemId);

    return { success: true };
};

exports.getFeaturedGallery = async (shopId, limit) => {
    const featuredItems = await GalleryItem.find({
        shop: shopId,
        featured: true,
    })
        .sort({ createdAt: -1 })
        .limit(Number(limit));

    return featuredItems;
};