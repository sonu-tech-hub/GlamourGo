// pages/admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import {
  FaStore,
  FaUsers,
  FaList,
  FaChartBar,
  FaCreditCard,
  FaExclamationTriangle
} from 'react-icons/fa';

import {
  getSystemStats,
  getPendingApprovals,
  getRecentUsers
} from "../../services/adminService";

import StatsCards from '../../components/vendor/StatsCards';
import PendingApprovals from './PendingApprovals';
import RecentUsers from './RecentUsers';
import RevenueChart from './RevenueChart';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalShops: 0,
    totalUsers: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    activeShops: 0,
    recentReports: 0
  });
  
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const dashboardRef = React.useRef(null);
  
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
      // Fetch system statistics
      const statsData = await getSystemStats();
      setStats(statsData.data);
      
      // Fetch pending shop approvals
      const approvalsData = await getPendingApprovals();
      setPendingApprovals(approvalsData.data);
      
      // Fetch recent users
      const usersData = await getRecentUsers();
      setRecentUsers(usersData.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-[#fef4ea] min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-[#a38772]">Admin Dashboard</h1>
        
        <div ref={dashboardRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="col-span-full">
            <StatsCards stats={stats} isLoading={isLoading} />
          </div>
          
          {/* Main Column */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#a38772]">Pending Shop Approvals</h2>
                <Link
                  to="/admin/approvals"
                  className="text-[#doa189] hover:underline"
                >
                  View All
                </Link>
              </div>
              
              <PendingApprovals 
                approvals={pendingApprovals} 
                isLoading={isLoading} 
                onApprove={fetchDashboardData}
                onReject={fetchDashboardData}
              />
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#a38772]">Revenue Analytics</h2>
                <Link
                  to="/admin/analytics"
                  className="text-[#doa189] hover:underline"
                >
                  Detailed Reports
                </Link>
              </div>
              
              <RevenueChart isLoading={isLoading} />
            </div>
          </div>
          
          {/* Side Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-[#a38772]">Quick Actions</h2>
              
              <div className="space-y-3">
                <Link
                  to="/admin/shops"
                  className="flex items-center p-3 bg-[#fef4ea] rounded-lg hover:bg-[#ecdfcf] transition"
                >
                  <FaStore className="text-[#doa189] text-xl mr-3" />
                  <span>Manage Shops</span>
                </Link>
                
                <Link
                  to="/admin/users"
                  className="flex items-center p-3 bg-[#fef4ea] rounded-lg hover:bg-[#ecdfcf] transition"
                >
                  <FaUsers className="text-[#doa189] text-xl mr-3" />
                  <span>Manage Users</span>
                </Link>
                
                <Link
                  to="/admin/categories"
                  className="flex items-center p-3 bg-[#fef4ea] rounded-lg hover:bg-[#ecdfcf] transition"
                >
                  <FaList className="text-[#doa189] text-xl mr-3" />
                  <span>Manage Categories</span>
                </Link>
                
                <Link
                  to="/admin/reports"
                  className="flex items-center p-3 bg-[#fef4ea] rounded-lg hover:bg-[#ecdfcf] transition"
                >
                  <FaExclamationTriangle className="text-[#doa189] text-xl mr-3" />
                  <span>Reports & Issues</span>
                </Link>
                
                <Link
                  to="/admin/payments"
                  className="flex items-center p-3 bg-[#fef4ea] rounded-lg hover:bg-[#ecdfcf] transition"
                >
                  <FaCreditCard className="text-[#doa189] text-xl mr-3" />
                  <span>Payment Management</span>
                </Link>
              </div>
            </div>
            
            {/* Recent Users */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#a38772]">Recent Users</h2>
                <Link
                  to="/admin/users"
                  className="text-[#doa189] hover:underline"
                >
                  View All
                </Link>
              </div>
              
              <RecentUsers users={recentUsers} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;