import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import toast from "react-hot-toast";
import {
  FaStar,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaHeart,
  FaRegHeart,
  FaShare,
  FaCalendarAlt,
  FaGlobe,
} from "react-icons/fa";

import { getShopById, toggleFavoriteShop } from "../services/shopService";
import { getShopReviews } from "../services/reviewService";
import { getShopServices } from "../services/serviceService";
import { useAuth } from "../context/AuthContext";
import ReviewItem from "../components/shop/ReviewItem";
import ServiceCard from "../components/shop/ServiceCard";
import AppointmentBookingModal from "../components/shop/AppointmentBookingModal";
import ShopMap from "../components/shop/ShopMap";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";

const ShopDetailPage = () => {
  const { shopId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [services, setServices] = useState([]);
  const [servicesByCategory, setServicesByCategory] = useState({});
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Fetch shop data
  useEffect(() => {
    const fetchShopData = async () => {
      setIsLoading(true);
      setError(null); // Clear previous errors before a new fetch attempt

      try {
        const shopResponse = await getShopById(shopId);
        setShop(shopResponse.data);
        setIsFavorite(shopResponse.data.isFavorite);

        const servicesResponse = await getShopServices(shopId);
        setServices(servicesResponse.data.services);
        setServicesByCategory(servicesResponse.data.servicesByCategory);

        const reviewsResponse = await getShopReviews(shopId);
        setReviews(reviewsResponse.data.reviews);

        setIsLoading(false);
        // console.log("All shop data fetching complete."); // Keep for debugging if needed
      } catch (error) {
        console.error("Error fetching shop data:", error);

        let userMessage =
          "An unexpected error occurred while fetching shop data. Please try again later.";

        if (error.response) {
          console.error("Error Response (from server):", error.response);

          switch (error.response.status) {
            case 403:
              userMessage =
                error.response.data.message ||
                "Access to this shop's details is restricted. It might be private or require specific permissions.";
              break;
            case 404:
              userMessage =
                "This shop could not be found. It might have been removed or the link is incorrect.";
              break;
            case 500:
              userMessage =
                "We're experiencing server issues. Please try again in a few moments.";
              break;
            default:
              userMessage = `Failed to load shop data: ${
                error.response.data.message ||
                `Status ${error.response.status} Server Error`
              }. Please try again later.`;
          }
        } else if (error.request) {
          console.error("Error Request (No response received):", error.request);
          userMessage =
            "Could not connect to the server. Please check your internet connection and try again.";
        } else {
          console.error("Error Message (Request setup issue):", error.message);
          userMessage =
            "An unexpected error occurred while setting up the request. Please try again.";
        }
        setError(userMessage);
        setIsLoading(false);
      }
    };

    fetchShopData();

    // GSAP Animations (remain as is, they are fine)
    gsap.from(".shop-header", {
      y: -50,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    });

    gsap.from(".shop-info", {
      y: 30,
      opacity: 0,
      duration: 0.8,
      delay: 0.3,
      ease: "power3.out",
    });
  }, [shopId]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add shops to favorites");
      navigate("/login");
      return;
    }

    try {
      await toggleFavoriteShop(shopId);
      setIsFavorite(!isFavorite);
      toast.success(
        isFavorite ? "Removed from favorites" : "Added to favorites"
      );
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorites. Please try again.");
    }
  };

  const handleShareClick = () => {
    if (navigator.share) {
      navigator
        .share({
          title: shop?.name || "Shop Details", // Fallback for shop name
          text: `Check out ${shop?.name || "this shop"} on Beauty & Wellness Booking Platform`, // Fallback for shop name
          url: window.location.href,
        })
        .catch((err) => {
          console.error("Error sharing:", err);
          // Fallback to copy to clipboard if share fails or is not supported
          navigator.clipboard.writeText(window.location.href);
          toast.success("Link copied to clipboard!");
        });
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleBookService = (service = null) => { // Allow null for general booking from sidebar
    if (!isAuthenticated) {
      toast.error("Please login to book appointments");
      navigate("/login");
      return;
    }

    setSelectedService(service); // Set the specific service if provided, otherwise null
    setIsBookingModalOpen(true);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!shop) {
    return (
      <ErrorMessage message="Shop data is not available. Please try again or check the URL." />
    );
  }

  // Safely access ratings with fallback
  const averageRating = shop.ratings?.average !== undefined ? shop.ratings.average : 0;
  const reviewCount = shop.ratings?.count !== undefined ? shop.ratings.count : 0;

  return (
    <div className="bg-[#fef4ea] min-h-screen">
      {/* Shop Header */}
      <div className="relative shop-header">
        <div className="h-64 md:h-80 overflow-hidden">
          <img
            src={shop.gallery?.[0]?.url || "https://via.placeholder.com/1200x300?text=Shop+Image"} // Fallback image
            alt={shop?.name || "Shop Image"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        </div>

        <div className="container mx-auto px-4">
          <div className="relative -mt-20 bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden border-4 border-white shadow-md -mt-16 md:-mt-24 mb-4 md:mb-0 md:mr-6">
                <img
                  src={shop.logoUrl || shop.gallery?.[0]?.url || "https://via.placeholder.com/150?text=Logo"} // Fallback logo
                  alt={shop?.name || "Shop Logo"}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-grow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#a38772]">
                      {shop?.name}
                    </h1>
                    <p className="text-gray-600 mb-2">{shop.category || "N/A"}</p>

                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400 mr-2">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>
                            {i < Math.floor(averageRating) ? (
                              <FaStar />
                            ) : i < Math.ceil(averageRating) ? (
                              <FaStar className="opacity-50" />
                            ) : (
                              <FaStar className="opacity-25" />
                            )}
                          </span>
                        ))}
                      </div>
                      <span className="text-[#a38772] font-semibold">
                        {averageRating.toFixed(1)}
                      </span>
                      <span className="text-gray-500 ml-1">
                        ({reviewCount} reviews)
                      </span>
                    </div>

                    {shop.address && (
                      <div className="flex items-center text-gray-600">
                        <FaMapMarkerAlt className="mr-2" />
                        <span>
                          {shop.address.street}, {shop.address.city},{" "}
                          {shop.address.state}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex mt-4 md:mt-0">
                    <button
                      onClick={handleToggleFavorite}
                      className="flex items-center justify-center bg-white border border-[#a38772] text-[#a38772] py-2 px-4 rounded-lg mr-2 hover:bg-[#fef4ea] transition-colors"
                    >
                      {isFavorite ? <FaHeart /> : <FaRegHeart />}
                      <span className="ml-2">Favorite</span>
                    </button>

                    <button
                      onClick={handleShareClick}
                      className="flex items-center justify-center bg-white border border-[#a38772] text-[#a38772] py-2 px-4 rounded-lg hover:bg-[#fef4ea] transition-colors"
                    >
                      <FaShare />
                      <span className="ml-2">Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shop Content */}
      <div className="container mx-auto px-4 pb-16 shop-info">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs className="mb-8">
              <TabList className="flex bg-white rounded-t-lg overflow-hidden">
                <Tab
                  className="flex-1 py-3 px-4 text-center cursor-pointer border-b-2 border-transparent hover:bg-[#fef4ea] transition-colors focus:outline-none"
                  selectedClassName="border-[#a38772] bg-[#fef4ea] font-semibold text-[#a38772]"
                >
                  Services
                </Tab>
                <Tab
                  className="flex-1 py-3 px-4 text-center cursor-pointer border-b-2 border-transparent hover:bg-[#fef4ea] transition-colors focus:outline-none"
                  selectedClassName="border-[#a38772] bg-[#fef4ea] font-semibold text-[#a38772]"
                >
                  Gallery
                </Tab>
                <Tab
                  className="flex-1 py-3 px-4 text-center cursor-pointer border-b-2 border-transparent hover:bg-[#fef4ea] transition-colors focus:outline-none"
                  selectedClassName="border-[#a38772] bg-[#fef4ea] font-semibold text-[#a38772]"
                >
                  Reviews{" "}
                  <span className="text-sm">({reviewCount})</span>
                </Tab>
                <Tab
                  className="flex-1 py-3 px-4 text-center cursor-pointer border-b-2 border-transparent hover:bg-[#fef4ea] transition-colors focus:outline-none"
                  selectedClassName="border-[#a38772] bg-[#fef4ea] font-semibold text-[#a38772]"
                >
                  About
                </Tab>
              </TabList>

              {/* Services Tab */}
              <TabPanel>
                <div className="bg-white rounded-b-lg p-6">
                  <h2 className="text-xl font-bold text-[#a38772] mb-6">
                    Our Services
                  </h2>

                  {Object.keys(servicesByCategory).length > 0 ? (
                    Object.keys(servicesByCategory).map((category) => (
                      <div key={category} className="mb-8">
                        <h3 className="text-lg font-semibold text-[#a38772] mb-4 pb-2 border-b border-[#ecdfcf]">
                          {category}
                        </h3>

                        <div className="space-y-4">
                          {servicesByCategory[category].map((service) => (
                            <ServiceCard
                              key={service._id}
                              service={service}
                              onBookNow={() => handleBookService(service)}
                            />
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No services available at the moment.
                    </p>
                  )}
                </div>
              </TabPanel>

              {/* Gallery Tab */}
              <TabPanel>
                <div className="bg-white rounded-b-lg p-6">
                  <h2 className="text-xl font-bold text-[#a38772] mb-6">
                    Gallery
                  </h2>

                  {shop.gallery && shop.gallery.length > 0 ? (
                    <div className="gallery-grid">
                      <Swiper
                        slidesPerView={1}
                        spaceBetween={10}
                        navigation={true}
                        pagination={{ clickable: true }}
                        breakpoints={{
                          640: { slidesPerView: 2, spaceBetween: 20 },
                          1024: { slidesPerView: 3, spaceBetween: 20 },
                        }}
                        modules={[Navigation, Pagination]}
                        className="gallery-swiper"
                      >
                        {shop.gallery.map((item, index) => (
                          <SwiperSlide key={index}>
                            <div className="h-64 rounded-lg overflow-hidden">
                              <img
                                src={item.url}
                                alt={
                                  item.caption || `Gallery image ${index + 1}`
                                }
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No gallery images available.
                    </p>
                  )}
                </div>
              </TabPanel>

              {/* Reviews Tab */}
              <TabPanel>
                <div className="bg-white rounded-b-lg p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <h2 className="text-xl font-bold text-[#a38772]">
                      Customer Reviews
                    </h2>

                    <Link
                      to={
                        isAuthenticated
                          ? `/shop/${shopId}/write-review`
                          : "/login"
                      }
                      className="mt-2 md:mt-0 inline-block bg-[#a38772] hover:bg-[#ecdfcf] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                      onClick={(e) => {
                        if (!isAuthenticated) {
                          e.preventDefault(); // Prevent default navigation
                          toast.error("Please login to write a review");
                          navigate("/login");
                        }
                      }}
                    >
                      Write a Review
                    </Link>
                  </div>

                  <div className="flex flex-col md:flex-row bg-[#fef4ea] rounded-lg p-4 mb-6">
                    <div className="md:w-1/4 mb-4 md:mb-0 flex flex-col items-center justify-center">
                      <div className="text-5xl font-bold text-[#a38772]">
                        {averageRating.toFixed(1)}
                      </div>
                      <div className="flex text-yellow-400 my-2">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>
                            {i < Math.floor(averageRating) ? (
                              <FaStar />
                            ) : i < Math.ceil(averageRating) ? (
                              <FaStar className="opacity-50" />
                            ) : (
                              <FaStar className="opacity-25" />
                            )}
                          </span>
                        ))}
                      </div>
                      <div className="text-gray-600">
                        Based on {reviewCount} reviews
                      </div>
                    </div>

                    <div className="md:w-3/4 md:pl-6">
                      {/* Rating Bars */}
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = reviews.filter(
                          (r) => Math.floor(r.rating) === rating
                        ).length;
                        const percentage =
                          reviewCount > 0
                            ? (count / reviewCount) * 100
                            : 0;

                        return (
                          <div key={rating} className="flex items-center mb-2">
                            <div className="flex items-center w-12">
                              <span className="text-sm font-medium text-gray-600">
                                {rating}
                              </span>
                              <FaStar className="ml-1 text-yellow-400 text-sm" />
                            </div>
                            <div className="flex-grow mx-3 h-4 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#a38772]"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <div className="w-12 text-right text-sm text-gray-600">
                              {count}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-6">
                    {reviews.length > 0 ? (
                      reviews.map((review) => (
                        <ReviewItem key={review._id} review={review} />
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        No reviews yet. Be the first to share your experience!
                      </p>
                    )}
                  </div>

                  {reviews.length > 0 && (
                    <div className="text-center mt-6">
                      <Link
                        to={`/shop/${shopId}/reviews`}
                        className="inline-block bg-white border border-[#a38772] text-[#a38772] font-semibold py-2 px-6 rounded-lg hover:bg-[#fef4ea] transition-colors"
                      >
                        View All Reviews
                      </Link>
                    </div>
                  )}
                </div>
              </TabPanel>

              {/* About Tab */}
              <TabPanel>
                <div className="bg-white rounded-b-lg p-6">
                  <h2 className="text-xl font-bold text-[#a38772] mb-6">
                    About Us
                  </h2>

                  <div className="mb-6">
                    <p className="text-gray-700 mb-4">
                      {shop.description || "No description available."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-[#a38772] mb-4">
                        Contact Information
                      </h3>

                      <ul className="space-y-3">
                        {shop.address && (
                          <li className="flex items-start">
                            <FaMapMarkerAlt className="text-[#a38772] mt-1 mr-3" />
                            <div>
                              <p className="text-gray-700">
                                {shop.address.street}
                                <br />
                                {shop.address.city}, {shop.address.state}{" "}
                                {shop.address.zipCode}
                              </p>
                            </div>
                          </li>
                        )}

                        {shop.contactInfo?.phone && (
                          <li className="flex items-center">
                            <FaPhone className="text-[#a38772] mr-3" />
                            <a
                              href={`tel:${shop.contactInfo.phone}`}
                              className="text-gray-700 hover:text-[#a38772]"
                            >
                              {shop.contactInfo.phone}
                            </a>
                          </li>
                        )}

                        {shop.contactInfo?.email && (
                          <li className="flex items-center">
                            <FaEnvelope className="text-[#a38772] mr-3" />
                            <a
                              href={`mailto:${shop.contactInfo.email}`}
                              className="text-gray-700 hover:text-[#a38772]"
                            >
                              {shop.contactInfo.email}
                            </a>
                          </li>
                        )}

                        {shop.contactInfo?.website && (
                          <li className="flex items-center">
                            <FaGlobe className="text-[#a38772] mr-3" />
                            <a
                              href={shop.contactInfo.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-700 hover:text-[#a38772]"
                            >
                              {shop.contactInfo.website}
                            </a>
                          </li>
                        )}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-[#a38772] mb-4">
                        Business Hours
                      </h3>

                      <ul className="space-y-2">
                        {shop.operatingHours && shop.operatingHours.length > 0 ? (
                          shop.operatingHours.map((hours) => (
                            <li key={hours.day} className="flex items-start">
                              <FaClock className="text-[#a38772] mt-1 mr-3" />
                              <div>
                                <span className="text-gray-700 w-24 inline-block font-medium">
                                  {hours.day}
                                </span>
                                {hours.isClosed ? (
                                  <span className="text-red-500">Closed</span>
                                ) : (
                                  <span className="text-gray-700">
                                    {hours.open} - {hours.close}
                                  </span>
                                )}
                              </div>
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500">Hours not available</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </TabPanel>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Book Appointment Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-[#a38772] mb-4">
                Book an Appointment
              </h3>

              <p className="text-gray-600 mb-4">
                Select a service from our menu and book your appointment at a
                time that suits you.
              </p>

              <button
                onClick={() => handleBookService()} // Call without arguments for general booking
                className="w-full flex items-center justify-center bg-[#a38772] hover:bg-[#ecdfcf] text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                <FaCalendarAlt className="mr-2" />
                Book Now
              </button>
            </div>

            {/* Map Card */}
            {shop.address?.coordinates?.lat && shop.address?.coordinates?.lng && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-[#a38772] mb-4">
                  Location
                </h3>

                <div className="h-64 rounded-lg overflow-hidden mb-4">
                  <ShopMap
                    location={shop.address.coordinates}
                    name={shop?.name}
                    address={`${shop.address.street}, ${shop.address.city}`}
                  />
                </div>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${shop.address.coordinates.lat},${shop.address.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full block text-center bg-white border border-[#a38772] text-[#a38772] font-semibold py-2 px-4 rounded-lg hover:bg-[#fef4ea] transition-colors"
                >
                  Get Directions
                </a>
              </div>
            )}


            {/* Business Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-[#a38772] mb-4">
                Business Info
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-[#a38772]">Category</h4>
                  <p className="text-gray-600">{shop.category || "N/A"}</p>
                </div>

                {shop.tags && shop.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium text-[#a38772]">Tags</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {shop.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block bg-[#fef4ea] text-[#a38772] text-sm px-3 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {shop.createdAt && (
                  <div>
                    <h4 className="font-medium text-[#a38772]">Established</h4>
                    <p className="text-gray-600">
                      {new Date(shop.createdAt).getFullYear()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <AppointmentBookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          shop={shop}
          service={selectedService} // Will be null if booked from sidebar, specific service if from card
          services={services} // Pass all services for general booking
        />
      )}
    </div>
  );
};

export default ShopDetailPage;