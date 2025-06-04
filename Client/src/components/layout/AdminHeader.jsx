// client/src/components/layout/AdminHeader.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBell, FaSearch, FaUserCircle, FaCog } from 'react-icons/fa';

import { useAuth } from '../../context/AuthContext';

const AdminHeader = () => {
  const { user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  return (
    <header className="bg-white border-b border-gray-200 py-3 px-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold text-[#a38772]">
            Admin Dashboard
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <FaBell className="text-gray-500 hover:text-[#doa189] cursor-pointer" />
            <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center text-white text-xs">
              3
            </span>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-[#doa189] flex items-center justify-center text-white">
                {user?.user?.name?.charAt(0) || 'A'}
              </div>
              <span className="hidden md:block text-gray-700">{user?.user?.name || 'Admin'}</span>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10">
                <Link
                  to="/admin/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-[#fef4ea] hover:text-[#doa189]"
                >
                  Profile
                </Link>
                <Link
                  to="/admin/settings"
                  className="block px-4 py-2 text-gray-700 hover:bg-[#fef4ea] hover:text-[#doa189]"
                >
                  Settings
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
