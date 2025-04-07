// client/src/components/layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaClock
} from 'react-icons/fa';

import Logo from '../common/Logo';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="mb-4">
              <Logo />
            </div>
            <p className="text-gray-600 mb-4">
              Discover and book the best beauty, wellness, and fitness services near you. Simplify your self-care journey with our easy appointment booking platform.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#a38772] hover:text-[#doa189] transition-colors"
              >
                <FaFacebook size={20} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#a38772] hover:text-[#doa189] transition-colors"
              >
                <FaTwitter size={20} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#a38772] hover:text-[#doa189] transition-colors"
              >
                <FaInstagram size={20} />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#a38772] hover:text-[#doa189] transition-colors"
              >
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-[#a38772] mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-[#doa189] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shops" className="text-gray-600 hover:text-[#doa189] transition-colors">
                  Find Shops
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-600 hover:text-[#doa189] transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-[#doa189] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-[#doa189] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-600 hover:text-[#doa189] transition-colors">
                  Register Your Business
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold text-[#a38772] mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/shops?category=salon" className="text-gray-600 hover:text-[#doa189] transition-colors">
                  Salons & Parlours
                </Link>
              </li>
              <li>
                <Link to="/shops?category=spa" className="text-gray-600 hover:text-[#doa189] transition-colors">
                  Spas & Massages
                </Link>
              </li>
              <li>
                <Link to="/shops?category=gym" className="text-gray-600 hover:text-[#doa189] transition-colors">
                  Gyms & Fitness
                </Link>
              </li>
              <li>
                <Link to="/shops?category=yoga" className="text-gray-600 hover:text-[#doa189] transition-colors">
                  Yoga & Meditation
                </Link>
              </li>
              <li>
                <Link to="/shops?category=dance" className="text-gray-600 hover:text-[#doa189] transition-colors">
                  Dance Academies
                </Link>
              </li>
              <li>
                <Link to="/shops?category=tattoo" className="text-gray-600 hover:text-[#doa189] transition-colors">
                  Tattoo & Nail Art
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-[#a38772] mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FaMapMarkerAlt className="text-[#doa189] mt-1 mr-3" />
                <span className="text-gray-600">
                  123 Beauty Street, Wellness Park<br />
                  New Delhi, India 110001
                </span>
              </li>
              <li className="flex items-center">
                <FaPhoneAlt className="text-[#doa189] mr-3" />
                <a href="tel:+911234567890" className="text-gray-600 hover:text-[#doa189] transition-colors">
                  +91 1234 567 890
                </a>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="text-[#doa189] mr-3" />
                <a href="mailto:info@beautyandwellness.com" className="text-gray-600 hover:text-[#doa189] transition-colors">
                  info@beautyandwellness.com
                </a>
              </li>
              <li className="flex items-start">
                <FaClock className="text-[#doa189] mt-1 mr-3" />
                <span className="text-gray-600">
                  Monday - Saturday: 9:00 AM - 8:00 PM<br />
                  Sunday: 10:00 AM - 6:00 PM
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <p className="text-gray-600 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Beauty & Wellness. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/terms" className="text-gray-600 hover:text-[#doa189] text-sm transition-colors">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-gray-600 hover:text-[#doa189] text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/refund" className="text-gray-600 hover:text-[#doa189] text-sm transition-colors">
                Refund Policy
              </Link>
              <Link to="/faq" className="text-gray-600 hover:text-[#doa189] text-sm transition-colors">
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
