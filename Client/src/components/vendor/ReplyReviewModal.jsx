// components/vendor/ReplyReviewModal.jsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaCommentDots } from 'react-icons/fa';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const ReplyReviewModal = ({ isOpen, onClose, review, onReplySubmit }) => {
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set initial content if editing an existing reply or clear for new replies
  useEffect(() => {
    if (review?.ownerResponse?.content) {
      setReplyContent(review.ownerResponse.content);
    } else {
      setReplyContent(''); // Clear for new replies or if no ownerResponse
    }
  }, [review, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!replyContent.trim()) {
      return toast.error('Reply cannot be empty.');
    }

    setIsSubmitting(true);
    try {
      // Pass the trimmed content to ensure consistency with backend validation
      await onReplySubmit(review._id, replyContent.trim());
      // The parent component (ReviewsPage) will handle toast.success and closing the modal.
      // No need to reset state or close modal here, as the parent will trigger re-render.
    } catch (error) {
      // Error handling (like toast.error) for the API call is managed in ReviewsPage.jsx.
      // This catch block mainly serves to log the error if necessary,
      // and ensure `isSubmitting` is reset.
      console.error("Error submitting reply from modal:", error);
      // Optionally, you could add a generic error toast here if the parent doesn't handle it
      // if (error.response?.data?.message) {
      //   toast.error(error.response.data.message);
      // } else {
      //   toast.error("An error occurred while submitting your reply.");
      // }
    } finally {
      setIsSubmitting(false); // Ensure isSubmitting is always reset
    }
  };

  // Using a custom modal implementation
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-[#a38772]">
            {review?.ownerResponse ? 'Edit Your Reply' : 'Reply to Review'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Review from {review?.user?.name}:</p>
            <blockquote className="bg-gray-50 p-3 rounded-md border-l-4 border-gray-200 text-gray-600 italic">
              "{review?.content}"
            </blockquote>
          </div>

          <div className="mb-4">
            <label htmlFor="replyContent" className="block text-gray-700 font-medium mb-2">
              Your Reply*
            </label>
            <div className="relative">
              <FaCommentDots className="absolute left-3 top-3 text-gray-400" />
              <textarea
                id="replyContent"
                name="replyContent"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Enter your reply here..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
                rows={4}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#d0a189] text-white rounded-lg hover:bg-[#b99160] transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="small" className="mr-2" />
                  Submitting...
                </>
              ) : (
                review?.ownerResponse ? 'Update Reply' : 'Submit Reply'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReplyReviewModal;