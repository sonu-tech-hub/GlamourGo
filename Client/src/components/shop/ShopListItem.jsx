// client/src/components/shop/ShopListItem.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaStar, FaHeart, FaRegHeart, FaMapMarkerAlt, FaStore, FaPhoneAlt, FaClock } from 'react-icons/fa';

const ShopListItem = ({ shop, isFavorite, onFavoriteToggle }) => {
  const navigate = useNavigate();

  // Provide default values for ratings to prevent errors if they are missing
  const averageRating = shop.ratings?.average !== undefined ? shop.ratings.average.toFixed(1) : 'N/A';
  const reviewCount = shop.ratings?.count !== undefined ? shop.ratings.count : 0;

  const handleClick = () => {
    navigate(`/shop/${shop._id}`);
  };

  // Prevent the favorite button from triggering the card click
  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onFavoriteToggle();
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex flex-col md:flex-row">
        {/* Shop Image */}
        <div className="md:w-1/4 h-48 md:h-auto relative">
          {shop.gallery && shop.gallery.length > 0 ? (
            <img
              src={shop.gallery[0].url}
              alt={shop.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <FaStore className="text-gray-400 text-4xl" />
            </div>
          )}

          {/* Category Badge */}
          {shop.category && ( // Added conditional check for shop.category
            <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded-full text-xs font-medium text-[#a38772]">
              {shop.category.charAt(0).toUpperCase() + shop.category.slice(1)}
            </div>
          )}

          {/* Favorite Button */}
          {onFavoriteToggle && (
            <button
              onClick={handleFavoriteClick}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white bg-opacity-90 flex items-center justify-center shadow-md hover:bg-opacity-100 transition-colors"
            >
              {isFavorite ? (
                <FaHeart className="text-red-500" />
              ) : (
                <FaRegHeart className="text-gray-500 hover:text-red-500" />
              )}
            </button>
          )}
        </div>

        {/* Shop Details */}
        <div className="md:w-3/4 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-[#a38772]">
                {shop.name}
              </h3>

              <div className="flex items-center mt-1">
                <div className="flex items-center text-yellow-400 mr-2">
                  <FaStar />
                  <span className="ml-1 text-gray-700 font-medium">{averageRating}</span>
                </div>
                <span className="text-gray-500 text-sm">({reviewCount} reviews)</span>
              </div>

              <div className="flex items-start mt-2">
                <FaMapMarkerAlt className="text-gray-400 mt-1 mr-1 flex-shrink-0" />
                <p className="text-sm text-gray-600">
                  {shop.address.street}, {shop.address.city}, {shop.address.state}
                </p>
              </div>

              {shop.contactInfo && shop.contactInfo.phone && (
                <div className="flex items-center mt-1">
                  <FaPhoneAlt className="text-gray-400 mr-1 flex-shrink-0 text-xs" />
                  <p className="text-sm text-gray-600">{shop.contactInfo.phone}</p>
                </div>
              )}

              {/* Hours */}
              <div className="flex items-center mt-1">
                <FaClock className="text-gray-400 mr-1 flex-shrink-0 text-xs" />
                <p className="text-sm text-gray-600">
                  {shop.operatingHours && shop.operatingHours.length > 0
                    ? `Open: ${shop.operatingHours[0]?.open} - ${shop.operatingHours[0]?.close}` // Added optional chaining
                    : 'Hours not available'
                  }
                </p>
              </div>
            </div>

            {/* Popular Services */}
            <div className="hidden md:block">
              {shop.services && shop.services.length > 0 && (
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Popular Services:</p>
                  <div className="flex flex-col items-end space-y-1">
                    {shop.services.slice(0, 3).map((service, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        {service.name} (₹{service.price})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Link
              to={`/shop/${shop._id}`}
              className="bg-[#d0a189] hover:bg-[#ecdfcf] text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm" // Corrected color code
              onClick={(e) => e.stopPropagation()}
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopListItem;