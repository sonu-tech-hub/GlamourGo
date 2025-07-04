import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { FaTimes, FaCamera, FaTag, FaCheckCircle, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';

// IMPORTANT: Renamed updateGalleryItem from service to avoid conflict with local function
import { addGalleryItems, updateGalleryItem as updateGalleryItemApi } from '../../services/galleryService'; // Renamed from galleryApi
import LoadingSpinner from '../common/LoadingSpinner';

const AddEditGalleryItemModal = ({
    isOpen,
    onClose,
    shopId, // shopId received as a prop
    onItemAddedOrUpdated,
    itemToEdit = null,
    existingCategories = [],
}) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        tags: '',
        featured: false,
        imageFiles: [], // For adding multiple images
        imageFile: null, // For editing a single image
    });

    const [previewImage, setPreviewImage] = useState(null);
    const [newCategory, setNewCategory] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localCategories, setLocalCategories] = useState([]);

    const isEditMode = !!itemToEdit;

    // Reset form data and preview image when modal opens or itemToEdit changes
    useEffect(() => {
        if (isEditMode) {
            setFormData({
                title: itemToEdit.title || '',
                description: itemToEdit.description || '',
                category: itemToEdit.category || '',
                tags: itemToEdit.tags?.join(', ') || '',
                featured: itemToEdit.featured || false,
                imageFiles: [], // Ensure this is empty in edit mode
                imageFile: null, // Reset imageFile for edit mode, it will only be set if user selects a new one
            });
            setPreviewImage(itemToEdit.imageUrl || null);
        } else {
            // Reset for add mode
            setFormData({
                title: '', description: '', category: '', tags: '', featured: false,
                imageFiles: [], imageFile: null,
            });
            setPreviewImage(null);
        }
        setLocalCategories([...new Set(existingCategories)]); // Initialize local categories from props
        setNewCategory('');
        setIsAddingCategory(false);
    }, [isOpen, itemToEdit, existingCategories, isEditMode]);

    // Cleanup for previewImage URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            if (previewImage && previewImage.startsWith('blob:')) {
                URL.revokeObjectURL(previewImage);
            }
        };
    }, [previewImage]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);

        // Revoke previous object URL if it exists to prevent memory leaks
        if (previewImage && previewImage.startsWith('blob:')) {
            URL.revokeObjectURL(previewImage);
        }

        if (isEditMode) {
            const file = files[0] || null;
            setFormData((prev) => ({ ...prev, imageFile: file }));
            // If a new file is selected, preview it. Otherwise, keep the existing imageUrl.
            setPreviewImage(file ? URL.createObjectURL(file) : (itemToEdit?.imageUrl || null));
        } else {
            setFormData((prev) => ({ ...prev, imageFiles: files }));
            if (files.length > 0) {
                setPreviewImage(URL.createObjectURL(files[0])); // Show preview of the first selected image
            } else {
                setPreviewImage(null); // No files selected, clear preview
            }
        }
    };

    const addNewCategory = () => {
        if (!newCategory.trim()) {
            return toast.error('Please enter a category name');
        }
        const trimmedCategory = newCategory.trim();
        if (!localCategories.includes(trimmedCategory)) {
            setLocalCategories((prev) => [...prev, trimmedCategory]);
            setFormData((prev) => ({ ...prev, category: trimmedCategory })); // Auto-select new category
            toast.success(`Category "${trimmedCategory}" added.`);
        } else {
            toast.error('Category already exists.');
        }
        setNewCategory('');
        setIsAddingCategory(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic Validations
        if (!formData.title.trim()) {
            return toast.error('Please enter a title for the gallery item.');
        }
        if (!formData.category.trim()) {
            return toast.error('Please select or add a category.');
        }

        // Image validation based on mode
        if (isEditMode) {
            // In edit mode, an image is only required if there was NO existing image AND NO new file selected
            if (!formData.imageFile && !itemToEdit.imageUrl) {
                return toast.error('Please select an image to update or ensure an existing image is present.');
            }
        } else {
            // In add mode, at least one image file is required.
            if (formData.imageFiles.length === 0) {
                return toast.error('Please select at least one image to upload.');
            }
        }

        setIsSubmitting(true);
        try {
            const formUploadData = new FormData();
            formUploadData.append('title', formData.title);
            formUploadData.append('description', formData.description);
            formUploadData.append('category', formData.category);
            formUploadData.append('tags', formData.tags); // Tags are sent as a comma-separated string
            formUploadData.append('featured', String(formData.featured));
            // CRITICAL: Append shopId to the FormData for backend access, using 'shop' field name
            // This is used by the shopOwner middleware on the backend
            formUploadData.append('shop', shopId);

            // Log FormData contents for debugging
            console.log('Sending FormData:');
            for (let [key, value] of formUploadData.entries()) {
                if (value instanceof File) {
                    console.log(`${key}: File Name - ${value.name}, Size - ${value.size} bytes, Type - ${value.type}`);
                } else {
                    console.log(`${key}: ${value}`);
                }
            }

            if (isEditMode) {
                if (formData.imageFile) {
                    formUploadData.append('image', formData.imageFile); // 'image' is the field name for single file update
                }
                // Corrected call: Pass itemId and then the FormData object directly
                await updateGalleryItemApi(itemToEdit._id, formUploadData);
                toast.success('Gallery item updated successfully!');
            } else {
                formData.imageFiles.forEach((file) => {
                    formUploadData.append('images', file); // 'images' is the field name for multiple files addition
                });
                await addGalleryItems(shopId, formUploadData); // shopId is in URL, formUploadData has 'shop' field
                toast.success('Gallery item added successfully!');
            }

            onClose();
            onItemAddedOrUpdated(); // Refresh gallery in parent component
        } catch (error) {
            console.error('Error submitting gallery item:', error);

            if (error.response) {
                console.error('Backend error response:', error.response.data);
                toast.error(error.response.data.message || 'Failed to save gallery item. Please check the form.');
            } else {
                toast.error('Network error or server unreachable. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-[#a38772]">
                        {isEditMode ? 'Edit Gallery Item' : 'Add New Gallery Item'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none">
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {/* Image Upload/Preview */}
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">
                            {isEditMode ? 'Change Image (Optional)' : 'Upload Images*'}
                        </label>
                        <input
                            type="file"
                            id="imageUpload"
                            name="imageUpload"
                            onChange={handleFileChange}
                            accept="image/jpeg, image/jpg, image/png, image/gif" // Specific accepted types
                            multiple={!isEditMode} // Allow multiple files only in add mode
                            className="w-full text-gray-700 border border-gray-300 rounded-lg p-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#fef4ea] file:text-[#d0a189] hover:file:bg-[#ecdfcf]"
                        />
                        {previewImage && (
                            <div className="mt-4 flex justify-center items-center h-48 bg-gray-100 rounded-lg overflow-hidden">
                                <img src={previewImage} alt="Image Preview" className="max-w-full max-h-full object-contain" />
                            </div>
                        )}
                        {formData.imageFiles.length > 1 && !isEditMode && (
                            <p className="text-sm text-gray-500 mt-2">
                                Uploading {formData.imageFiles.length} images. Preview shows the first one.
                            </p>
                        )}
                        {!isEditMode && !previewImage && (
                            <p className="text-sm text-gray-500 mt-2">
                                Accepts up to 5 image files (JPG, PNG, GIF). Max 5MB per image.
                            </p>
                        )}
                    </div>

                    {/* Title */}
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                            Title*
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Summer Collection, Salon Interior"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
                            maxLength={100}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                        <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="A brief description of this image..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
                            rows={3}
                            maxLength={500}
                        />
                    </div>

                    {/* Category */}
                    <div className="mb-4">
                        <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
                            Category*
                        </label>
                        {isAddingCategory ? (
                            <div className="flex">
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault(); // Prevent form submission
                                            addNewCategory();
                                        }
                                    }}
                                    placeholder="New Category Name"
                                    className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:border-[#d0a189]"
                                />
                                <button type="button" onClick={addNewCategory} className="bg-[#d0a189] text-white px-4 rounded-r-lg hover:bg-[#a38772]">
                                    Add
                                </button>
                            </div>
                        ) : (
                            <div className="flex">
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:border-[#d0a189]"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {localCategories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setIsAddingCategory(true)}
                                    className="bg-gray-200 text-gray-700 px-4 rounded-r-lg hover:bg-gray-300"
                                    title="Add new category"
                                >
                                    <FaPlus />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    <div className="mb-4">
                        <label htmlFor="tags" className="block text-gray-700 font-medium mb-2">
                            Tags (Optional)
                        </label>
                        <input
                            type="text"
                            id="tags"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            placeholder="e.g., haircut, color, nails (comma separated)"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
                        />
                    </div>

                    {/* Featured Checkbox */}
                    <div className="mb-6">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="featured"
                                checked={formData.featured}
                                onChange={handleChange}
                                className="mr-2 h-4 w-4 text-[#d0a189] focus:ring-[#d0a189] border-gray-300 rounded"
                            />
                            <span className="text-gray-700">Mark as Featured (Display prominently on your shop page)</span>
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-[#d0a189] text-white rounded-lg shadow hover:bg-[#ecdfcf] transition-colors flex items-center justify-center min-w-[120px]"
                        >
                            {isSubmitting ? (
                                <>
                                    <LoadingSpinner size="small" className="mr-2" />
                                    {isEditMode ? 'Updating...' : 'Adding...'}
                                </>
                            ) : (
                                isEditMode ? 'Update Item' : 'Add Item'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditGalleryItemModal;