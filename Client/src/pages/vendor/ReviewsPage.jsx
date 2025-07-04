// pages/vendor/ReviewsPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { FaStar, FaReply, FaFilter, FaSearch } from "react-icons/fa";
import toast from "react-hot-toast";
import moment from "moment";

import { getShopReviews, replyToReview } from "../../services/reviewService";
import { getAllShops } from "../../services/shopService";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ReplyReviewModal from "../../components/vendor/ReplyReviewModal";

const ReviewsPage = () => {
    const { user } = useAuth();
    const [shopId, setShopId] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [filteredReviews, setFilteredReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [filterRating, setFilterRating] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const reviewsPerPage = 10;
    // console.log(reviews); // Debugging line - can be removed in production

    // Memoize fetchReviews to prevent unnecessary re-creation
    const fetchReviews = useCallback(async (page, currentShopId) => {
        if (!currentShopId) {
            console.warn("fetchReviews: currentShopId is null or undefined. Skipping API call.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const axiosResponse = await getShopReviews(currentShopId, {
                page,
                limit: reviewsPerPage,
                sort: "recent",
            });
            const responseData = axiosResponse.data;

            if (!responseData?.reviews) {
                console.error("Invalid response structure: 'reviews' array missing.", responseData);
                throw new Error("Invalid response structure for reviews.");
            }
            setReviews(responseData.reviews);
            setFilteredReviews(responseData.reviews);
            setTotalPages(responseData.pagination.totalPages);
        } catch (error) {
            console.error("Error fetching shop reviews in fetchReviews:", error);
            const errorMessage = error.response?.data?.message || "Failed to load reviews due to an unexpected error.";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [reviewsPerPage]);

    // Effect for initial shop ID discovery and first review fetch
    useEffect(() => {
        const initializeReviewsPage = async () => {
            setIsLoading(true);

            try {
                const userId = user?.user?.id;
                const userType = user?.user?.userType;

                if (!userId || userType !== "vendor") {
                    toast.error("Access Denied: User not authorized or ID missing.");
                    setIsLoading(false);
                    return;
                }

                const response = await getAllShops();
                const allShops = response.data.shops;
                const vendorShop = allShops.find((shop) => String(shop.owner) === String(userId));

                if (vendorShop) {
                    setShopId(vendorShop._id);
                    await fetchReviews(1, vendorShop._id);
                } else {
                    toast.error("No shop found for your vendor account. Please create one.");
                    setShopId(null);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Failed to initialize ReviewsPage (fetch shop or initial reviews):", error);
                const errorMessage = error.response?.data?.message || "Unable to load page data.";
                toast.error(errorMessage);
                setShopId(null);
                setIsLoading(false);
            }
        };

        if (user) {
            initializeReviewsPage();
        } else {
            setIsLoading(false);
            setShopId(null);
        }
    }, [user, fetchReviews]);

    // Effect for handling pagination changes after initial load
    useEffect(() => {
        // Only fetch if shopId is available and page is not 1 (already fetched by initializeReviewsPage)
        if (shopId && !(currentPage === 1 && reviews.length > 0)) {
            fetchReviews(currentPage, shopId);
        }
    }, [shopId, currentPage, fetchReviews, reviews.length]);


    // Effect to filter reviews based on rating and search query
    useEffect(() => {
        let currentFiltered = [...reviews];

        if (filterRating !== "all") {
            currentFiltered = currentFiltered.filter(
                (review) => review.rating === parseInt(filterRating)
            );
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            currentFiltered = currentFiltered.filter(
                (review) =>
                    review.title.toLowerCase().includes(query) ||
                    review.content.toLowerCase().includes(query) ||
                    review.user.name.toLowerCase().includes(query)
            );
        }
        setFilteredReviews(currentFiltered);
    }, [reviews, filterRating, searchQuery]);

    const handleReplyClick = (review) => {
        setSelectedReview(review);
        setIsReplyModalOpen(true);
    };

    const handleReplySubmit = async (reviewId, content) => {
        if (!shopId) {
            toast.error("Shop ID is missing. Cannot submit reply.");
            console.error("Attempted to submit reply without shopId.");
            return;
        }

        try {
            // Pass the shopId along with reviewId and content
            await replyToReview(reviewId, { content, shopId }); // <--- MODIFIED HERE
            toast.success("Reply submitted successfully!");
            setIsReplyModalOpen(false);
            // Re-fetch reviews to show the newly added/updated reply
            await fetchReviews(currentPage, shopId);
        } catch (error) {
            console.error("Error submitting reply:", error);
            const errorMessage = error.response?.data?.message || "Failed to submit reply due to an unexpected error.";
            toast.error(errorMessage);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <FaStar
                    key={i}
                    className={i <= rating ? "text-[#d0a189]" : "text-gray-300"}
                />
            );
        }
        return <div className="flex items-center space-x-0.5">{stars}</div>;
    };

    return (
        <div className="bg-[#fef4ea] min-h-screen py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-[#a38772] mb-6">
                    Manage Reviews
                </h1>

                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
                        <div className="relative flex-grow">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search reviews by title, content, or customer name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
                            />
                        </div>

                        <div className="flex items-center">
                            <FaFilter className="text-gray-400 mr-2" />
                            <select
                                value={filterRating}
                                onChange={(e) => setFilterRating(e.target.value)}
                                className="pl-2 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
                            >
                                <option value="all">All Ratings</option>
                                <option value="5">5 Stars</option>
                                <option value="4">4 Stars</option>
                                <option value="3">3 Stars</option>
                                <option value="2">2 Stars</option>
                                <option value="1">1 Star</option>
                            </select>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-8">
                            <LoadingSpinner />
                            <p className="text-gray-500 mt-2">Loading reviews...</p>
                        </div>
                    ) : filteredReviews.length > 0 ? (
                        <div className="space-y-6">
                            {filteredReviews.map((review) => (
                                <div
                                    key={review._id}
                                    className="border border-gray-200 rounded-lg p-4 shadow-sm"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center">
                                            <img
                                                src={
                                                    review.user.profilePicture ||
                                                    "https://via.placeholder.com/40"
                                                }
                                                alt={review.user.name}
                                                className="w-10 h-10 rounded-full mr-3 object-cover"
                                            />
                                            <div>
                                                <p className="font-semibold text-lg text-gray-800">
                                                    {review.user.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {moment(review.createdAt).format("MMM D,YYYY")}
                                                </p>
                                            </div>
                                        </div>
                                        {renderStars(review.rating)}
                                    </div>
                                    <h3 className="text-xl font-bold text-[#a38772] mb-2">
                                        {review.title}
                                    </h3>
                                    <p className="text-gray-700 mb-3">{review.content}</p>

                                    {review.media && review.media.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {review.media.map((imageUrl, index) => (
                                                <img
                                                    key={index}
                                                    src={imageUrl}
                                                    alt={`Review media ${index + 1}`}
                                                    className="w-20 h-20 object-cover rounded-md border border-gray-200"
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {review.ownerResponse ? (
                                        <div className="mt-4 p-3 bg-[#fef4ea] border-l-4 border-[#d0a189] rounded-r-md">
                                            <p className="font-semibold text-[#a38772] mb-1">
                                                Your Reply:
                                            </p>
                                            <p className="text-gray-700 italic">
                                                {review.ownerResponse.content}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Replied on{" "}
                                                {moment(review.ownerResponse.createdAt).format(
                                                    "MMM D,YYYY"
                                                )}
                                            </p>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleReplyClick(review)}
                                            className="mt-4 px-4 py-2 bg-[#d0a189] text-white rounded-lg hover:bg-[#b99160] transition flex items-center"
                                        >
                                            <FaReply className="mr-2" /> Reply to Review
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>No reviews found for your shop yet.</p>
                            <p className="mt-2">
                                Encourage your customers to leave feedback!
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center mt-8 space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border rounded-lg bg-white text-[#d0a189] disabled:opacity-50"
                            >
                                Previous
                            </button>
                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => handlePageChange(index + 1)}
                                    className={`px-4 py-2 border rounded-lg ${
                                        currentPage === index + 1
                                            ? "bg-[#d0a189] text-white"
                                            : "bg-white text-[#a38772] hover:bg-[#fef4ea]"
                                    }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border rounded-lg bg-white text-[#d0a189] disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Reply Review Modal */}
            {selectedReview && (
                <ReplyReviewModal
                    isOpen={isReplyModalOpen}
                    onClose={() => setIsReplyModalOpen(false)}
                    review={selectedReview}
                    onReplySubmit={handleReplySubmit}
                />
            )}
        </div>
    );
};

export default ReviewsPage;