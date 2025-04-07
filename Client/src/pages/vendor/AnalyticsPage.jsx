// client/src/pages/vendor/AnalyticsPage.jsx
import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { FaCalendarAlt, FaChartLine, FaUsers, FaMoneyBillWave, FaDownload } from 'react-icons/fa';
import toast from 'react-hot-toast';

import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [shopId, setShopId] = useState(user?.shopId || '');
  const [period, setPeriod] = useState('month'); // 'week', 'month', 'year'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Analytics data
  const [revenueData, setRevenueData] = useState({
    labels: [],
    datasets: []
  });
  
  const [appointmentData, setAppointmentData] = useState({
    labels: [],
    datasets: []
  });
  
  const [servicePopularity, setServicePopularity] = useState({
    labels: [],
    datasets: []
  });
  
  const [customerStats, setCustomerStats] = useState({
    totalCustomers: 0,
    repeatRate: 0,
    averageSpend: 0,
    newVsReturning: {
      labels: ['New Customers', 'Returning Customers'],
      datasets: []
    }
  });
  
  useEffect(() => {
    if (shopId) {
      fetchAnalyticsData();
    }
  }, [shopId, period]);
  
  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch revenue analytics
      const revenueResponse = await api.get(`/shops/${shopId}/analytics/revenue`, {
        params: { period }
      });
      
      // Process revenue data
      const revenueLabels = revenueResponse.data.revenue.data.map(item => item.date);
      const revenueValues = revenueResponse.data.revenue.data.map(item => item.revenue);
      const appointmentCounts = revenueResponse.data.revenue.data.map(item => item.count);
      
      setRevenueData({
        labels: revenueLabels,
        datasets: [
          {
            label: 'Revenue',
            data: revenueValues,
            fill: false,
            backgroundColor: 'rgba(208, 161, 137, 0.5)',
            borderColor: 'rgba(208, 161, 137, 1)',
            tension: 0.4
          }
        ]
      });
      
      setAppointmentData({
        labels: revenueLabels,
        datasets: [
          {
            label: 'Appointments',
            data: appointmentCounts,
            backgroundColor: 'rgba(163, 135, 114, 0.7)',
            borderColor: 'rgba(163, 135, 114, 1)',
            borderWidth: 1
          }
        ]
      });
      
      // Set service popularity data
      const popularServices = revenueResponse.data.popularServices || [];
      setServicePopularity({
        labels: popularServices.map(service => service.name),
        datasets: [
          {
            label: 'Service Bookings',
            data: popularServices.map(service => service.count),
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)',
              'rgba(255, 159, 64, 0.7)',
              'rgba(199, 199, 199, 0.7)',
              'rgba(83, 102, 255, 0.7)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(199, 199, 199, 1)',
              'rgba(83, 102, 255, 1)'
            ],
            borderWidth: 1
          }
        ]
      });
      
      // Fetch customer analytics
      const customerResponse = await api.get(`/shops/${shopId}/analytics/customers`);
      
      const customerData = customerResponse.data;
      
      setCustomerStats({
        totalCustomers: customerData.metrics.totalCustomers,
        repeatRate: customerData.metrics.repeatRate,
        averageSpend: customerData.metrics.averageSpend,
        newVsReturning: {
          labels: ['New Customers', 'Returning Customers'],
          datasets: [
            {
              label: 'Customer Type',
              data: [
                customerData.metrics.totalCustomers - customerData.metrics.returningCustomers,
                customerData.metrics.returningCustomers
              ],
              backgroundColor: [
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 99, 132, 0.7)'
              ],
              borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(255, 99, 132, 1)'
              ],
              borderWidth: 1
            }
          ]
        },
        customersByMonth: {
          labels: customerData.customersByMonth.map(item => item.month),
          datasets: [
            {
              label: 'New Customers',
              data: customerData.customersByMonth.map(item => item.new),
              backgroundColor: 'rgba(54, 162, 235, 0.7)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            },
            {
              label: 'Returning Customers',
              data: customerData.customersByMonth.map(item => item.returning),
              backgroundColor: 'rgba(255, 99, 132, 0.7)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1
            }
          ]
        }
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Failed to load analytics data. Please try again later.');
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const exportAnalytics = () => {
    // In a real implementation, you would generate a CSV/PDF report
    toast.success('Analytics report downloading...');
    
    setTimeout(() => {
      toast.success('Analytics exported successfully!');
    }, 1500);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-center">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchAnalyticsData}
          className="mt-4 bg-[#doa189] text-white py-2 px-4 rounded-lg hover:bg-[#ecdfcf] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-[#fef4ea] min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#a38772] mb-4 md:mb-0">
            Business Analytics
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#doa189] bg-white"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            
            <button
              onClick={exportAnalytics}
              className="flex items-center justify-center bg-[#doa189] hover:bg-[#ecdfcf] text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              <FaDownload className="mr-2" />
              Export Report
            </button>
          </div>
        </div>
        
        {/* Analytics Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <FaMoneyBillWave className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-800">
                  ₹{revenueData.datasets[0]?.data.reduce((sum, item) => sum + item, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                <FaCalendarAlt className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-600">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-800">
                  {appointmentData.datasets[0]?.data.reduce((sum, item) => sum + item, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                <FaUsers className="text-purple-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-800">
                  {customerStats.totalCustomers}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                <FaChartLine className="text-yellow-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-600">Repeat Customer Rate</p>
                <p className="text-2xl font-bold text-gray-800">
                  {customerStats.repeatRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-[#a38772] mb-4">Revenue</h2>
            <Line data={revenueData} options={chartOptions} />
          </div>
          
          {/* Appointment Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-[#a38772] mb-4">Appointments</h2>
            <Bar data={appointmentData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;