// client/src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Auth Provider
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout Components
import MainLayout from './layouts/MainLayout';
import VendorLayout from './layouts/VendorLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ShopsPage from './pages/ShopsPage';
import ShopDetailPage from './pages/ShopDetailPage';
import CategoriesPage from './pages/CategoriesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailedPage from './pages/PaymentFailedPage';

// User Pages
import UserDashboard from './pages/user/Dashboard';
import UserAppointments from './pages/user/Appointments';
import UserFavorites from './pages/user/Favorites';
import UserProfile from './pages/user/Profile';
import UserWallet from './pages/user/Wallet';
import UserNotifications from './pages/user/Notifications';
import AppointmentDetailPage from './pages/user/AppointmentDetail';
import WriteReviewPage from './pages/WriteReviewPage';

// Vendor Pages
import VendorDashboard from './pages/vendor/Dashboard';
import VendorAppointments from './pages/vendor/Appointments';
import VendorServices from './pages/vendor/ServicesPage';
import VendorGallery from './pages/vendor/GalleryPage';
import VendorCustomers from './pages/vendor/CustomersPage';
import VendorPromotions from './pages/vendor/PromotionsPage';
import VendorAnalytics from './pages/vendor/AnalyticsPage';
import VendorSettings from './pages/vendor/SettingsPage';
import VendorReviews from './pages/vendor/ReviewsPage';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminShopApprovals from './pages/admin/ShopApprovals';
import AdminUsers from './pages/admin/Users';
import AdminShops from './pages/admin/Shops';
import AdminReports from './pages/admin/Reports';
import AdminAnalytics from './pages/admin/Analytics';
import AdminSettings from './pages/admin/Settings';

// Protected Route Component
const ProtectedRoute = ({ element, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user.userType !== requiredRole) {
    return <Navigate to="/" />;
  }
  
  return element;
};

const App = () => {
  useEffect(() => {
    // Initialize AOS animation library
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true
    });
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="shops" element={<ShopsPage />} />
            <Route path="shop/:shopId" element={<ShopDetailPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            
            {/* Payment Routes */}
            <Route 
              path="payment/:appointmentId" 
              element={<ProtectedRoute element={<PaymentPage />} />} 
            />
            <Route 
              path="payment/success/:appointmentId" 
              element={<ProtectedRoute element={<PaymentSuccessPage />} />} 
            />
            <Route 
              path="payment/failed/:appointmentId" 
              element={<ProtectedRoute element={<PaymentFailedPage />} />} 
            />
            
            {/* Write Review */}
            <Route 
              path="shop/:shopId/write-review" 
              element={<ProtectedRoute element={<WriteReviewPage />} />} 
            />
            
            {/* User Routes */}
            <Route 
              path="user/dashboard" 
              element={<ProtectedRoute element={<UserDashboard />} />} 
            />
            <Route 
              path="user/appointments" 
              element={<ProtectedRoute element={<UserAppointments />} />} 
            />
            <Route 
              path="appointments/:appointmentId" 
              element={<ProtectedRoute element={<AppointmentDetailPage />} />} 
            />
            <Route 
              path="user/favorites" 
              element={<ProtectedRoute element={<UserFavorites />} />} 
            />
            <Route 
              path="user/profile" 
              element={<ProtectedRoute element={<UserProfile />} />} 
            />
            <Route 
              path="user/wallet" 
              element={<ProtectedRoute element={<UserWallet />} />} 
            />
            <Route 
              path="user/notifications" 
              element={<ProtectedRoute element={<UserNotifications />} />} 
            />
          </Route>
          
          {/* Vendor Routes */}
          <Route 
            path="/vendor" 
            element={
              <ProtectedRoute 
                element={<VendorLayout />} 
                requiredRole="vendor" 
              />
            }
          >
            <Route index element={<Navigate to="/vendor/dashboard" />} />
            <Route path="dashboard" element={<VendorDashboard />} />
            <Route path="appointments" element={<VendorAppointments />} />
            <Route path="services" element={<VendorServices />} />
            <Route path="gallery" element={<VendorGallery />} />
            <Route path="customers" element={<VendorCustomers />} />
            <Route path="promotions" element={<VendorPromotions />} />
            <Route path="analytics" element={<VendorAnalytics />} />
            <Route path="settings" element={<VendorSettings />} />
            <Route path="reviews" element={<VendorReviews />} />
          </Route>
          
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute 
                element={<AdminLayout />} 
                requiredRole="admin" 
              />
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="approvals" element={<AdminShopApprovals />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="shops" element={<AdminShops />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          
          {/* 404 Not Found */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
