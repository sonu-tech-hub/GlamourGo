import React from 'react';
import { FaStar, FaUser, FaCheck, FaReply, FaThumbsUp } from 'react-icons/fa';
import { format } from 'date-fns';

const ReviewItem = ({ review }) => {
  return (
    <div className="border-b border-gray-200 pb-6">
      <div className="flex items-start">
        <div className="mr-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-[#doa189] flex items-center justify-center">
            {review.user.profilePicture ? (
              <img 
                src={review.user.profilePicture} 
                alt={review.user.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <FaUser className="text-white" />
            )}
          </div>
        </div>
        
        <div className="flex-grow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
            <div>
              <h4 className="font-semibold text-[#a38772]">
                {review.user.name}
                {review.isVerified && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    <FaCheck className="mr-1" />
                    VERIFIED
                  </span>
                )}
              </h4>
              
              <div className="flex items-center mt-1">
                <div className="flex text-yellow-400 mr-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>
                      {i < Math.floor(review.rating) ? (
                        <FaStar />
                      ) : i < Math.ceil(review.rating) ? (
                        <FaStar className="opacity-50" />
                      ) : (
                        <FaStar className="opacity-25" />
                      )}
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {format(new Date(review.createdAt), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
            
            <div className="mt-2 sm:mt-0">
              <button className="text-[#doa189] text-sm hover:underline flex items-center">
                <span className="mr-1">Helpful {review.helpful.count > 0 && `(${review.helpful.count})`}</span>
                <FaThumbsUp />
              </button>
            </div>
          </div>
          
          <h5 className="font-medium mb-1">
            {review.title}
          </h5>
          
          <p className="text-gray-700">
            {review.content}
          </p>
          
          {/* Review Media */}
          {review.media && review.media.length > 0 && (
            <div className="flex mt-3 space-x-2 overflow-x-auto pb-2">
              {review.media.map((mediaUrl, index) => (
                <div key={index} className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                  <img 
                    src={mediaUrl} 
                    alt={`Review media ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
          
          {/* Owner Response */}
          {review.ownerResponse && (
            <div className="mt-3 bg-gray-50 p-3 rounded">
              <div className="flex items-start">
                <FaReply className="text-gray-400 mt-1 mr-2" />
                <div>
                  <div className="flex items-center">
                    <h5 className="font-medium text-[#a38772]">Owner Response</h5>
                    <span className="text-xs text-gray-500 ml-2">
                      {format(new Date(review.ownerResponse.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <p className="text-gray-700 mt-1">
                    {review.ownerResponse.content}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewItem;
