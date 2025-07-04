import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import toast from 'react-hot-toast';
import {
  FaCalendarAlt,
  FaUsers,
  FaCut,
  FaImages,
  FaChartLine,
  FaTags,
  FaCog,
  FaBell
} from 'react-icons/fa';

// --- IMPORTANT CHANGE: Importing getShopDashboardStats from analyticsService ---
import { getShopDashboardStats } from '../../services/analyticsService';
// Removed specific imports from vendorService, as dashboard data is consolidated
// import { getShopStats, getUpcomingAppointments } from '../../services/vendorService';

import { useAuth } from '../../context/AuthContext';
import { getAllShops } from '../../services/shopService'; // Still needed to get the shopId

import AppointmentCalendar from '../../components/vendor/AppointmentCalendar';
import StatsCards from '../../components/vendor/StatsCards';
import RecentReviews from '../../components/vendor/RecentReviews';
import LatestAppointments from '../../components/vendor/LatestAppointments';
import LoadingSpinner from '../../components/common/LoadingSpinner';


const VendorDashboard = () => {
  const { user } = useAuth();
  const [shopId, setShopId] = useState(''); // State to store the fetched shopId

  const [stats, setStats] = useState({ // Initial state reflecting the backend structure
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    todayAppointments: 0,
    revenueGrowth: 0, // Added based on your provided backend structure
    customersCount: 0,
    reviewsAverage: 0
  });
  
  const [upcomingAppointments, setUpcomingAppointments] = useState([]); // Mapped from pendingAppointments
  const [recentReviews, setRecentReviews] = useState([]); // NEW: State for recent reviews
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
console.log('Vendor Dashboard Loaded',stats); // Debugging log to confirm component load
  console.log(recentReviews)
  const dashboardRef = React.useRef(null);
  const navigate = useNavigate();
  
  // Effect 1: Discover the shopId for the current vendor user
  useEffect(() => {
    const fetchVendorShopId = async () => {
      setIsLoading(true); // Indicate loading while trying to find shopId
      setError(null); // Clear any previous errors

      try {
        const userId = user?.user?.id;
        const userType = user?.user?.userType;

        if (!userId || userType !== 'vendor') {
          setError('User not authenticated or not a vendor. Please log in with a vendor account to view your dashboard.');
          setShopId('');
          setIsLoading(false);
          return;
        }

        const response = await getAllShops();
        const allShops = response.data.shops;
        const vendorShop = allShops.find(shop => shop.owner === userId);

        if (!vendorShop) {
          setError('No shop found linked to your vendor account. Please create a shop to manage your business.');
          toast.error('No shop found for your vendor account.');
          setShopId('');
          setIsLoading(false);
          return;
        }

        setShopId(vendorShop._id); // Set the found shopId
      } catch (err) {
        console.error('Failed to fetch vendor shop ID:', err);
        setError(err.response?.data?.message || 'Failed to find your shop. Please try again.');
        toast.error('Unable to find your shop.');
        setShopId('');
      } finally {
        // Important: isLoading will be managed by the data fetching useEffect below
        // This ensures the spinner remains until all dashboard data is loaded.
      }
    };

    if (user) { // Only attempt to fetch shopId if user object is available
      fetchVendorShopId();
    } else {
        setShopId('');
        setError("Please log in to view your dashboard.");
        setIsLoading(false); // Stop loading if no user is found
    }
  }, [user]); // Re-run when the user object from AuthContext changes

  // Effect 2: Fetch dashboard data once shopId is available
  useEffect(() => {
    const fetchDashboardData = async () => {
  if (!shopId) {
    // Don't fetch if shopId is not set yet
    return;
  }

  setIsLoading(true); // Start loading for dashboard data
  setError(null); // Clear any previous errors

  try {
    // Call the analytics dashboard endpoint
    const dashboardResponse = await getShopDashboardStats(shopId);

    // Optional: Log titles from recent reviews
    const titles = dashboardResponse?.recentReviews?.map((review, index) => {
      console.log(`Title ${index + 1}:`, review.title);
      return review.title;
    }) || [];
    console.log('Recent Review Titles:', titles[0]);
    // Set states with response data
    setStats(dashboardResponse.stats);
    setUpcomingAppointments(dashboardResponse.pendingAppointments || []);
    setRecentReviews(titles[0]);

    // Animate dashboard elements after data is loaded
    if (dashboardRef.current) {
      gsap.fromTo(
        dashboardRef.current.children,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: "power3.out" }
      );
    }

  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    setError(err.response?.data?.message || 'Failed to load dashboard data. Please try again later.');
    toast.error('Failed to load dashboard data');
  } finally {
    setIsLoading(false); // End loading phase
  }
};


    fetchDashboardData();
  }, [shopId]); // Re-run when shopId changes

  // Render loading spinner or error message based on state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen bg-[#fef4ea]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#fef4ea] min-h-screen py-8 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()} // Reload page to re-trigger data fetching
            className="mt-4 bg-[#d0a189] hover:bg-[#ecdfcf] text-[#b99160] font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fef4ea] min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-[#a38772]">Shop Dashboard</h1>
        
        <div ref={dashboardRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="col-span-full">
            <StatsCards stats={stats} isLoading={isLoading} />
          </div>
          
          {/* Main Column - Calendar */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#a38772]">Appointment Calendar</h2>
                <Link
                  to="/vendor/appointments"
                  className="text-[#d0a189] hover:underline"
                >
                  View All
                </Link>
              </div>
              
              <AppointmentCalendar appointments={upcomingAppointments} isLoading={isLoading} />
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#a38772]">Latest Appointments</h2>
                <Link
                  to="/vendor/appointments"
                  className="text-[#d0a189] hover:underline"
                >
                  View All
                </Link>
              </div>
              
              <LatestAppointments appointments={upcomingAppointments} isLoading={isLoading} />
            </div>
          </div>
          
          {/* Side Column - Quick Actions & Reviews */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-[#a38772]">Quick Actions</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/vendor/appointments/new')}
                  className="flex flex-col items-center justify-center p-4 bg-[#fef4ea] rounded-lg hover:bg-[#ecdfcf] transition"
                >
                  <FaCalendarAlt className="text-[#d0a189] text-2xl mb-2" />
                  <span className="text-sm">New Appointment</span>
                </button>
                
                <button
                  onClick={() => navigate('/vendor/services')}
                  className="flex flex-col items-center justify-center p-4 bg-[#fef4ea] rounded-lg hover:bg-[#ecdfcf] transition"
                >
                  <FaCut className="text-[#d0a189] text-2xl mb-2" />
                  <span className="text-sm">Manage Services</span>
                </button>
                
                <button
                  onClick={() => navigate('/vendor/customers')}
                  className="flex flex-col items-center justify-center p-4 bg-[#fef4ea] rounded-lg hover:bg-[#ecdfcf] transition"
                >
                  <FaUsers className="text-[#d0a189] text-2xl mb-2" />
                  <span className="text-sm">Customers</span>
                </button>
                
                <button
                  onClick={() => navigate('/vendor/gallery')}
                  className="flex flex-col items-center justify-center p-4 bg-[#fef4ea] rounded-lg hover:bg-[#ecdfcf] transition"
                >
                  <FaImages className="text-[#d0a189] text-2xl mb-2" />
                  <span className="text-sm">Gallery</span>
                </button>
                
                <button
                  onClick={() => navigate('/vendor/analytics')}
                  className="flex flex-col items-center justify-center p-4 bg-[#fef4ea] rounded-lg hover:bg-[#ecdfcf] transition"
                >
                  <FaChartLine className="text-[#d0a189] text-2xl mb-2" />
                  <span className="text-sm">Analytics</span>
                </button>
                
                <button
                  onClick={() => navigate('/vendor/promotions')}
                  className="flex flex-col items-center justify-center p-4 bg-[#fef4ea] rounded-lg hover:bg-[#ecdfcf] transition"
                >
                  <FaTags className="text-[#d0a189] text-2xl mb-2" />
                  <span className="text-sm">Promotions</span>
                </button>
              </div>
            </div>
            
            {/* Recent Reviews */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#a38772]">Recent Reviews</h2>
                <Link
                  to="/vendor/reviews"
                  className="text-[#d0a189] hover:underline"
                >
                  View All
                </Link>
              </div>
              
              <RecentReviews review={recentReviews} isLoading={isLoading} />
              {/* <p className='content text-center bg-slate-200 p-2'>{recentReviews}</p> Passed reviews data */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;