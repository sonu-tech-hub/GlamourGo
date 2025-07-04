import React from "react";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types"; // Import PropTypes
import {
  FaStar,
  FaHeart,
  FaRegHeart,
  FaMapMarkerAlt,
  FaStore,
} from "react-icons/fa";

const ShopCard = ({ shop, isFavorite, onFavoriteToggle }) => {
  const navigate = useNavigate();

  // Handle cases where shop data might be missing or malformed
  if (!shop) {
    console.warn("ShopCard received no shop data.");
    return null; // Or render a placeholder/error message
  }

  const handleClick = () => {
    navigate(`/shop/${shop._id}`);
  };

  // Prevent the favorite button from triggering the card click
  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onFavoriteToggle && onFavoriteToggle(); // Only call if onFavoriteToggle is provided
  };

  const shopImage =
    shop.gallery && shop.gallery.length > 0
      ? shop.gallery[0].url
      : null;
  const shopName = shop.name || "Unnamed Shop";
  const shopCategory = shop.category
    ? shop.category.charAt(0).toUpperCase() + shop.category.slice(1)
    : "Uncategorized";
  const shopAverageRating = shop.ratings?.average
    ? shop.ratings.average.toFixed(1)
    : "N/A";
  const shopAddress = shop.address
    ? `${shop.address.street || ""}, ${shop.address.city || ""}, ${
        shop.address.state || ""
      }`.replace(/,(\s*),/g, ",") // Remove double commas from empty parts
    : "Address not available";
  const popularServices = Array.isArray(shop.services) ? shop.services : [];

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      {/* Shop Image */}
      <div className="h-48 relative overflow-hidden">
        {shopImage ? (
          <img
            src={shopImage}
            alt={`${shopName} - Primary Image`} 
            className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <FaStore className="text-gray-400 text-4xl" />
          </div>
        )}

        {/* Favorite Button */}
        {onFavoriteToggle && ( // Only render if onFavoriteToggle is provided
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white bg-opacity-90 flex items-center justify-center shadow-md hover:bg-opacity-100 transition-colors z-10"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? (
              <FaHeart className="text-red-500" />
            ) : (
              <FaRegHeart className="text-gray-500 hover:text-red-500" />
            )}
          </button>
        )}

        {/* Category Tag */}
        <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm">
          {shopCategory}
        </div>
      </div>

      {/* Shop Details */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-[#a38772] truncate pr-2">
            {shopName}
          </h3>

          <div className="flex items-center bg-[#fef4ea] text-[#a38772] px-2 py-1 rounded text-sm gap-1">
            <FaStar className="mr-1" />
            <span>{shopAverageRating}</span>
          </div>
        </div>

        <div className="flex items-start mb-3">
          <FaMapMarkerAlt className="text-gray-400 mt-1 mr-1 flex-shrink-0" />
          <p className="text-sm text-gray-600 line-clamp-2">
            {shopAddress}
          </p>
        </div>

        {/* Popular Services */}
        {popularServices.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Popular Services:</p>
            <div className="flex flex-wrap gap-1">
              {popularServices.slice(0, 2).map((service, index) => (
                <span
                  key={service._id || index} // Use unique ID if available, otherwise index
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                >
                  {service.name || "Unnamed Service"} (₹{service.price !== undefined ? service.price : "N/A"})
                </span>
              ))}
              {popularServices.length > 2 && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  +{popularServices.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        <Link
          to={`/shop/${shop._id}`}
          className="block w-full text-center bg-[#a38772] hover:bg-[#875e2c] text-white font-medium py-2 rounded-lg transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

// PropTypes for validation
ShopCard.propTypes = {
  shop: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string,
    category: PropTypes.string,
    gallery: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string,
      })
    ),
    ratings: PropTypes.shape({
      average: PropTypes.number,
    }),
    address: PropTypes.shape({
      street: PropTypes.string,
      city: PropTypes.string,
      state: PropTypes.string,
    }),
    services: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
        price: PropTypes.number,
      })
    ),
  }).isRequired,
  isFavorite: PropTypes.bool.isRequired,
  onFavoriteToggle: PropTypes.func, // Optional, as it might not always be provided
};

export default ShopCard;