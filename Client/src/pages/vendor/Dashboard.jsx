// pages/vendor/Dashboard.jsx
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

import {
  getShopStats,
  getUpcomingAppointments
} from '../../services/vendorService';

import AppointmentCalendar from '../../components/vendor/AppointmentCalendar';
import StatsCards from '../../components/vendor/StatsCards';
import RecentReviews from '../../components/vendor/RecentReviews';
import LatestAppointments from '../../components/vendor/LatestAppointments';

const VendorDashboard = () => {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    todayAppointments: 0,
    customersCount: 0,
    reviewsAverage: 0
  });
  
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const dashboardRef = React.useRef(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Animate dashboard on mount
    gsap.from(dashboardRef.current.children, {
      y: 20,
      opacity: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: "power3.out"
    });
    gsap.to(dashboardRef.current.children, {
      y: 0,
      opacity: 1,
      stagger: 0.1,
      duration: 0.6,
      ease: "power3.out"
    });
    
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch shop statistics
      const statsData = await getShopStats();
      setStats(statsData.data);
      
      // Fetch upcoming appointments
      const appointmentsData = await getUpcomingAppointments();
      setUpcomingAppointments(appointmentsData.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };
  
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
                  className="text-[#doa189] hover:underline"
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
                  className="text-[#doa189] hover:underline"
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
                  <FaCalendarAlt className="text-[#doa189] text-2xl mb-2" />
                  <span className="text-sm">New Appointment</span>
                </button>
                
                <button
                  onClick={() => navigate('/vendor/services')}
                  className="flex flex-col items-center justify-center p-4 bg-[#fef4ea] rounded-lg hover:bg-[#ecdfcf] transition"
                >
                  <FaCut className="text-[#doa189] text-2xl mb-2" />
                  <span className="text-sm">Manage Services</span>
                </button>
                
                <button
                  onClick={() => navigate('/vendor/customers')}
                  className="flex flex-col items-center justify-center p-4 bg-[#fef4ea] rounded-lg hover:bg-[#ecdfcf] transition"
                >
                  <FaUsers className="text-[#doa189] text-2xl mb-2" />
                  <span className="text-sm">Customers</span>
                </button>
                
                <button
                  onClick={() => navigate('/vendor/gallery')}
                  className="flex flex-col items-center justify-center p-4 bg-[#fef4ea] rounded-lg hover:bg-[#ecdfcf] transition"
                >
                  <FaImages className="text-[#doa189] text-2xl mb-2" />
                  <span className="text-sm">Gallery</span>
                </button>
                
                <button
                  onClick={() => navigate('/vendor/analytics')}
                  className="flex flex-col items-center justify-center p-4 bg-[#fef4ea] rounded-lg hover:bg-[#ecdfcf] transition"
                >
                  <FaChartLine className="text-[#doa189] text-2xl mb-2" />
                  <span className="text-sm">Analytics</span>
                </button>
                
                <button
                  onClick={() => navigate('/vendor/promotions')}
                  className="flex flex-col items-center justify-center p-4 bg-[#fef4ea] rounded-lg hover:bg-[#ecdfcf] transition"
                >
                  <FaTags className="text-[#doa189] text-2xl mb-2" />
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
                  className="text-[#doa189] hover:underline"
                >
                  View All
                </Link>
              </div>
              
              <RecentReviews isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
