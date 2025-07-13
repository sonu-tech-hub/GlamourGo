// pages/vendor/EditServiceModal.jsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaClock, FaTag, FaRupeeSign } from 'react-icons/fa';
import toast from 'react-hot-toast';

// Make sure this import points to your client-side API service, not the server-side one
import { updateService } from '../../services/serviceService'; // <<<--- Corrected import path

import LoadingSpinner from '../../components/common/LoadingSpinner';

const EditServiceModal = ({ isOpen, onClose, shopId, service, onServiceUpdated, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    duration: 30,
    price: '',
    discountedPrice: '',
    isDiscounted: false,
    image: '',
    tags: '',
    isActive: true
  });

  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        category: service.category || '',
        duration: service.duration || 30,
        price: service.price || '',
        discountedPrice: service.discountedPrice || service.price || '',
        isDiscounted: service.isDiscounted || false,
        image: service.image || '',
        tags: service.tags ? service.tags.join(', ') : '',
        isActive: service.isActive !== undefined ? service.isActive : true
      });
    }
  }, [service]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'price' && !prev.isDiscounted ? { discountedPrice: value } : {})
    }));
  };

  const addNewCategory = () => {
    if (!newCategory.trim()) {
      return toast.error('Please enter a category name');
    }

    setFormData(prev => ({
      ...prev,
      category: newCategory.trim()
    }));

    setNewCategory('');
    setIsAddingCategory(false);
    toast.success('New category added');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return toast.error('Please enter a service name');
    }

    if (!formData.category) {
      return toast.error('Please select or add a category');
    }

    if (!formData.price || formData.price <= 0) {
      return toast.error('Please enter a valid price');
    }

    if (formData.isDiscounted && (!formData.discountedPrice || formData.discountedPrice <= 0)) {
      return toast.error('Please enter a valid discounted price');
    }

    if (formData.isDiscounted && Number(formData.discountedPrice) >= Number(formData.price)) {
      return toast.error('Discounted price must be less than regular price');
    }

    if (!service?._id) {
      return toast.error("Missing service ID. Cannot update this service.");
    }

    setIsSubmitting(true);
    try {
      const serviceDataToSend = { // Renamed to avoid confusion with formData
        ...formData,
        // Include shopId in the data sent to the backend if *any* backend middleware
        // expects it in the request body for update operations.
        // Based on serviceService.js, it's not strictly needed for the update logic itself,
        // but can be useful for validation middleware.
        shop: shopId, // Sending shopId as 'shop' property in the body
        price: Number(formData.price),
        discountedPrice: formData.isDiscounted ? Number(formData.discountedPrice) : Number(formData.price),
        duration: Number(formData.duration),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      await updateService(service._id, serviceDataToSend); // Corrected: only two arguments, serviceId and data
      toast.success('Service updated successfully');
      onServiceUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error(error.response?.data?.message || 'Failed to update service');
    } finally {
      setIsSubmitting(false);
    }
  };

  // REMOVED THE CONSOLE.LOG THAT WAS CAUSING API CALLS
  // console.log("EditServiceModal rendered with service:", updateService(service._id, formData, shopId));

  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-[#a38772]">
            Edit Service: {service.name}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                Service Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Haircut & Styling"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
                maxLength={100}
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
                Category*
              </label>
              {isAddingCategory ? (
                <div className="flex">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New Category Name"
                    className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:border-[#d0a189]"
                  />
                  <button
                    type="button"
                    onClick={addNewCategory}
                    className="bg-[#d0a189] text-white px-4 rounded-r-lg"
                  >
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
                    {(categories || []).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(true)}
                    className="bg-gray-200 text-gray-700 px-4 rounded-r-lg"
                  >
                    <FaPlus />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
              Description*
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the service..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="duration" className="block text-gray-700 font-medium mb-2">
                Duration (minutes)*
              </label>
              <div className="relative">
                <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min="5"
                  max="480"
                  step="5"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="price" className="block text-gray-700 font-medium mb-2">
                Regular Price (₹)*
              </label>
              <div className="relative">
                <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="discountedPrice" className="block text-gray-700 font-medium">
                  Discounted Price (₹)
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDiscounted"
                    name="isDiscounted"
                    checked={formData.isDiscounted}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="isDiscounted" className="text-sm text-gray-600">
                    Apply Discount
                  </label>
                </div>
              </div>
              <div className="relative">
                <FaTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  id="discountedPrice"
                  name="discountedPrice"
                  value={formData.discountedPrice}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189] ${!formData.isDiscounted ? 'bg-gray-100' : ''}`}
                  disabled={!formData.isDiscounted}
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="image" className="block text-gray-700 font-medium mb-2">
              Image URL (Optional)
            </label>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
            />
          </div>

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
              placeholder="e.g. spa, massage, relaxing (comma separated)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-gray-700">Service is active and available for booking</span>
            </label>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#d0a189] text-white rounded-lg hover:bg-[#ecdfcf] transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="small" className="mr-2" />
                  Updating...
                </>
              ) : (
                'Update Service'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditServiceModal;