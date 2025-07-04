// pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// --- Swiper Imports ---
// Import Swiper styles first
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay'; // Make sure this is needed for your version

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import required modules (Corrected)
import { Pagination, Autoplay } from 'swiper/modules';
// --- End Swiper Imports ---

// --- React Icons Import (Corrected & Uncommented) ---
// Import Fa icons
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaCut, FaSpa, FaDumbbell, FaPaintBrush } from 'react-icons/fa';
// Import GrYoga icon
import { GrYoga } from "react-icons/gr"; // GrYoga is correctly imported here
// --- End React Icons Import ---

import { getPopularShops, getFeaturedShops } from '../services/shopService';
console.log('featured shops service:', getPopularShops());
// images 
import  BG from '../assets/images/bg.jpg'
import test1 from '../assets/images/testmonial1.jpg';
import test2 from '../assets/images/testmonial4.jpg';
import test3 from '../assets/images/testmonial3.jpg';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
  const [popularShops, setPopularShops] = useState([]);
  const [featuredShops, setFeaturedShops] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch shops data
    const fetchShops = async () => {
      try {
        const popularData = await getPopularShops();
        const featuredData = await getFeaturedShops();

        // Ensure data exists before setting state
        setPopularShops(popularData?.data || []);
        setFeaturedShops(featuredData?.data || []);
      } catch (error) {
        console.error('Error fetching shops:', error);
        // Optionally set shops to empty arrays on error
        setPopularShops([]);
        setFeaturedShops([]);
      }
    };

    fetchShops();

    // Animations
    // Hero section animation
    gsap.from('.hero-content', {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    });
    gsap.to('.hero-content', {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: 'power3.out'
    });

    // Category cards animation
    gsap.from('.category-card', {
      y: 50,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8,
      scrollTrigger: {
        trigger: '.categories-section',
        start: 'top 80%'
      }
    });
    gsap.to('.category-card', {
      y: 0,
      opacity: 1,
      stagger: 0.1,
      duration: 0.8,
      scrollTrigger: {
        trigger: '.categories-section',
        start: 'top 80%'
      }   
    });

    // How it works animation
    gsap.from('.steps-item', {
      x: -50,
      opacity: 0,
      stagger: 0.2,
      duration: 0.8,
      scrollTrigger: {
        trigger: '.how-it-works',
        start: 'top 70%'
      }
    });
    gsap.to('.steps-item', {
      x: 0,
      opacity: 1,
      stagger: 0.2,
      duration: 0.8,
      scrollTrigger: {
        trigger: '.how-it-works',
        start: 'top 70%'
      }
    });
      

    // Featured shops animation
    gsap.from('.featured-heading', {
      y: 30,
      opacity: 0,
      duration: 0.8,
      scrollTrigger: {
        trigger: '.featured-section',
        start: 'top 80%'
      }
    });
    gsap.to('.featured-shop', {
      y: 0, 
      opacity: 1,
      stagger: 0.2,
      duration: 0.8,
      scrollTrigger: {
        trigger: '.featured-section',
        start: 'top 80%'
      }
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();

    const queryParams = new URLSearchParams();

    if (searchQuery) {
      queryParams.append('query', searchQuery);
    }

    if (location) {
      queryParams.append('location', location);
    }

    navigate(`/shops?${queryParams.toString()}`);
  };

  

  return (
    <div className="bg-[#fef4ea]">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={BG} // Ensure this path is correct
            alt="Beauty & Wellness"
            className="w-full h-full object-cover opacity-20"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center hero-content">
            <h1 className="text-4xl md:text-5xl font-bold text-[#a38772] mb-6">
              Book Beauty, Wellness & Fitness Services
            </h1>

            <p className="text-lg md:text-xl text-[#a38772] mb-8">
              Find and book appointments with top beauty salons, spas, fitness centers
              and wellness services near you.
            </p>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#a38772]" />
                  <input
                    type="text"
                    placeholder="Search for salon, spa, service..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    // Check color code: focus:border-[#d0a189] ?
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-[#b0b098] focus:outline-none focus:border-[#d0a189]"
                  />
                </div>

                <div className="flex-1 relative">
                  <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#a38772]" />
                  <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    // Check color code: focus:border-[#d0a189] ?
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-[#b0b098] focus:outline-none focus:border-[#d0a189]"
                  />
                </div>

                <button
                  type="submit"
                  // Check color codes: bg-[#d0a189] hover:bg-[#ecdfcf] ?
                  className="bg-[#d0a189] hover:bg-[#ecdfcf] text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 categories-section">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#a38772] mb-12">
            Browse by Category
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Check color codes in gradients: from-[#d0a189] to-[#ecdfcf] ? */}
            <Link to="/shops?category=salon" className="category-card bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <div className="h-40 flex items-center justify-center bg-gradient-to-r from-[#d0a189] to-[#ecdfcf]">
                <FaCut className="text-white text-5xl" />
              </div>
              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-[#a38772]">Hair Salons</h3>
                <p className="text-sm text-gray-500 mt-1">Haircuts, Styling, Coloring</p>
              </div>
            </Link>

            <Link to="/shops?category=spa" className="category-card bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <div className="h-40 flex items-center justify-center bg-gradient-to-r from-[#d0a189] to-[#ecdfcf]">
                <FaSpa className="text-white text-5xl" />
              </div>
              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-[#a38772]">Spas & Massage</h3>
                <p className="text-sm text-gray-500 mt-1">Relaxation, Therapy, Beauty Treatments</p>
              </div>
            </Link>

            <Link to="/shops?category=gym" className="category-card bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <div className="h-40 flex items-center justify-center bg-gradient-to-r from-[#d0a189] to-[#ecdfcf]">
                <FaDumbbell className="text-white text-5xl" />
              </div>
              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-[#a38772]">Fitness & Gyms</h3>
                <p className="text-sm text-gray-500 mt-1">Personal Training, Classes, Workouts</p>
              </div>
            </Link>

            <Link to="/shops?category=yoga" className="category-card bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <div className="h-40 flex items-center justify-center bg-gradient-to-r from-[#d0a189] to-[#ecdfcf]">
                {/* --- Icon Changed Here --- */}
                <GrYoga className="text-white text-5xl" />
                {/* --- End Icon Change --- */}
              </div>
              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-[#a38772]">Yoga & Wellness</h3>
                <p className="text-sm text-gray-500 mt-1">Yoga Classes, Meditation, Wellness Programs</p>
              </div>
            </Link>
          </div>

          <div className="text-center mt-10">
            <Link
              to="/categories"
              // Check color code: hover:bg-[#d0a189] ?
              className="inline-block bg-[#a38772] hover:bg-[#d0a189] text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300"
            >
              View All Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Shops Section */}
      <section className="py-16 bg-white featured-section">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#a38772] mb-4 featured-heading">
            Featured Businesses
          </h2>
          <p className="text-center text-gray-600 mb-12 featured-heading">
            Discover top-rated beauty and wellness services in your area
          </p>

          {/* Check if featuredShops array might be empty initially */}
          {featuredShops && featuredShops.length > 0 ? (
            <Swiper
              slidesPerView={1}
              spaceBetween={20}
              pagination={{ clickable: true }}
              autoplay={{ delay: 5000 }}
              modules={[Pagination, Autoplay]} // Correctly imported modules
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 }
              }}
              className="featured-shops-swiper"
            >
              {featuredShops.map(shop => (
                <SwiperSlide key={shop._id}>
                  <div className="bg-[#fef4ea] rounded-lg overflow-hidden shadow-md">
                    <img
                      src={shop.gallery?.[0]?.url || '/images/default-shop.jpg'} // Added safe navigation for gallery
                      alt={shop.name}
                      className="w-full h-48 object-cover"
                    />

                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-[#a38772]">{shop.name}</h3>
                        {/* Check color code: bg-[#d0a189] ? */}
                        {/* Also ensure shop.ratings exists and has average */}
                        <div className="flex items-center bg-[#d0a189] text-white px-2 py-1 rounded text-sm">
                          <span className="mr-1">{shop.ratings?.average?.toFixed(1) || 'N/A'}</span>
                          <span>★</span>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-3">{shop.category}</p>

                      <p className="text-sm text-gray-500 mb-4">
                        {/* Added safe navigation for address */}
                        {shop.address?.city}, {shop.address?.state}
                      </p>

                      <Link
                        to={`/shop/${shop._id}`}
                        // Check color codes: bg-[#d0a189] hover:bg-[#ecdfcf] ?
                        className="block w-full bg-[#d0a189] hover:bg-[#ecdfcf] text-white text-center font-semibold py-2 rounded-lg transition-colors duration-300"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            // Optional: Display a loading message or placeholder if shops are not yet loaded
            <p className="text-center text-gray-600">Loading featured businesses...</p>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 how-it-works">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#a38772] mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="steps-item flex flex-col items-center text-center">
              {/* Check color code: bg-[#d0a189] ? */}
              <div className="w-20 h-20 flex items-center justify-center bg-[#d0a189] text-white rounded-full mb-6">
                <FaSearch className="text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-[#a38772] mb-3">Search</h3>
              <p className="text-gray-600">
                Find beauty, wellness, and fitness services near you based on your preferences.
              </p>
            </div>

            <div className="steps-item flex flex-col items-center text-center">
              {/* Check color code: bg-[#d0a189] ? */}
              <div className="w-20 h-20 flex items-center justify-center bg-[#d0a189] text-white rounded-full mb-6">
                <FaCalendarAlt className="text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-[#a38772] mb-3">Book</h3>
              <p className="text-gray-600">
                Select your preferred service, date, and time slot for your appointment.
              </p>
            </div>

            <div className="steps-item flex flex-col items-center text-center">
              {/* Check color code: bg-[#d0a189] ? */}
              <div className="w-20 h-20 flex items-center justify-center bg-[#d0a189] text-white rounded-full mb-6">
                <FaSpa className="text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-[#a38772] mb-3">Enjoy</h3>
              <p className="text-gray-600">
                Receive appointment confirmations and enjoy your professional services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#a38772] mb-4">
            Popular Services
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Explore the most booked services on our platform
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Check color code: bg-[#d0a189] ? */}
            <div className="bg-[#fef4ea] rounded-lg overflow-hidden shadow-md text-center p-6">
              <div className="w-16 h-16 flex items-center justify-center bg-[#d0a189] text-white rounded-full mx-auto mb-4">
                <FaCut className="text-2xl" />
              </div>
              <h3 className="font-semibold text-[#a38772] mb-2">Haircut & Styling</h3>
              <p className="text-sm text-gray-600">Starting from ₹500</p>
            </div>

            <div className="bg-[#fef4ea] rounded-lg overflow-hidden shadow-md text-center p-6">
              <div className="w-16 h-16 flex items-center justify-center bg-[#d0a189] text-white rounded-full mx-auto mb-4">
                <FaSpa className="text-2xl" />
              </div>
              <h3 className="font-semibold text-[#a38772] mb-2">Full Body Massage</h3>
              <p className="text-sm text-gray-600">Starting from ₹1200</p>
            </div>

            <div className="bg-[#fef4ea] rounded-lg overflow-hidden shadow-md text-center p-6">
              <div className="w-16 h-16 flex items-center justify-center bg-[#d0a189] text-white rounded-full mx-auto mb-4">
                <FaDumbbell className="text-2xl" />
              </div>
              <h3 className="font-semibold text-[#a38772] mb-2">Personal Training</h3>
              <p className="text-sm text-gray-600">Starting from ₹800</p>
            </div>

            <div className="bg-[#fef4ea] rounded-lg overflow-hidden shadow-md text-center p-6">
              <div className="w-16 h-16 flex items-center justify-center bg-[#d0a189] text-white rounded-full mx-auto mb-4">
                <FaPaintBrush className="text-2xl" />
              </div>
              <h3 className="font-semibold text-[#a38772] mb-2">Nail Art</h3>
              <p className="text-sm text-gray-600">Starting from ₹600</p>
            </div>
          </div>
        </div>
      </section>

      {/* App Promotion Section */}
      {/* Check color codes: from-[#d0a189] to-[#ecdfcf] ? */}
      <section className="py-16 bg-gradient-to-r from-[#d0a189] to-[#ecdfcf] text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold mb-4">Get Our Mobile App</h2>
              <p className="text-lg mb-6">
                Book appointments, get notifications, and manage your bookings on the go with our mobile app.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Make sure these links point to valid App/Play store URLs */}
                <a href="#" className="inline-block">
                  <img src="/images/app-store.png" alt="App Store" className="h-12" />
                </a>
                <a href="#" className="inline-block">
                  <img src="/images/play-store.png" alt="Play Store" className="h-12" />
                </a>
              </div>
            </div>

            <div className="md:w-1/2">
              <img
                src="/images/app-mockup.png"
                alt="Mobile App"
                className="max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#a38772] mb-12">
            What Our Users Say
          </h2>

          {/* For testimonials, consider fetching dynamic data instead of hardcoding */}
          <Swiper
            slidesPerView={1}
            spaceBetween={30}
            pagination={{ clickable: true }}
            autoplay={{ delay: 6000 }}
            modules={[Pagination, Autoplay]} // Correctly imported modules
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 }
            }}
            className="testimonials-swiper"
          >
            {/* Example Static Testimonial Slide 1 */}
            <SwiperSlide>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <img
                      src={test2}                      alt="Testimonial"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#a38772]">Priya Sharma</h4>
                    <div className="flex text-yellow-400 text-sm">
                      <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">
                  "I had a great experience with this beauty salon. The staff was friendly and professional, and the services were top-notch. I highly recommend this salon for any beauty needs."
                </p>
              </div>
            </SwiperSlide>
            {/* Example Static Testimonial Slide 2 */}
            <SwiperSlide>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <img
                      src={test1}
                      alt="Testimonial"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#a38772]">Amit Kumar</h4>
                    <div className="flex text-yellow-400 text-sm">
                      <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">
                  "Booking through this platform was seamless. Found an excellent gym nearby and managing my schedule is now much easier."
                </p>
              </div>
            </SwiperSlide>
             {/* Example Static Testimonial Slide 3 */}
            <SwiperSlide>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <img
                     src={test3}
                      alt="Testimonial"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#a38772]">Neha Patel</h4>
                    <div className="flex text-yellow-400 text-sm">
                     <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">
                  "The spa I booked was fantastic! Great ambiance and service. The app is very user-friendly too."
                </p>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </section>
    </div>
  );
};

export default HomePage;