// pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaCut, FaSpa, FaDumbbell, FaYoga, FaPaintBrush } from 'react-icons/fa';
import { getPopularShops, getFeaturedShops } from '../services/shopService';

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
        
        setPopularShops(popularData.data);
        setFeaturedShops(featuredData.data);
      } catch (error) {
        console.error('Error fetching shops:', error);
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
            src="/images/hero-bg.jpg" 
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
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-[#b0b098] focus:outline-none focus:border-[#doa189]"
                  />
                </div>
                
                <div className="flex-1 relative">
                  <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#a38772]" />
                  <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-[#b0b098] focus:outline-none focus:border-[#doa189]"
                  />
                </div>
                
                <button
                  type="submit"
                  className="bg-[#doa189] hover:bg-[#ecdfcf] text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
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
            <Link to="/shops?category=salon" className="category-card bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <div className="h-40 flex items-center justify-center bg-gradient-to-r from-[#doa189] to-[#ecdfcf]">
                <FaCut className="text-white text-5xl" />
              </div>
              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-[#a38772]">Hair Salons</h3>
                <p className="text-sm text-gray-500 mt-1">Haircuts, Styling, Coloring</p>
              </div>
            </Link>
            
            <Link to="/shops?category=spa" className="category-card bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <div className="h-40 flex items-center justify-center bg-gradient-to-r from-[#doa189] to-[#ecdfcf]">
                <FaSpa className="text-white text-5xl" />
              </div>
              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-[#a38772]">Spas & Massage</h3>
                <p className="text-sm text-gray-500 mt-1">Relaxation, Therapy, Beauty Treatments</p>
              </div>
            </Link>
            
            <Link to="/shops?category=gym" className="category-card bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <div className="h-40 flex items-center justify-center bg-gradient-to-r from-[#doa189] to-[#ecdfcf]">
                <FaDumbbell className="text-white text-5xl" />
              </div>
              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-[#a38772]">Fitness & Gyms</h3>
                <p className="text-sm text-gray-500 mt-1">Personal Training, Classes, Workouts</p>
              </div>
            </Link>
            
            <Link to="/shops?category=yoga" className="category-card bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <div className="h-40 flex items-center justify-center bg-gradient-to-r from-[#doa189] to-[#ecdfcf]">
                <FaYoga className="text-white text-5xl" />
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
              className="inline-block bg-[#a38772] hover:bg-[#doa189] text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300"
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
          
          <Swiper
            slidesPerView={1}
            spaceBetween={20}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000 }}
            modules={[Pagination, Autoplay]}
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
                    src={shop.gallery[0]?.url || '/images/default-shop.jpg'} 
                    alt={shop.name} 
                    className="w-full h-48 object-cover"
                  />
                  
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-[#a38772]">{shop.name}</h3>
                      <div className="flex items-center bg-[#doa189] text-white px-2 py-1 rounded text-sm">
                        <span className="mr-1">{shop.ratings.average.toFixed(1)}</span>
                        <span>★</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{shop.category}</p>
                    
                    <p className="text-sm text-gray-500 mb-4">
                      {shop.address.city}, {shop.address.state}
                    </p>
                    
                    <Link
                      to={`/shop/${shop._id}`}
                      className="block w-full bg-[#doa189] hover:bg-[#ecdfcf] text-white text-center font-semibold py-2 rounded-lg transition-colors duration-300"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
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
              <div className="w-20 h-20 flex items-center justify-center bg-[#doa189] text-white rounded-full mb-6">
                <FaSearch className="text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-[#a38772] mb-3">Search</h3>
              <p className="text-gray-600">
                Find beauty, wellness, and fitness services near you based on your preferences.
              </p>
            </div>
            
            <div className="steps-item flex flex-col items-center text-center">
              <div className="w-20 h-20 flex items-center justify-center bg-[#doa189] text-white rounded-full mb-6">
                <FaCalendarAlt className="text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-[#a38772] mb-3">Book</h3>
              <p className="text-gray-600">
                Select your preferred service, date, and time slot for your appointment.
              </p>
            </div>
            
            <div className="steps-item flex flex-col items-center text-center">
              <div className="w-20 h-20 flex items-center justify-center bg-[#doa189] text-white rounded-full mb-6">
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
            <div className="bg-[#fef4ea] rounded-lg overflow-hidden shadow-md text-center p-6">
              <div className="w-16 h-16 flex items-center justify-center bg-[#doa189] text-white rounded-full mx-auto mb-4">
                <FaCut className="text-2xl" />
              </div>
              <h3 className="font-semibold text-[#a38772] mb-2">Haircut & Styling</h3>
              <p className="text-sm text-gray-600">Starting from ₹500</p>
            </div>
            
            <div className="bg-[#fef4ea] rounded-lg overflow-hidden shadow-md text-center p-6">
              <div className="w-16 h-16 flex items-center justify-center bg-[#doa189] text-white rounded-full mx-auto mb-4">
                <FaSpa className="text-2xl" />
              </div>
              <h3 className="font-semibold text-[#a38772] mb-2">Full Body Massage</h3>
              <p className="text-sm text-gray-600">Starting from ₹1200</p>
            </div>
            
            <div className="bg-[#fef4ea] rounded-lg overflow-hidden shadow-md text-center p-6">
              <div className="w-16 h-16 flex items-center justify-center bg-[#doa189] text-white rounded-full mx-auto mb-4">
                <FaDumbbell className="text-2xl" />
              </div>
              <h3 className="font-semibold text-[#a38772] mb-2">Personal Training</h3>
              <p className="text-sm text-gray-600">Starting from ₹800</p>
            </div>
            
            <div className="bg-[#fef4ea] rounded-lg overflow-hidden shadow-md text-center p-6">
              <div className="w-16 h-16 flex items-center justify-center bg-[#doa189] text-white rounded-full mx-auto mb-4">
                <FaPaintBrush className="text-2xl" />
              </div>
              <h3 className="font-semibold text-[#a38772] mb-2">Nail Art</h3>
              <p className="text-sm text-gray-600">Starting from ₹600</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* App Promotion Section */}
      <section className="py-16 bg-gradient-to-r from-[#doa189] to-[#ecdfcf] text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold mb-4">Get Our Mobile App</h2>
              <p className="text-lg mb-6">
                Book appointments, get notifications, and manage your bookings on the go with our mobile app.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
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
          
          <Swiper
            slidesPerView={1}
            spaceBetween={30}
            pagination={{ clickable: true }}
            autoplay={{ delay: 6000 }}
            modules={[Pagination, Autoplay]}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 }
            }}
            className="testimonials-swiper"
          >
            <SwiperSlide>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <img 
                      src="/images/testimonial-1.jpg" 
                      alt="Testimonial" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#a38772]">Priya Sharma</h4>
                    <div className="flex text-yellow-400 text-sm">
                      <span>★</span>
                      <span>★</span>
                      <span>★
                        </span>
                      <span>★</span>
                      <span>★</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">
                  "I had a great experience with this beauty salon. The staff was friendly and professional, and the services were top-notch. I highly recommend this salon for any beauty needs."
                </p>
              </div>
            </SwiperSlide>
            <SwiperSlide>            
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <img 
                      src="/images/testimonial-2.jpg" 
                      alt="Testimonial" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#a38772]">Amit Kumar</h4>
                    <div className="flex text-yellow-400 text-sm">
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">
                  "I had a great experience with this beauty salon. The staff was friendly and professional, and the services were top-notch. I highly recommend this salon for any beauty needs."
                </p>
              </div>
            </SwiperSlide>
            <SwiperSlide>            
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <img 
                      src="/images/testimonial-3.jpg" 
                      alt="Testimonial" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#a38772]">Neha Patel</h4>
                    <div className="flex text-yellow-400 text-sm">
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">
                  "I had a great experience with this beauty salon. The staff was friendly and professional, and the services were top-notch. I highly recommend this salon for any beauty needs."
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