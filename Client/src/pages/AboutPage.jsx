// client/src/pages/AboutPage.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  FaCalendarAlt, 
  FaSearch, 
  FaStore, 
  FaUsers, 
  FaTags,
  FaLeaf,
  FaSpa,
  FaSmile
} from 'react-icons/fa';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const AboutPage = () => {
  useEffect(() => {
    // Animation for hero section
    gsap.from('.hero-content', {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    });
    
    // Animation for mission section
    gsap.from('.mission-item', {
      y: 50,
      opacity: 0,
      stagger: 0.2,
      duration: 0.8,
      scrollTrigger: {
        trigger: '.mission-section',
        start: 'top 80%'
      }
    });
    
    // Animation for features section
    gsap.from('.feature-item', {
      y: 30,
      opacity: 0,
      stagger: 0.15,
      duration: 0.8,
      scrollTrigger: {
        trigger: '.features-section',
        start: 'top 70%'
      }
    });
    
    // Animation for team section
    gsap.from('.team-member', {
      scale: 0.9,
      opacity: 0,
      stagger: 0.2,
      duration: 0.8,
      scrollTrigger: {
        trigger: '.team-section',
        start: 'top 70%'
      }
    });
  }, []);
  
  return (
    <div className="bg-[#fef4ea] min-h-screen">
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center hero-content">
            <h1 className="text-4xl md:text-5xl font-bold text-[#a38772] mb-6">
              About Beauty & Wellness
            </h1>
            
            <p className="text-lg md:text-xl text-gray-700 mb-8">
              We're on a mission to transform how people discover and book beauty, wellness, and fitness services.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/shops"
                className="bg-[#doa189] hover:bg-[#ecdfcf] text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                <FaSearch className="inline-block mr-2" />
                Find Services
              </Link>
              
              <Link
                to="/register"
                className="bg-white border border-[#doa189] text-[#doa189] hover:bg-[#fef4ea] font-bold py-3 px-6 rounded-lg transition-colors"
              >
                <FaStore className="inline-block mr-2" />
                List Your Business
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Mission Section */}
      <section className="py-16 bg-white mission-section">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#a38772] mb-12">
            Our Mission
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="mission-item flex flex-col items-center text-center">
              <div className="w-20 h-20 flex items-center justify-center bg-[#fef4ea] text-[#doa189] rounded-full mb-6">
                <FaCalendarAlt className="text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-[#a38772] mb-3">Simplify Booking</h3>
              <p className="text-gray-600">
                We make it easy for customers to discover and book appointments with their favorite beauty and wellness providers, saving time and reducing hassle.
              </p>
            </div>
            
            <div className="mission-item flex flex-col items-center text-center">
              <div className="w-20 h-20 flex items-center justify-center bg-[#fef4ea] text-[#doa189] rounded-full mb-6">
                <FaStore className="text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-[#a38772] mb-3">Empower Businesses</h3>
              <p className="text-gray-600">
                We help small businesses and independent professionals grow by providing them with the tools they need to manage appointments, clients, and services.
              </p>
            </div>
            
            <div className="mission-item flex flex-col items-center text-center">
              <div className="w-20 h-20 flex items-center justify-center bg-[#fef4ea] text-[#doa189] rounded-full mb-6">
                <FaSmile className="text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-[#a38772] mb-3">Enhance Experiences</h3>
              <p className="text-gray-600">
                We believe in promoting self-care and wellness, connecting people with quality services that help them look and feel their best every day.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 features-section">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#a38772] mb-12">
            Why Choose Us
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="feature-item bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-start">
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-[#fef4ea] text-[#doa189] rounded-full mr-4">
                  <FaSearch className="text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#a38772] mb-2">Easy Discovery</h3>
                  <p className="text-gray-600">
                    Find the perfect service providers near you with our powerful search and filter options. Browse by location, category, ratings, and more.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="feature-item bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-start">
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-[#fef4ea] text-[#doa189] rounded-full mr-4">
                  <FaCalendarAlt className="text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#a38772] mb-2">Seamless Booking</h3>
                  <p className="text-gray-600">
                    Book appointments with just a few clicks, 24/7. No more phone calls or waiting for business hours to schedule your services.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="feature-item bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-start">
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-[#fef4ea] text-[#doa189] rounded-full mr-4">
                  <FaUsers className="text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#a38772] mb-2">Verified Reviews</h3>
                  <p className="text-gray-600">
                    Read authentic reviews from real customers to make informed decisions about where to book your next appointment.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="feature-item bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-start">
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-[#fef4ea] text-[#doa189] rounded-full mr-4">
                  <FaTags className="text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#a38772] mb-2">Exclusive Deals</h3>
                  <p className="text-gray-600">
                    Get access to special promotions and discounts from businesses in your area, available only to our platform users.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Values Section */}
      <section className="py-16 bg-white values-section">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#a38772] mb-12">
            Our Values
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="value-item flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-green-100 text-green-600 rounded-full mb-4">
                <FaLeaf className="text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-[#a38772] mb-2">Sustainability</h3>
              <p className="text-gray-600">
                We promote eco-friendly practices and businesses that prioritize sustainability in their operations.
              </p>
            </div>
            
            <div className="value-item flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full mb-4">
                <FaUsers className="text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-[#a38772] mb-2">Inclusivity</h3>
              <p className="text-gray-600">
                We believe beauty and wellness services should be accessible to everyone, regardless of background or identity.
              </p>
            </div>
            
            <div className="value-item flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full mb-4">
                <FaSpa className="text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-[#a38772] mb-2">Quality</h3>
              <p className="text-gray-600">
                We carefully vet our service providers to ensure our users receive high-quality services and experiences.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call To Action */}
      <section className="py-16 bg-[#doa189] text-white cta-section">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Experience Better Bookings?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have simplified their beauty and wellness routines with our platform.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="bg-white text-[#doa189] hover:bg-[#fef4ea] font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Create an Account
            </Link>
            
            <Link
              to="/shops"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#doa189] font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Browse Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
