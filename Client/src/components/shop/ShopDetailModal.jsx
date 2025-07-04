// src/components/shops/ShopDetailModal.jsx
import React from 'react';
import { FaTimes, FaMapMarkerAlt, FaClock, FaPhoneAlt, FaEnvelope, FaInfoCircle, FaStar, FaUser } from 'react-icons/fa';

const ShopDetailModal = ({ shop, onClose }) => {
  if (!shop) return null; // Don't render if no shop data is provided

  return (
    // Overlay for the modal - ensures it covers the whole screen
    // `overflow-auto` on the overlay is generally fine, but we'll manage inner scrolling
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 sm:p-6 md:p-8 z-50 overflow-y-auto"> {/* Added overflow-y-auto here */}
      {/* Modal Container */}
      <div className="bg-white rounded-lg shadow-2xl max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl w-full transform transition-all scale-100 opacity-100 animate-fade-in-scale my-8 max-h-[90vh] flex flex-col"> {/* Added max-h-[90vh] and flex-col */}
        {/* Modal Header */}
        <div className="bg-[#d0a189] p-4 sm:p-5 flex justify-between items-center rounded-t-lg shadow-md flex-shrink-0"> {/* Added flex-shrink-0 */}
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            {shop.name} Details
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none transition-colors duration-200"
            aria-label="Close"
          >
            <FaTimes className="text-2xl sm:text-3xl" />
          </button>
        </div>

        {/* Modal Body - Shop Information */}
        <div className="p-6 sm:p-8 space-y-5 text-gray-800 flex-grow overflow-y-auto"> {/* Added flex-grow and overflow-y-auto */}

          {/* Category */}
          <div className="flex items-center text-base sm:text-lg">
            <FaInfoCircle className="mr-3 text-[#d0a189] text-xl" />
            <span className="font-semibold text-gray-700">Category:</span>
            <span className="ml-2 font-medium capitalize">{shop.category}</span>
          </div>

          {/* Address */}
          <div className="flex items-start text-base sm:text-lg">
            <FaMapMarkerAlt className="mr-3 mt-1 text-[#d0a189] text-xl" />
            <div className="flex-grow">
              <span className="font-semibold text-gray-700">Address:</span>
              <span className="ml-2">
                {shop.address?.street || 'N/A'}
                {shop.address?.city && `, ${shop.address.city}`}
                {shop.address?.state && `, ${shop.address.state}`}
                {shop.address?.zipCode && `, ${shop.address.zipCode}`}
              </span>
              {/* Latitude and longitude display (smaller text) */}
              {shop.address?.coordinates && (
                <p className="text-xs text-gray-500 mt-1 pl-8">
                  (Lat: {shop.address.coordinates.coordinates[1]?.toFixed(4)}, Lon: {shop.address.coordinates.coordinates[0]?.toFixed(4)})
                </p>
              )}
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center text-base sm:text-lg">
            <FaStar className="mr-3 text-yellow-500 text-xl" />
            <span className="font-semibold text-gray-700">Rating:</span>
            <span className="ml-2">
              {shop.ratings?.average ? (
                <span className="font-medium">
                  {shop.ratings.average.toFixed(1)} ({shop.ratings.count} reviews)
                </span>
              ) : (
                <span className="text-gray-500 italic">No ratings yet</span>
              )}
            </span>
          </div>

          {/* Owner Information */}
          {shop.owner && (
            <div className="border-t border-gray-200 pt-5 mt-5">
              <h3 className="text-lg sm:text-xl font-bold text-[#8b612e] mb-3">Owner Information</h3>
              <div className="space-y-2">
                <p className="flex items-center text-base sm:text-lg">
                  <FaUser className="mr-3 text-gray-500 text-xl" />
                  <span className="font-semibold text-gray-700">Name:</span> {shop.owner.name || 'N/A'}
                </p>
                <p className="flex items-center text-base sm:text-lg">
                  <FaEnvelope className="mr-3 text-gray-500 text-xl" />
                  <span className="font-semibold text-gray-700">Email:</span> {shop.owner.email || 'N/A'}
                </p>
                <p className="flex items-center text-base sm:text-lg">
                  <FaPhoneAlt className="mr-3 text-gray-500 text-xl" />
                  <span className="font-semibold text-gray-700">Phone:</span> {shop.owner.phone || 'N/A'}
                </p>
              </div>
            </div>
          )}

          {/* Operating Hours */}
          {shop.operatingHours && shop.operatingHours.length > 0 && (
            <div className="border-t border-gray-200 pt-5 mt-5">
              <h3 className="text-lg sm:text-xl font-bold text-[#8b612e] mb-3">Operating Hours</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm sm:text-base">
                {shop.operatingHours.map((hour, index) => (
                  <li key={index} className="flex items-center">
                    <FaClock className="mr-2 text-gray-500 text-lg" />
                    <span className="font-semibold">{hour.day}:</span>
                    <span className="ml-1">
                      {hour.isClosed ? 'Closed' : `${hour.open} - ${hour.close}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Description */}
          {shop.description && (
            <div className="border-t border-gray-200 pt-5 mt-5">
              <h3 className="text-lg sm:text-xl font-bold text-[#8b612e] mb-3">Description</h3>
              <p className="text-sm sm:text-base leading-relaxed text-gray-700">{shop.description}</p>
            </div>
          )}

          {/* Verification and Activation Status */}
          <div className="border-t border-gray-200 pt-5 mt-5">
            {shop.isVerified !== undefined && (
              <p className="mb-2 text-base sm:text-lg font-semibold flex items-center">
                Verification Status:{" "}
                <span className={`font-bold ml-2 ${shop.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                  {shop.isVerified ? 'Verified' : 'Pending Verification'}
                </span>
              </p>
            )}
            {shop.isActive !== undefined && (
              <p className="text-base sm:text-lg font-semibold flex items-center">
                Activation Status:{" "}
                <span className={`font-bold ml-2 ${shop.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {shop.isActive ? 'Active' : 'Inactive'}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopDetailModal;
