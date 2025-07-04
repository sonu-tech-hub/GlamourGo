import api from './api'; // Assuming 'api' is your configured Axios instance

/**
 * Adds one or more gallery items to a specific shop.
 * Intended for shop owners.
 * @param {string} shopId - The ID of the shop to add gallery items to (used in URL).
 * @param {FormData} formData - A FormData object containing:
 * - 'title', 'description', 'category', 'tags', 'featured'
 * - 'images': one or more File objects
 * - 'shop': string (MUST be appended to formData in the component as 'shop')
 * @returns {Promise<object>} A promise that resolves to the newly created gallery items.
 */
export const addGalleryItems = async (shopId, formData) => {
    // formData should already contain the 'shop' field (value = shopId), images, and other fields.
    // Axios will automatically set 'Content-Type': 'multipart/form-data'
    return api.post(`/gallery/shops/${shopId}`, formData);
};

/**
 * Gets all gallery items for a specific shop, with optional category filtering.
 * This route is public.
 * @param {string} shopId - The ID of the shop.
 * @param {string} [category] - Optional. The category to filter gallery items by.
 * @returns {Promise<object>} A promise that resolves to an object containing galleryItems and categories.
 */
export const getShopGallery = async (shopId, category) => {
    const params = category ? { params: { category } } : {};
    return api.get(`/gallery/shops/${shopId}`, params);
};

/**
 * Updates an existing gallery item.
 * Intended for shop owners.
 * @param {string} itemId - The ID of the gallery item to update.
 * @param {FormData} formData - A FormData object containing the updated data.
 * Can include 'title', 'description', 'category', 'tags', 'featured', and 'image' (single File object).
 * Crucially, it MUST also contain 'shop' appended within the FormData for backend authorization.
 * @returns {Promise<object>} A promise that resolves to the updated gallery item object.
 */
export const updateGalleryItem = async (itemId, formData) => { // ACCEPT FormData directly
    // formData should already contain the 'shop' field (value = shopId), image (if new), and other fields.
    // Axios will automatically set 'Content-Type': 'multipart/form-data'
    return api.put(`/gallery/${itemId}`, formData);
};

/**
 * Deletes a gallery item.
 * Intended for shop owners.
 * @param {string} itemId - The ID of the gallery item to delete.
 * @param {string} shopId - The ID of the shop the gallery item belongs to (sent as query param for backend validation).
 * @returns {Promise<object>} A promise that resolves to a success message.
 */
export const deleteGalleryItem = async (itemId, shopId) => {
    const response = await api.delete(`/gallery/${itemId}`, {
        params: { shopId }, // Correctly pass shopId as a query parameter
    });
    return response.data;
};

/**
 * Gets featured gallery items for a specific shop.
 * This route is public.
 * @param {string} shopId - The ID of the shop.
 * @param {number} [limit=10] - Optional. The maximum number of featured items to return.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of featured gallery items.
 */
export const getFeaturedGallery = async (shopId, limit = 10) => {
    const params = { params: { limit } };
    return api.get(`/gallery/shops/${shopId}/featured`, params);
};