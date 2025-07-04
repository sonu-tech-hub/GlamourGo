// client/src/pages/admin/ShopApprovals.jsx
import React, { useState, useEffect } from 'react';
import { FaStore, FaSearch, FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import toast from 'react-hot-toast';

import { getPendingApprovals, approveShop, rejectShop } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ShopDetailModal from '../../components/shop/ShopDetailModal';

const ShopApprovals = () => {
  const [pendingShops, setPendingShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedShopForApproval, setSelectedShopForApproval] = useState(null);
  const [selectedShopForRejection, setSelectedShopForRejection] = useState(null);
  const [selectedShopForDetails, setSelectedShopForDetails] = useState(null);

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
      const fetched = Array.isArray(response?.data?.pendingShops) ? response.data.pendingShops : [];
      setPendingShops(fetched);
      setFilteredShops(fetched);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      toast.error('Failed to load pending shop approvals');
    } finally {
      setIsLoading(false);
    }
  };

  const filterShops = () => {
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

  const handleApproveShop = async () => {
    if (!selectedShopForApproval) return;
    setIsProcessing(true);
    try {
      // FIX: Explicitly pass the approval message
      await approveShop(selectedShopForApproval._id, 'Approved by admin');
      toast.success(`${selectedShopForApproval.name} has been approved`);
      await fetchPendingApprovals();
    } catch (error) {
      console.error('Error approving shop:', error);
      toast.error(error.response?.data?.message || 'Failed to approve shop');
    } finally {
      setIsProcessing(false);
      setShowApproveModal(false);
      setSelectedShopForApproval(null);
    }
  };

  const handleRejectShop = async () => {
    if (!selectedShopForRejection || !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setIsProcessing(true);
    try {
      await rejectShop(selectedShopForRejection._id, rejectionReason);
      toast.success(`${selectedShopForRejection.name} has been rejected`);
      await fetchPendingApprovals();
    } catch (error) {
      console.error('Error rejecting shop:', error);
      toast.error(error.response?.data?.message || 'Failed to reject shop');
    } finally {
      setIsProcessing(false);
      setShowRejectModal(false);
      setSelectedShopForRejection(null);
      setRejectionReason('');
    }
  };

  return (
    <div className="bg-[#fef4ea] min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-[#a38772]">Shop Approvals</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {/* Search Bar */}
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

          {/* Content */}
          {isLoading ? (
            <div className="text-center py-8">
              <LoadingSpinner />
              <p className="text-gray-500 mt-4">Loading pending approvals...</p>
            </div>
          ) : filteredShops.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shop</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredShops.map((shop) => (
                    <tr key={shop._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-md overflow-hidden">
                            {shop.gallery?.[0]?.url ? (
                              <img src={shop.gallery[0].url} alt={shop.name} className="h-10 w-10 object-cover" />
                            ) : (
                              <div className="h-10 w-10 bg-[#fef4ea] flex items-center justify-center">
                                <FaStore className="text-[#d0a189]" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{shop.name}</div>
                            <div className="text-sm text-gray-500">{shop.contactInfo?.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{shop.owner.name}</div>
                        <div className="text-sm text-gray-500">{shop.owner.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{shop.address.city}</div>
                        <div className="text-sm text-gray-500">{shop.address.state}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-[#fef4ea] text-[#d0a189]">
                          {shop.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(shop.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button onClick={() => setSelectedShopForDetails(shop)} title="View Details" className="text-blue-600 hover:text-blue-900 mr-3">
                          <FaEye />
                        </button>
                        <button onClick={() => { setSelectedShopForApproval(shop); setShowApproveModal(true); }} title="Approve Shop" className="text-green-600 hover:text-green-900 mr-3">
                          <FaCheck />
                        </button>
                        <button onClick={() => { setSelectedShopForRejection(shop); setShowRejectModal(true); setRejectionReason(''); }} title="Reject Shop" className="text-red-600 hover:text-red-900">
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
                  ? 'No shops match your search criteria.'
                  : 'There are no shops pending approval at this time.'}
              </p>
            </div>
          )}
        </div>

        {/* Approve Modal */}
        {showApproveModal && selectedShopForApproval && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-semibold">Approve Shop</h2>
                <button onClick={() => setShowApproveModal(false)}><FaTimes /></button>
              </div>
              <div className="p-6">
                <p>Are you sure you want to approve <strong>{selectedShopForApproval.name}</strong>?</p>
              </div>
              <div className="flex justify-end p-4 border-t">
                <button onClick={() => setShowApproveModal(false)} className="mr-2 bg-gray-200 px-4 py-2 rounded">Cancel</button>
                <button onClick={handleApproveShop} disabled={isProcessing} className="bg-green-600 text-white px-4 py-2 rounded">
                  {isProcessing ? 'Processing...' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedShopForRejection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-semibold">Reject Shop</h2>
                <button onClick={() => setShowRejectModal(false)}><FaTimes /></button>
              </div>
              <div className="p-6">
                <p>Please provide a reason for rejecting <strong>{selectedShopForRejection.name}</strong>.</p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Reason for rejection..."
                  rows="4"
                  className="w-full mt-4 p-2 border rounded"
                />
              </div>
              <div className="flex justify-end p-4 border-t">
                <button onClick={() => setShowRejectModal(false)} className="mr-2 bg-gray-200 px-4 py-2 rounded">Cancel</button>
                <button onClick={handleRejectShop} disabled={isProcessing} className="bg-red-600 text-white px-4 py-2 rounded">
                  {isProcessing ? 'Processing...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Shop Detail Modal */}
        {selectedShopForDetails && (
          <ShopDetailModal shop={selectedShopForDetails} onClose={() => setSelectedShopForDetails(null)} />
        )}
      </div>
    </div>
  );
};

export default ShopApprovals;
