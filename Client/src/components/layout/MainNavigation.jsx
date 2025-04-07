// components/layout/MainNavigation.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaBars, FaSearch, FaBell, FaUser, FaSignOutAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { gsap } from 'gsap';

const MainNavigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Close menus when changing routes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);
  
  // Animate navigation on mount
  useEffect(() => {
    gsap.from('#logo', {
      y: -50,
      opacity: 0,
      duration: 0.5,
      ease: 'power3.out'
    });
    
    gsap.from('#nav-items > *', {
      y: -20,
      opacity: 0,
      stagger: 0.1,
      duration: 0.5,
      ease: 'power3.out'
    });
  }, []);
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };
  
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" id="logo" className="flex items-center">
            <img 
              src="/logo.png" 
              alt="Beauty & Wellness" 
              className="h-10 mr-2"
            />
            <span className="text-xl font-bold text-[#a38772]">Beauty & Wellness</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6" id="nav-items">
            <Link 
              to="/categories" 
              className="text-[#a38772] hover:text-[#doa189]"
            >
              Categories
            </Link>
            <Link 
              to="/shops" 
              className="text-[#a38772] hover:text-[#doa189]"
              >
              Find Shops
            </Link>
            <Link 
              to="/about" 
              className="text-[#a38772] hover:text-[#doa189]"
            >
              About Us
            </Link>
            <Link 
              to="/contact" 
              className="text-[#a38772] hover:text-[#doa189]"
            >
              Contact
            </Link>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-[#b0b098] focus:outline-none focus:border-[#doa189]"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a38772]" />
            </form>
            
            {/* User Actions */}
            {isAuthenticated ? (
              <div className="relative">
                <div className="flex items-center space-x-4">
                  {/* Notifications */}
                  <div className="relative">
                    <Link to="/notifications">
                      <FaBell className="text-[#a38772] text-xl hover:text-[#doa189]" />
                      {user?.notifications?.filter(n => !n.read).length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center text-white text-xs">
                          {user.notifications.filter(n => !n.read).length}
                        </span>
                      )}
                    </Link>
                  </div>
                  
                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-[#doa189] flex items-center justify-center">
                        {user?.profilePicture ? (
                          <img 
                            src={user.profilePicture} 
                            alt={user.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FaUser className="text-white" />
                        )}
                      </div>
                      <span className="text-[#a38772]">{user?.name}</span>
                    </button>
                    
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10">
                        {user?.userType === 'vendor' && (
                          <Link
                            to="/vendor/dashboard"
                            className="block px-4 py-2 text-[#a38772] hover:bg-[#fef4ea]"
                          >
                            Shop Dashboard
                          </Link>
                        )}
                        
                        {user?.userType === 'admin' && (
                          <Link
                            to="/admin/dashboard"
                            className="block px-4 py-2 text-[#a38772] hover:bg-[#fef4ea]"
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        
                        <Link
                          to="/user/dashboard"
                          className="block px-4 py-2 text-[#a38772] hover:bg-[#fef4ea]"
                        >
                          My Dashboard
                        </Link>
                        
                        <Link
                          to="/user/appointments"
                          className="block px-4 py-2 text-[#a38772] hover:bg-[#fef4ea]"
                        >
                          My Appointments
                        </Link>
                        
                        <Link
                          to="/user/profile"
                          className="block px-4 py-2 text-[#a38772] hover:bg-[#fef4ea]"
                        >
                          Profile Settings
                        </Link>
                        
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-red-500 hover:bg-[#fef4ea] flex items-center"
                        >
                          <FaSignOutAlt className="mr-2" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-[#a38772] hover:text-[#doa189]"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-[#doa189] hover:bg-[#ecdfcf] text-white py-2 px-4 rounded-lg transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[#a38772]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <FaBars className="text-2xl" />
          </button>
        </nav>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <form onSubmit={handleSearch} className="relative mb-4">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#b0b098] focus:outline-none focus:border-[#doa189]"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a38772]" />
            </form>
            
            <div className="flex flex-col space-y-3">
              <Link 
                to="/categories" 
                className="text-[#a38772] hover:text-[#doa189] py-2"
              >
                Categories
              </Link>
              <Link 
                to="/shops" 
                className="text-[#a38772] hover:text-[#doa189] py-2"
              >
                Find Shops
              </Link>
              <Link 
                to="/about" 
                className="text-[#a38772] hover:text-[#doa189] py-2"
              >
                About Us
              </Link>
              <Link 
                to="/contact" 
                className="text-[#a38772] hover:text-[#doa189] py-2"
              >
                Contact
              </Link>
              
              {isAuthenticated ? (
                <>
                  <hr className="border-[#b0b098] my-2" />
                  
                  <Link
                    to="/notifications"
                    className="flex items-center text-[#a38772] hover:text-[#doa189] py-2"
                  >
                    <FaBell className="mr-2" />
                    Notifications
                    {user?.notifications?.filter(n => !n.read).length > 0 && (
                      <span className="ml-2 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs">
                        {user.notifications.filter(n => !n.read).length}
                      </span>
                    )}
                  </Link>
                  
                  {user?.userType === 'vendor' && (
                    <Link
                      to="/vendor/dashboard"
                      className="text-[#a38772] hover:text-[#doa189] py-2"
                    >
                      Shop Dashboard
                    </Link>
                  )}
                  
                  {user?.userType === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      className="text-[#a38772] hover:text-[#doa189] py-2"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  
                  <Link
                    to="/user/dashboard"
                    className="text-[#a38772] hover:text-[#doa189] py-2"
                  >
                    My Dashboard
                  </Link>
                  
                  <Link
                    to="/user/appointments"
                    className="text-[#a38772] hover:text-[#doa189] py-2"
                  >
                    My Appointments
                  </Link>
                  
                  <Link
                    to="/user/profile"
                    className="text-[#a38772] hover:text-[#doa189] py-2"
                  >
                    Profile Settings
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-red-500 py-2"
                  >
                    <FaSignOutAlt className="mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <hr className="border-[#b0b098] my-2" />
                  
                  <Link
                    to="/login"
                    className="text-[#a38772] hover:text-[#doa189] py-2"
                  >
                    Login
                  </Link>
                  
                  <Link
                    to="/register"
                    className="bg-[#doa189] hover:bg-[#ecdfcf] text-white py-2 px-4 rounded-lg transition text-center"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default MainNavigation;