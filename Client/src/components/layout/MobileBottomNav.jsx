// client/src/components/layout/MobileBottomNav.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaCalendarAlt, 
  FaSearch, 
  FaUser, 
  FaStore 
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Define navigation items
  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: <FaHome className="text-xl" />
    },
    {
      name: 'Appointments',
      path: '/user/appointments',
      icon: <FaCalendarAlt className="text-xl" />
    },
    {
      name: 'Explore',
      path: '/shops',
      icon: <FaSearch className="text-xl" />
    }
  ];
  
  // Add conditional navigation item for vendors
  if (user?.userType === 'vendor') {
    navItems.push({
      name: 'Shop',
      path: '/vendor/dashboard',
      icon: <FaStore className="text-xl" />
    });
  }
  
  // Add profile link
  navItems.push({
    name: 'Profile',
    path: '/user/profile',
    icon: <FaUser className="text-xl" />
  });
  
  // Check if a nav item is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center py-2 px-3 ${
              isActive(item.path) 
                ? 'text-[#doa189]' 
                : 'text-gray-500 hover:text-[#a38772]'
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileBottomNav;
