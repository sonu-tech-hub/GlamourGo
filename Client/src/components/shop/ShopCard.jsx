// client/src/components/shop/ShopCard.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaStar, FaHeart, FaRegHeart, FaMapMarkerAlt, FaStore } from 'react-icons/fa';

const ShopCard = ({ shop, isFavorite, onFavoriteToggle }) => {
  const navigate = useNavigate();
  
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
      {/* Shop Image */}
      <div className="h-48 relative overflow-hidden">
        {shop.gallery && shop.gallery.length > 0 ? (
          <img 
            src={shop.gallery[0].url} 
            alt={shop.name} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <FaStore className="text-gray-400 text-4xl" />
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
        
        {/* Category Tag */}
        <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded-full text-xs font-medium text-[#a38772]">
          {shop.category.charAt(0).toUpperCase() + shop.category.slice(1)}
        </div>
      </div>
      
      {/* Shop Details */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-[#a38772] truncate">
            {shop.name}
          </h3>
          
          <div className="flex items-center bg-[#fef4ea] text-[#doa189] px-2 py-1 rounded text-sm">
            <FaStar className="mr-1" />
            <span>{shop.ratings.average.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="flex items-start mb-3">
          <FaMapMarkerAlt className="text-gray-400 mt-1 mr-1 flex-shrink-0" />
          <p className="text-sm text-gray-600 line-clamp-2">
            {shop.address.street}, {shop.address.city}, {shop.address.state}
          </p>
        </div>
        
        {/* Popular Services */}
        {shop.services && shop.services.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Popular Services:</p>
            <div className="flex flex-wrap gap-1">
              {shop.services.slice(0, 2).map((service, index) => (
                <span 
                  key={index} 
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                >
                  {service.name} (₹{service.price})
                </span>
              ))}
              {shop.services.length > 2 && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  +{shop.services.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}
        
        <Link
          to={`/shop/${shop._id}`}
          className="block w-full text-center bg-[#doa189] hover:bg-[#ecdfcf] text-white font-medium py-2 rounded-lg transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ShopCard;
