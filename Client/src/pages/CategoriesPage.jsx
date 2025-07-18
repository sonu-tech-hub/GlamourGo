// client/src/pages/CategoriesPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import image1 from "../assets/images/image1.jpg";
import image2 from "../assets/images/image2.jpg";
import image3 from "../assets/images/image3.jpg";
import image4 from "../assets/images/image4.jpg";
import image5 from "../assets/images/image5.jpg";
import image6 from "../assets/images/image6.jpg";

// Import Fa icons
import {
  FaCut,
  FaSpa,
  FaDumbbell,
  FaPaintBrush,
  FaMusic,
  FaMapMarkerAlt,
  FaStar,
} from "react-icons/fa";

// Import GrYoga icon
import { GrYoga } from "react-icons/gr";

import toast from "react-hot-toast";

import api from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredShops, setFeaturedShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const categoriesData = [
        {
          id: "salon",
          name: "Hair Salons & Parlours",
          icon: <FaCut className="text-4xl" />,
          description: "Haircuts, styling, coloring, and beauty treatments",
          color: "bg-pink-500",
          image: image1, // Corrected: Directly use the imported image variable
        },
        {
          id: "spa",
          name: "Spas & Massage Centers",
          icon: <FaSpa className="text-4xl" />,
          description: "Relaxation, therapy, and rejuvenation treatments",
          color: "bg-purple-500",
          image: image2, // Corrected
        },
        {
          id: "gym",
          name: "Gyms & Fitness Centers",
          icon: <FaDumbbell className="text-4xl" />,
          description: "Personal training, workouts, and fitness classes",
          color: "bg-blue-500",
          image: image3, // Corrected
        },
        {
          id: "yoga",
          name: "Yoga & Meditation",
          icon: <GrYoga className="text-4xl" />, // Corrected: Using GrYoga
          description: "Yoga classes, meditation, and wellness programs",
          color: "bg-green-500",
          image: image4, // Corrected
        },
        {
          id: "tattoo",
          name: "Tattoo & Nail Art",
          icon: <FaPaintBrush className="text-4xl" />,
          description: "Tattoos, nail art, and other body modifications",
          color: "bg-red-500",
          image: image5, // Corrected
        },
        {
          id: "dance",
          name: "Dance Academies",
          icon: <FaMusic className="text-4xl" />,
          description: "Dance classes and choreography training",
          color: "bg-yellow-500",
          image: image6, // Corrected
        },
      ];

      setCategories(categoriesData);

      // Fetch featured shops
      const featuredResponse = await api.get("/shops/featured");
      // Add safe navigation in case data is null/undefined
      setFeaturedShops(featuredResponse?.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load categories or featured shops");
      // Ensure state is an empty array on error
      setCategories([]);
      setFeaturedShops([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#fef4ea]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-[#fef4ea] min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#a38772] mb-6">
          Browse Categories
        </h1>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/shops?category=${category.id}`}
              className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-40 bg-gray-200 relative overflow-hidden">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div
                    className={`w-full h-full flex items-center justify-center ${category.color} text-white`}
                  >
                    {/* Ensure category.icon is a valid React element */}
                    {React.isValidElement(category.icon) ? category.icon : null}
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white font-bold text-lg">
                    View Shops
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h2 className="text-xl font-semibold text-[#a38772] mb-2">
                  {category.name}
                </h2>
                <p className="text-gray-600 mb-3">{category.description}</p>
                <div className="text-right">
                  <span className="inline-block bg-[#fef4ea] text-[#d0a189] px-3 py-1 rounded-full text-sm font-medium">
                    Browse {category.name}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Featured Shops */}
        {featuredShops && featuredShops.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#a38772] mb-6">
              Featured Shops
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredShops.map((shop) => (
                <Link
                  key={shop._id}
                  to={`/shop/${shop._id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-48 relative overflow-hidden">
                    {/* Added safe navigation for gallery */}
                    {shop.gallery && shop.gallery.length > 0 ? (
                      <img
                        src={
                          shop.gallery[0]?.url ||
                          "/images/default-placeholder.jpg"
                        } // Added fallback image and safer access
                        alt={shop.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-4xl">
                        <FaSpa /> {/* Default icon if no image */}
                      </div>
                    )}

                    <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded-full text-xs font-medium text-[#a38772]">
                      {/* Added check for category existence */}
                      {shop.category
                        ? shop.category.charAt(0).toUpperCase() +
                          shop.category.slice(1)
                        : "Shop"}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-[#a38772] truncate">
                        {shop.name || "Unnamed Shop"} {/* Added fallback */}
                      </h3>

                      <div className="flex items-center bg-[#fef4ea] text-[#d0a189] px-2 py-1 rounded text-sm">
                        <FaStar className="mr-1" />
                        {/* Added safe navigation for ratings */}
                        <span>
                          {shop.ratings?.average?.toFixed(1) || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start mb-3">
                      <FaMapMarkerAlt className="text-gray-400 mt-1 mr-1 flex-shrink-0" />
                      {/* Added safe navigation for address parts */}
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {shop.address
                          ? `${shop.address.street || ""}, ${shop.address.city || ""}, ${shop.address.state || ""}`
                          : "Address not available"}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="inline-block bg-[#d0a189] text-white px-3 py-1 rounded-full text-sm font-medium">
                        View Details
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Popular Services */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-[#a38772] mb-6">
            Popular Services
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-[#fef4ea] text-[#d0a189] rounded-full mb-4">
                <FaCut className="text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-[#a38772] mb-2">
                Haircut & Styling
              </h3>
              <p className="text-gray-600 mb-3">
                Professional haircuts, styling, and hair treatments for all hair
                types
              </p>
              <Link
                to="/shops?query=haircut"
                className="text-[#d0a189] hover:underline font-medium"
              >
                Find Services
              </Link>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-[#fef4ea] text-[#d0a189] rounded-full mb-4">
                <FaSpa className="text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-[#a38772] mb-2">
                Full Body Massage
              </h3>
              <p className="text-gray-600 mb-3">
                Relaxing massages to relieve stress and tension in your body
              </p>
              <Link
                to="/shops?query=massage"
                className="text-[#d0a189] hover:underline font-medium"
              >
                Find Services
              </Link>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-[#fef4ea] text-[#d0a189] rounded-full mb-4">
                <GrYoga className="text-2xl" /> {/* Changed from FaYoga */}
              </div>
              <h3 className="text-lg font-semibold text-[#a38772] mb-2">
                Yoga & Meditation
              </h3>
              <p className="text-gray-600 mb-3">
                Find peace and balance with yoga and meditation classes
              </p>
              <Link
                to="/shops?query=yoga"
                className="text-[#d0a189] hover:underline font-medium"
              >
                Find Services
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
