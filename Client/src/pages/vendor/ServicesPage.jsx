// pages/vendor/ServicesPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaClock, FaSearch, FaFilter } from 'react-icons/fa';
import toast from 'react-hot-toast';

// Ensure correct import path for client-side service functions
import { getShopServices, deleteService } from '../../services/serviceService'; // <<<--- Corrected import path
import { getAllShops } from '../../services/shopService'; // This looks like a client-side shopService, keep as is.
import { useAuth } from '../../context/AuthContext';
import AddServiceModal from './AddServiceModal';
import EditServiceModal from './EditServiceModal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ServicesPage = () => {
  const { user } = useAuth();

  const [shopId, setShopId] = useState('');

  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    const fetchVendorShop = async () => {
      try {
        const userId = user?.user?.id;
        const userType = user?.user?.userType;

        if (!userId || userType !== 'vendor') {
          setIsLoading(false); // Stop loading if no user or not vendor
          return;
        }

        const response = await getAllShops(); // Assuming this fetches all shops
        const allShops = response.data.shops;

        const vendorShop = allShops.find(shop => shop.owner === userId);

        if (!vendorShop) {
          toast.error('No shop found for your vendor account.');
          setIsLoading(false); // Stop loading
          return;
        }

        setShopId(vendorShop._id);
      } catch (error) {
        console.error('Failed to fetch shop for vendor:', error);
        toast.error('Unable to find your shop');
        setIsLoading(false); // Stop loading on error
      }
    };

    fetchVendorShop();
  }, [user]); // Depend on 'user' object from AuthContext

  useEffect(() => {
    // Filter services based on category and search query
    let filtered = [...services];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query)
      );
    }

    setFilteredServices(filtered);
  }, [services, selectedCategory, searchQuery]);

  const fetchServices = async () => {
    setIsLoading(true); // Set loading true at the start of fetch
    try {
      if (!shopId) { // Prevent fetching if shopId is not yet available
        setIsLoading(false);
        return;
      }
      const response = await getShopServices(shopId);
      if (!response?.data?.services) {
        throw new Error('Invalid response structure');
      }

      setServices(response.data.services);
      // setFilteredServices(response.data.services); // This is handled by the useEffect above

      // Extract unique categories
      const uniqueCategories = [...new Set(response.data.services.map(service => service.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setIsLoading(false); // Always set loading false in finally
    }
  };

  useEffect(() => {
    if (shopId) { // Only fetch services if shopId is available
      fetchServices();
      console.log('Current shopId state (after setting):', shopId); // This will log the updated shopId
    }
  }, [shopId]); // Re-run when shopId changes

  const handleDeleteService = async () => {
    try {
      // The deleteService client API function only expects serviceId now
      await deleteService(selectedService._id); // <<<--- Corrected call
      toast.success('Service deleted successfully');
      fetchServices();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error(error.response?.data?.message || 'Failed to delete service');
    }
  };

  const openEditModal = (service) => {
    setSelectedService(service);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (service) => {
    setSelectedService(service);
    setIsDeleteModalOpen(true);
  };

  const handleCategoryAdded = (newCategory) => {
    if (!categories.includes(newCategory)) {
      setCategories(prev => [...prev, newCategory]);
    }
  };

  return (
    <div className="bg-[#fef4ea] min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#a38772] mb-4 md:mb-0">
            Manage Services
          </h1>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center bg-[#d0a189] hover:bg-[#ecdfcf] text-white font-bold py-2 px-4 rounded-lg transition-colors" // Corrected color for consistency
          >
            <FaPlus className="mr-2" />
            Add New Service
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]" // Corrected color for consistency
              />
            </div>

            <div className="flex items-center">
              <FaFilter className="text-gray-400 mr-2" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-2 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]" // Corrected color for consistency
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <LoadingSpinner />
              <p className="text-gray-500 mt-2">Loading services...</p>
            </div>
          ) : filteredServices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredServices.map(service => (
                    <tr key={service._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {service.name}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {service.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#fef4ea] text-[#d0a189]"> {/* Corrected color for consistency */}
                          {service.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <FaClock className="mr-1" />
                          {service.duration} mins
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {service.isDiscounted ? (
                          <div>
                            <span className="text-sm text-gray-400 line-through mr-1">
                              ₹{service.price}
                            </span>
                            <span className="text-sm font-medium text-[#d0a189]"> {/* Corrected color for consistency */}
                              ₹{service.discountedPrice}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm font-medium text-gray-900">
                            ₹{service.price}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          service.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openEditModal(service)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => openDeleteModal(service)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No services found. Add your first service!</p>
            </div>
          )}
        </div>

        {/* Add Service Modal */}
        {shopId && ( // Render only if shopId is available
          <AddServiceModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            shopId={shopId}
            onServiceAdded={fetchServices}
            categories={categories}
            onCategoryAdded={handleCategoryAdded}
          />
        )}

        {/* Edit Service Modal */}
        {selectedService && ( // Render only if selectedService is available
          <EditServiceModal
            isOpen={isEditModalOpen}
            shopId={shopId}
            onClose={() => setIsEditModalOpen(false)}
            service={selectedService}
            onServiceUpdated={fetchServices}
            categories={categories}
          />
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          // shopId={shopId} // Not needed for ConfirmationModal itself, but the handler uses it
          onConfirm={handleDeleteService}
          title="Delete Service"
          message={`Are you sure you want to delete "${selectedService?.name}"? This action cannot be undone.`}
          confirmButtonText="Delete"
          confirmButtonColor="red"
        />
      </div>
    </div>
  );
};

export default ServicesPage;