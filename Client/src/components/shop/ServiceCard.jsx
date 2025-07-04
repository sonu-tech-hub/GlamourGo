// components/shop/ServiceCard.jsx
import React from 'react';
import { FaClock, FaTag } from 'react-icons/fa';

const ServiceCard = ({ service, onBookNow }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-4 md:mb-0">
          <h4 className="text-lg font-semibold text-[#a38772]">
            {service.name}
            {service.isDiscounted && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                <FaTag className="mr-1" />
                OFFER
              </span>
            )}
          </h4>
          
          <p className="text-gray-600 text-sm mt-1">
            {service.description}
          </p>
          
          <div className="flex items-center mt-2 text-gray-500 text-sm">
            <FaClock className="mr-1" />
            <span>{service.duration} mins</span>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="mr-4">
            {service.isDiscounted ? (
              <div>
                <span className="text-gray-400 line-through text-sm">₹{service.price}</span>
                <span className="text-[#d0a189] font-bold text-lg ml-2">₹{service.discountedPrice}</span>
              </div>
            ) : (
              <span className="text-[#d0a189] font-bold text-lg">₹{service.price}</span>
            )}
          </div>
          
          <button
            onClick={() => onBookNow(service)}
            className="bg-[#d0a189] hover:bg-[#ecdfcf] text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Book
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;