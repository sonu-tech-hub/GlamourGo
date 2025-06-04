// client/src/components/layout/VendorSidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaTimes,
  FaHome,
  FaCalendarAlt,
  FaCut,
  FaImages,
  FaUsers,
  FaTags,
  FaChartLine,
  FaCog,
  FaCommentAlt,
  FaSignOutAlt
} from 'react-icons/fa';

import { useAuth } from '../../context/AuthContext';
import Logo from '../common/Logo';

const VendorSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // Define sidebar menu items
  const menuItems = [
    {
      name: 'Dashboard',
      path: '/vendor/dashboard',
      icon: <FaHome />
    },
    {
      name: 'Appointments',
      path: '/vendor/appointments',
      icon: <FaCalendarAlt />
    },
    {
      name: 'Services',
      path: '/vendor/services',
      icon: <FaCut />
    },
    {
      name: 'Gallery',
      path: '/vendor/gallery',
      icon: <FaImages />
    },
    {
      name: 'Customers',
      path: '/vendor/customers',
      icon: <FaUsers />
    },
    {
      name: 'Promotions',
      path: '/vendor/promotions',
      icon: <FaTags />
    },
    {
      name: 'Reviews',
      path: '/vendor/reviews',
      icon: <FaCommentAlt />
    },
    {
      name: 'Analytics',
      path: '/vendor/analytics',
      icon: <FaChartLine />
    },
    {
      name: 'Settings',
      path: '/vendor/settings',
      icon: <FaCog />
    }
  ];
  
  // Check if a menu item is active
  const isActive = (path) => location.pathname === path;
  
  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Logo />
          
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 lg:hidden"
          >
            <FaTimes />
          </button>
        </div>
        
        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-[#doa189] flex items-center justify-center text-white">
              {user?.user?.name?.charAt(0) || 'U'}
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-800">{user?.user?.name || 'Vendor'}</p>
              <p className="text-sm text-gray-500">{user?.user?.email || 'vendor@example.com'}</p>
            </div>
          </div>
        </div>
        
        {/* Menu Items */}
        <div className="py-4">
          <ul>
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center px-6 py-3 text-gray-700 hover:bg-[#fef4ea] hover:text-[#doa189] ${
                    isActive(item.path) ? 'bg-[#fef4ea] text-[#doa189] border-r-4 border-[#doa189]' : ''
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Logout Button */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="flex items-center w-full px-6 py-3 text-red-500 hover:bg-red-50 rounded-lg"
          >
            <FaSignOutAlt className="mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default VendorSidebar;
