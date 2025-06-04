// client/src/pages/admin/ShopApprovals.jsx
import React, { useState, useEffect } from 'react';
import { FaStore, FaSearch, FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import toast from 'react-hot-toast';

import { getPendingApprovals, approveShop, rejectShop } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const ShopApprovals = () => {
  const [pendingShops, setPendingShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedShop, setSelectedShop] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    fetchPendingApprovals();
  }, []);
  
  useEffect(() => {
    filterShops();
  }, [pendingShops, searchQuery]);
  
  const fetchPendingApprovals = async () => {
  setIsLoading(true);
  try {
    const response = await getPendingApprovals();
    const data = Array.isArray(response.data) ? response.data : [];
    setPendingShops(data);
    setFilteredShops(data);
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    toast.error('Failed to load pending shop approvals');
  } finally {
    setIsLoading(false);
  }
};

  
  const filterShops = () => {
  if (!Array.isArray(pendingShops)) return;

  if (!searchQuery) {
    setFilteredShops([...pendingShops]);
    return;
  }

  const query = searchQuery.toLowerCase();
  const filtered = pendingShops.filter(shop =>
    shop.name?.toLowerCase().includes(query) ||
    shop.address?.city?.toLowerCase().includes(query) ||
    shop.category?.toLowerCase().includes(query) ||
    shop.owner?.name?.toLowerCase().includes(query)
  );

  setFilteredShops(filtered);
};

  
  const openApproveModal = (shop) => {
    setSelectedShop(shop);
    setShowApproveModal(true);
  };
  
  const openRejectModal = (shop) => {
    setSelectedShop(shop);
    setRejectionReason('');
    setShowRejectModal(true);
  };
  
  const handleApproveShop = async () => {
    if (!selectedShop) return;
    
    setIsProcessing(true);
    try {
      await approveShop(selectedShop._id);
      
      // Remove from list
      setPendingShops(prevShops => prevShops.filter(shop => shop._id !== selectedShop._id));
      
      toast.success(`${selectedShop.name} has been approved`);
    } catch (error) {
      console.error('Error approving shop:', error);
      toast.error('Failed to approve shop');
    } finally {
      setIsProcessing(false);
      setShowApproveModal(false);
    }
  };
  
  const handleRejectShop = async () => {
    if (!selectedShop) return;
    
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    setIsProcessing(true);
    try {
      await rejectShop(selectedShop._id, rejectionReason);
      
      // Remove from list
      setPendingShops(prevShops => prevShops.filter(shop => shop._id !== selectedShop._id));
      
      toast.success(`${selectedShop.name} has been rejected`);
    } catch (error) {
      console.error('Error rejecting shop:', error);
      toast.error('Failed to reject shop');
    } finally {
      setIsProcessing(false);
      setShowRejectModal(false);
    }
  };
  
  const viewShopDetails = (shopId) => {
    // Navigate to shop details page
    console.log(`View shop details: ${shopId}`);
  };
  
  return (
    <div className="bg-[#fef4ea] min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-[#a38772]">Shop Approvals</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search shops by name, location, owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <LoadingSpinner />
              <p className="text-gray-500 mt-4">Loading pending approvals...</p>
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
                      Submitted On
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
                              {shop.contactInfo?.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{shop.owner.name}</div>
                        <div className="text-sm text-gray-500">{shop.owner.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{shop.address.city}</div>
                        <div className="text-sm text-gray-500">{shop.address.state}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#fef4ea] text-[#d0a189]">
                          {shop.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(shop.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => viewShopDetails(shop._id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => openApproveModal(shop)}
                          className="text-green-600 hover:text-green-900 mr-3"
                          title="Approve Shop"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => openRejectModal(shop)}
                          className="text-red-600 hover:text-red-900"
                          title="Reject Shop"
                        >
                          <FaTimes />
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
              <h3 className="text-lg font-medium text-gray-500 mb-1">No Pending Approvals</h3>
              <p className="text-gray-500">
                {searchQuery 
                  ? 'No shops match your search criteria. Try adjusting your search.'
                  : 'There are no shops pending approval at this time.'}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Approve Shop Modal */}
      <ConfirmationModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApproveShop}
        title="Approve Shop"
        message={`Are you sure you want to approve ${selectedShop?.name}? This will make the shop visible to customers and allow them to accept bookings.`}
        confirmButtonText="Approve"
        confirmButtonColor="green"
        isLoading={isProcessing}
      />
      
      {/* Reject Shop Modal */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${showRejectModal ? 'block' : 'hidden'}`}>
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Reject Shop
            </h2>
            <button 
              onClick={() => setShowRejectModal(false)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              {`Are you sure you want to reject ${selectedShop?.name}? Please provide a reason for rejection.`}
            </p>
            
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Rejection reason..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189] mb-4"
              rows="4"
            ></textarea>
          </div>
          
          <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={() => setShowRejectModal(false)}
              className="px-4 py-2 mr-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="button"
              onClick={handleRejectShop}
              disabled={isProcessing}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner size="small" className="mr-2" />
                  Processing...
                </>
              ) : (
                'Reject'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopApprovals;
