// client/src/components/vendor/RecentReviews.jsx
import React, { useState, useEffect } from 'react';
import { FaStar, FaReply } from 'react-icons/fa';
import { format } from 'date-fns';

import { getShopReviews } from '../../services/reviewService';
import LoadingSpinner from '../common/LoadingSpinner';

const RecentReviews = ({ isLoading: initialLoading }) => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [showReplyForm, setShowReplyForm] = useState(null);
  const [replyText, setReplyText] = useState('');
  
  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, you would get the shopId from context or props
        const shopId = 'your-shop-id'; // This should be dynamic
        const response = await getShopReviews(shopId);
        setReviews(response.data.reviews.slice(0, 3));
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReviews();
  }, []);
  
  const handleReply = async (reviewId) => {
    // In a real implementation, you would call an API to save the reply
    console.log(`Replying to review ${reviewId} with: ${replyText}`);
    setShowReplyForm(null);
    setReplyText('');
  };
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (reviews.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">No reviews yet.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review._id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <div className="w-10 h-10 rounded-full bg-[#doa189] flex items-center justify-center text-white">
                {review.user.name.charAt(0)}
              </div>
            </div>
            
            <div className="flex-grow">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h4 className="font-medium text-[#a38772]">{review.user.name}</h4>
                <span className="text-sm text-gray-500">
                  {format(new Date(review.createdAt), 'MMM d, yyyy')}
                </span>
              </div>
              
              <div className="flex text-yellow-400 mt-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={`${i < Math.floor(review.rating) ? 'opacity-100' : 'opacity-25'}`}
                  />
                ))}
              </div>
              
              <p className="text-gray-700 mb-2">{review.content}</p>
              
              {review.ownerResponse ? (
                <div className="mt-2 bg-gray-50 p-3 rounded">
                  <div className="flex items-start">
                    <FaReply className="text-gray-400 mt-1 mr-2" />
                    <div>
                      <div className="flex items-center">
                        <h5 className="font-medium text-[#a38772]">Your Response</h5>
                        <span className="text-xs text-gray-500 ml-2">
                          {format(new Date(review.ownerResponse.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <p className="text-gray-700 mt-1">{review.ownerResponse.content}</p>
                    </div>
                  </div>
                </div>
              ) : (
                showReplyForm === review._id ? (
                  <div className="mt-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-[#doa189]"
                      placeholder="Write your reply..."
                      rows="2"
                    ></textarea>
                    <div className="flex justify-end mt-2 space-x-2">
                      <button
                        onClick={() => setShowReplyForm(null)}
                        className="px-3 py-1 text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReply(review._id)}
                        className="px-3 py-1 bg-[#doa189] text-white rounded hover:bg-[#ecdfcf]"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowReplyForm(review._id)}
                    className="text-[#doa189] text-sm hover:underline mt-1"
                  >
                    Reply
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentReviews;
