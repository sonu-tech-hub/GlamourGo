// client/src/pages/admin/Shops.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaStore,
  FaSearch,
  FaFilter,
  FaCheck,
  FaTimes,
  FaEye,
} from "react-icons/fa";
import toast from "react-hot-toast";

import { getAllShopsAdmin } from "../../services/adminService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ConfirmationModal from "../../components/common/ConfirmationModal";
console.log("getAllShopsAdmin",getAllShopsAdmin());

const Shops = () => {
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'pending', 'suspended'
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState([]);

  const [selectedShop, setSelectedShop] = useState(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
// console.log("shop owner ",shops.owner.name)
  useEffect(() => {
    fetchShops();
  }, []);

  useEffect(() => {
    filterShops();
  }, [shops, searchQuery, statusFilter, categoryFilter]);

  const fetchShops = async () => {
    setIsLoading(true);
    try {
      const response = await getAllShopsAdmin();

      console.log("Fetched shops:", response.data.shops); // ✅ you should now see the real data

      const shopsArray = response.data.shops;
      setShops(shopsArray);

      // Set categories
      const uniqueCategories = [
        ...new Set(shopsArray.map((shop) => shop.category)),
      ];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching shops:", error);
      toast.error("Failed to load shops");
    } finally {
      setIsLoading(false);
    }
  };

  const filterShops = () => {
    let filtered = [...shops];

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((shop) => shop.status === statusFilter);
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((shop) => shop.category === categoryFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (shop) =>
          shop.name.toLowerCase().includes(query) ||
          shop.address?.city?.toLowerCase().includes(query) ||
          shop.category.toLowerCase().includes(query)
      );
    }

    setFilteredShops(filtered);
  };

  const handleSuspendShop = async () => {
    if (!selectedShop) return;

    setIsProcessing(true);
    try {
      // In a real implementation, you would call your API to suspend the shop
      // await api.put(`/admin/shops/${selectedShop._id}/suspend`);

      // Update local state
      setShops((prevShops) =>
        prevShops.map((shop) =>
          shop._id === selectedShop._id
            ? {
                ...shop,
                status: shop.status === "suspended" ? "active" : "suspended",
              }
            : shop
        )
      );

      toast.success(
        selectedShop.status === "suspended"
          ? `${selectedShop.name} has been activated`
          : `${selectedShop.name} has been suspended`
      );
    } catch (error) {
      console.error("Error suspending shop:", error);
      toast.error("Failed to update shop status");
    } finally {
      setIsProcessing(false);
      setShowSuspendModal(false);
    }
  };

  const openSuspendModal = (shop) => {
    setSelectedShop(shop);
    setShowSuspendModal(true);
  };

  return (
    <div className="bg-[#fef4ea] min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-[#a38772]">Manage Shops</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search shops by name, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center">
              <FaFilter className="text-gray-400 mr-2" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-2 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center">
              <FaStore className="text-gray-400 mr-2" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-2 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
              >
                <option value="all">All Categories</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {typeof category === "string" && category.length > 0
                      ? category.charAt(0).toUpperCase() + category.slice(1)
                      : "Unknown"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <LoadingSpinner />
              <p className="text-gray-500 mt-4">Loading shops...</p>
            </div>
          ) : filteredShops.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shop
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredShops.map((shop) => (
                    <tr key={shop._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden">
                            {shop.gallery && shop.gallery.length > 0 ? (
                              <img
                                src={shop.gallery[0].url}
                                alt={shop.name}
                                className="h-10 w-10 object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 bg-[#fef4ea] flex items-center justify-center">
                                <FaStore className="text-[#d0a189]" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {shop.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {shop._id.substring(0, 8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {shop.owner.name} 
                          {console.log("Shop owner:", shop.owner.name)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {shop.contactInfo.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {shop.address.city}
                        </div>
                        <div className="text-sm text-gray-500">
                          {shop.address.state}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#fef4ea] text-[#d0a189]">
                          {shop.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            shop.status === "active"
                              ? "bg-green-100 text-green-800"
                              : shop.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : shop.status === "suspended"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {shop.status
                            ? shop.status.charAt(0).toUpperCase() +
                              shop.status.slice(1)
                            : "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/admin/shops/${shop._id}`}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <FaEye />
                        </Link>

                        {shop.status === "pending" && (
                          <button
                            onClick={() => {
                              /* Approve shop */
                            }}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            <FaCheck />
                          </button>
                        )}

                        <button
                          onClick={() => openSuspendModal(shop)}
                          className={`${
                            shop.status === "suspended"
                              ? "text-green-600 hover:text-green-900"
                              : "text-red-600 hover:text-red-900"
                          } mr-3`}
                        >
                          {shop.status === "suspended" ? (
                            <FaCheck />
                          ) : (
                            <FaTimes />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FaStore className="text-gray-300 text-5xl mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-1">
                No Shops Found
              </h3>
              <p className="text-gray-500">
                {searchQuery ||
                statusFilter !== "all" ||
                categoryFilter !== "all"
                  ? "No shops match your search criteria. Try adjusting your filters."
                  : "There are no shops registered in the system yet."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Suspend/Activate Shop Modal */}
      <ConfirmationModal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        onConfirm={handleSuspendShop}
        title={
          selectedShop?.status === "suspended"
            ? "Activate Shop"
            : "Suspend Shop"
        }
        message={
          selectedShop?.status === "suspended"
            ? `Are you sure you want to activate ${selectedShop?.name}? This will allow them to accept bookings again.`
            : `Are you sure you want to suspend ${selectedShop?.name}? This will prevent them from accepting new bookings.`
        }
        confirmButtonText={
          selectedShop?.status === "suspended" ? "Activate" : "Suspend"
        }
        confirmButtonColor={
          selectedShop?.status === "suspended" ? "green" : "red"
        }
        isLoading={isProcessing}
      />
    </div>
  );
};

export default Shops;
