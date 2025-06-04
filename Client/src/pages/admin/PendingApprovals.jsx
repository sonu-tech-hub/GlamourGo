import React from 'react';
import { Link } from 'react-router-dom';
import { FaStore, FaCheck, FaTimes, FaUser } from 'react-icons/fa';
import { format } from 'date-fns';

import LoadingSpinner from '../../components/common/LoadingSpinner';

const PendingApprovals = ({ approvals, isLoading, onApprove, onReject }) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Convert to array if not already (e.g., handle null or unexpected object)
  const shopList = Array.isArray(approvals) ? approvals : [];

  if (shopList.length === 0) {
    return (
      <div className="text-center py-6">
        <FaStore className="text-gray-300 text-5xl mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-500 mb-1">No Pending Approvals</h3>
        <p className="text-gray-500">All shop applications have been reviewed.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
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
              Date
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {shopList.map((shop) => (
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
                    <div className="text-sm font-medium text-gray-900">{shop.name}</div>
                    <div className="text-sm text-gray-500">{shop.category}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#d0a189] flex items-center justify-center text-white">
                    <FaUser />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{shop.owner?.name}</div>
                    <div className="text-sm text-gray-500">{shop.owner?.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{shop.address?.city}</div>
                <div className="text-sm text-gray-500">{shop.address?.state}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(shop.createdAt), 'MMM d, yyyy')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onApprove(shop._id)}
                  className="text-green-600 hover:text-green-900 mr-3"
                >
                  <FaCheck />
                </button>
                <button
                  onClick={() => onReject(shop._id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <FaTimes />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PendingApprovals;
