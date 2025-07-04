// client/src/layouts/MainLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import MainNavigation from '../components/layout/MainNavigation';
import Footer from '../components/layout/Footer';
import ScrollToTop from '../components/common/ScrollToTop';
import MobileBottomNav from '../components/layout/MobileBottomNav';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Scroll to top on route change
    window.scrollTo(0, 0);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);
  
  // Check if the current page is login or register
  const isAuthPage = location.pathname.includes('/login') || 
                     location.pathname.includes('/register') ||
                     location.pathname.includes('/forgot-password') ||
                     location.pathname.includes('/reset-password');
  
  return (
    <div className="flex flex-col min-h-screen">
      <MainNavigation />
      
      <main className="flex-grow">
        <Outlet />
      </main>
      
      <Footer />
      
      {/* Show mobile bottom navigation for authenticated users */}
      {isAuthenticated && !isAuthPage && <MobileBottomNav />}
      
      {/* Scroll to top button */}
      {showScrollToTop && <ScrollToTop />}
    </div>
  );
};

export default MainLayout;
