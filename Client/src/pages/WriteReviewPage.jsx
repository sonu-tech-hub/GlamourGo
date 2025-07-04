// client/src/pages/WriteReviewPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { FaStar, FaUpload, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { getShopById } from '../services/shopService';
import { getAppointmentDetails } from '../services/appointmentService';
import { submitReview } from '../services/reviewService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const WriteReviewPage = () => {
  const { shopId } = useParams();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState([]); // Stores File objects
  const [previewImages, setPreviewImages] = useState([]); // Stores URL.createObjectURL strings
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoize URL.revokeObjectURL for cleanup
  const revokeObjectURLs = useCallback(() => {
    previewImages.forEach(url => URL.revokeObjectURL(url));
  }, [previewImages]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const shopResponse = await getShopById(shopId);
        setShop(shopResponse.data?.data || shopResponse.data); 

        if (appointmentId) {
          const appointmentResponse = await getAppointmentDetails(appointmentId);
          setAppointment(appointmentResponse.data?.data || appointmentResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data for review.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      revokeObjectURLs();
    };
  }, [shopId, appointmentId, revokeObjectURLs]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    const newValidFiles = [];
    const newPreviewUrls = [];

    files.forEach(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(file.type); // Added GIF
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB max

      if (!isValidType) {
        toast.error(`${file.name} is not a valid image type (only JPG, PNG, GIF allowed).`);
        return;
      }

      if (!isValidSize) {
        toast.error(`${file.name} exceeds the 5MB size limit.`);
        return;
      }

      newValidFiles.push(file);
      newPreviewUrls.push(URL.createObjectURL(file));
    });

    if (media.length + newValidFiles.length > 5) {
      newPreviewUrls.forEach(url => URL.revokeObjectURL(url));
      return toast.error('You can upload a maximum of 5 images.');
    }

    setMedia(prevMedia => [...prevMedia, ...newValidFiles]);
    setPreviewImages(prevPreviews => [...prevPreviews, ...newPreviewUrls]);
    e.target.value = null; 
  };

  const removeImage = (indexToRemove) => {
    URL.revokeObjectURL(previewImages[indexToRemove]);

    setMedia(prevMedia => prevMedia.filter((_, index) => index !== indexToRemove));
    setPreviewImages(prevPreviews => prevPreviews.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      return toast.error('Please select a rating.');
    }

    if (!title.trim()) {
      return toast.error('Please provide a review title.');
    }

    if (!content.trim()) {
      return toast.error('Please write your review content.');
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('shopId', shopId);
      if (appointmentId) formData.append('appointmentId', appointmentId);
      formData.append('rating', rating);
      formData.append('title', title);
      formData.append('content', content);

      // --- THIS IS THE CRITICAL LINE FOR 'Unexpected field' ERROR ---
      // Ensure 'media' here EXACTLY matches the field name in your backend Multer config.
      media.forEach((file) => {
        formData.append('media', file); // Each file appended with the same 'media' key
      });

      await submitReview(formData);

      toast.success('Review submitted successfully!');
      navigate(`/shop/${shopId}`);
    } catch (error) {
      console.error('Error submitting review:', error);
      if (error.response) {
        console.error('Server Response Data:', error.response.data);
        console.error('Server Response Status:', error.response.status);
        console.error('Server Response Headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received (request made):', error.request);
      } else {
        console.error('Error during request setup:', error.message);
      }
      const errorMessage = error.response?.data?.message || 'Failed to submit review. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!shop) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-[#a38772] mb-4">Shop not found</h2>
        <p className="text-gray-600 mb-6">The shop you're trying to review could not be found.</p>
        <button
          onClick={() => navigate('/user/appointments')}
          className="bg-[#d0a189] hover:bg-[#ecdfcf] text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Go to My Appointments
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#fef4ea] min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-[#a38772] mb-6">
            Write a Review
          </h1>

          <div className="mb-6 p-4 bg-[#fef4ea] rounded-lg">
            <h2 className="font-semibold text-[#a38772] mb-2">
              {shop.name}
            </h2>

            {appointment && (
              <div className="text-sm text-gray-600">
                <p>Service: {appointment.service?.name || 'N/A'}</p>
                <p>Date: {format(new Date(appointment.date), 'MMMM d,PPPP')}</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Your Rating
              </label>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-3xl text-yellow-400 focus:outline-none"
                  >
                    <FaStar
                      className={`${
                        (hoverRating || rating) >= star ? 'opacity-100' : 'opacity-25'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                Review Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your experience"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
                maxLength={100}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="content" className="block text-gray-700 font-medium mb-2">
                Your Review
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tell others about your experience"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
                rows={5}
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Add Photos (Optional)
              </label>
              <div className="flex flex-wrap gap-4 mb-3">
                {previewImages.map((previewUrl, index) => (
                  <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={previewUrl}
                      alt={`Upload preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}

                {media.length < 5 && (
                  <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#d0a189]">
                    <FaUpload className="text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Add Photo</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/gif"
                      onChange={handleImageUpload}
                      className="hidden"
                      multiple
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-500">
                You can upload up to 5 images (5MB max per image).
              </p>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => navigate(`/shop/${shopId}`)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#d0a189] text-white rounded-lg hover:bg-[#ecdfcf] transition-colors flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="small" className="mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WriteReviewPage;