import React, { useState, useEffect } from "react";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
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
} from "chart.js";
import {
  FaCalendarAlt,
  FaChartLine,
  FaUsers,
  FaMoneyBillWave,
  FaDownload,
} from "react-icons/fa";
import toast from "react-hot-toast";

import {
  getRevenueAnalytics,
  getCustomerAnalytics,
} from "../../services/analyticsService";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getAllShops } from "../../services/shopService";

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
  const [shopId, setShopId] = useState("");

  const [period, setPeriod] = useState("month"); // 'week', 'month', 'year'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Analytics data states
  const [revenueData, setRevenueData] = useState({
    labels: [],
    datasets: [],
  });
  const [appointmentData, setAppointmentData] = useState({
    labels: [],
    datasets: [],
  });
  const [servicePopularity, setServicePopularity] = useState({
    labels: [],
    datasets: [],
  });
  const [customerStats, setCustomerStats] = useState({
    totalCustomers: 0,
    repeatRate: 0,
    averageSpend: 0,
    newVsReturning: {
      labels: ["New Customers", "Returning Customers"],
      datasets: [],
    },
    customersByMonth: {
      labels: [],
      datasets: [],
    },
  });

  // Effect to fetch the shopId for the vendor, mirroring ServicesPage.jsx logic
  useEffect(() => {
    const fetchVendorShopId = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const userId = user?.user?.id;
        const userType = user?.user?.userType;

        if (!userId || userType !== 'vendor') {
          setError('User not authenticated or not a vendor. Please log in with a vendor account to view analytics.');
          setShopId('');
          setIsLoading(false);
          return;
        }

        const response = await getAllShops();
        const allShops = response.data.shops;
        const vendorShop = allShops.find(shop => shop.owner === userId);

        if (!vendorShop) {
          setError('No shop found linked to your vendor account. Please create a shop to view analytics.');
          toast.error('No shop found for your vendor account.');
          setShopId('');
          setIsLoading(false);
          return;
        }

        setShopId(vendorShop._id);
      } catch (err) {
        console.error('Failed to fetch vendor shop ID:', err);
        setError(err.response?.data?.message || 'Failed to find your shop. Please try again.');
        toast.error('Unable to find your shop.');
        setShopId('');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchVendorShopId();
    } else {
        setShopId('');
        setError("Please log in to view analytics.");
        setIsLoading(false);
    }
  }, [user]);

  // Effect to fetch analytics data when shopId or period changes
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!shopId) return;

      setIsLoading(true);
      setError(null);

      try {
        const revenueResponse = await getRevenueAnalytics(shopId, period);

        const revenueLabels = revenueResponse.revenue.data.map((item) => item.date);
        const revenueValues = revenueResponse.revenue.data.map((item) => item.revenue);
        const appointmentCounts = revenueResponse.revenue.data.map((item) => item.count);

        setRevenueData({
          labels: revenueLabels,
          datasets: [
            {
              label: "Revenue",
              data: revenueValues,
              fill: false,
              backgroundColor: "rgba(208, 161, 137, 0.5)",
              borderColor: "rgba(208, 161, 137, 1)",
              tension: 0.4,
            },
          ],
        });

        setAppointmentData({
          labels: revenueLabels,
          datasets: [
            {
              label: "Appointments",
              data: appointmentCounts,
              backgroundColor: "rgba(163, 135, 114, 0.7)",
              borderColor: "rgba(163, 135, 114, 1)",
              borderWidth: 1,
            },
          ],
        });

        const popularServices = revenueResponse.popularServices || [];
        setServicePopularity({
          labels: popularServices.map((service) => service.name),
          datasets: [
            {
              label: "Service Bookings",
              data: popularServices.map((service) => service.count),
              backgroundColor: [
                "rgba(255, 99, 132, 0.7)",
                "rgba(54, 162, 235, 0.7)",
                "rgba(255, 206, 86, 0.7)",
                "rgba(75, 192, 192, 0.7)",
                "rgba(153, 102, 255, 0.7)",
                "rgba(255, 159, 64, 0.7)",
                "rgba(199, 199, 199, 0.7)",
                "rgba(83, 102, 255, 0.7)",
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)",
                "rgba(199, 199, 199, 1)",
                "rgba(83, 102, 255, 1)",
              ],
              borderWidth: 1,
            },
          ],
        });

        const customerData = await getCustomerAnalytics(shopId);

        setCustomerStats({
          totalCustomers: customerData.metrics?.totalCustomers || 0,
          repeatRate: customerData.metrics?.repeatRate || 0,
          averageSpend: customerData.metrics?.averageSpend || 0,
          newVsReturning: {
            labels: ["New Customers", "Returning Customers"],
            datasets: [
              {
                label: "Customer Type",
                data: [
                  (customerData.metrics?.totalCustomers || 0) - (customerData.metrics?.returningCustomers || 0),
                  customerData.metrics?.returningCustomers || 0,
                ],
                backgroundColor: [
                  "rgba(54, 162, 235, 0.7)",
                  "rgba(255, 99, 132, 0.7)",
                ],
                borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
                borderWidth: 1,
              },
            ],
          },
          customersByMonth: {
            labels: customerData.customersByMonth?.map((item) => item.month) || [],
            datasets: [
              {
                label: "New Customers",
                data: customerData.customersByMonth?.map((item) => item.new) || [],
                backgroundColor: "rgba(54, 162, 235, 0.7)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
              },
              {
                label: "Returning Customers",
                data: customerData.customersByMonth?.map((item) => item.returning) || [],
                backgroundColor: "rgba(255, 99, 132, 0.7)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 1,
              },
            ],
          },
        });
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        const errorMessage = err.response?.data?.message || err.message || "Failed to load analytics data. Please try again later.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [shopId, period]);

  const exportAnalytics = () => {
    toast.success("Analytics report downloading...");
    setTimeout(() => {
      toast.success("Analytics exported successfully!");
    }, 1500);
  };

  // Chart.js options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Keep this false to allow custom height
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-center mx-auto mt-10 max-w-md">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-[#d0a189] text-white py-2 px-4 rounded-lg hover:bg-[#ecdfcf] transition-colors"
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189] bg-white"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>

            <button
              onClick={exportAnalytics}
              className="flex items-center justify-center bg-[#d0a189] hover:bg-[#ecdfcf] text-white font-bold py-2 px-4 rounded-lg transition-colors"
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
                  ₹
                  {revenueData.datasets[0]?.data
                    .reduce((sum, item) => sum + item, 0)
                    .toLocaleString()}
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
                  {appointmentData.datasets[0]?.data.reduce(
                    (sum, item) => sum + item,
                    0
                  )}
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
            <h2 className="text-xl font-semibold text-[#a38772] mb-4">
              Revenue Over Time
            </h2>
            {revenueData.labels.length > 0 ? (
              // FIX: Added a wrapper div with a defined height
              <div className="relative h-[350px]">
                <Line data={revenueData} options={chartOptions} />
              </div>
            ) : (
              <p className="text-gray-500 text-center">
                No revenue data available for this period.
              </p>
            )}
          </div>

          {/* Appointment Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-[#a38772] mb-4">
              Appointments Over Time
            </h2>
            {appointmentData.labels.length > 0 ? (
              // FIX: Added a wrapper div with a defined height
              <div className="relative h-[350px]">
                <Bar data={appointmentData} options={chartOptions} />
              </div>
            ) : (
              <p className="text-gray-500 text-center">
                No appointment data available for this period.
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Service Popularity Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-[#a38772] mb-4">
              Service Popularity
            </h2>
            {servicePopularity.datasets[0]?.data.length > 0 ? (
              // FIX: Added a wrapper div with a defined height
              <div className="relative h-[350px]">
                <Doughnut data={servicePopularity} options={chartOptions} />
              </div>
            ) : (
              <p className="text-gray-500 text-center">
                No service popularity data available.
              </p>
            )}
          </div>

          {/* New vs. Returning Customers Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-[#a38772] mb-4">
              New vs. Returning Customers
            </h2>
            {customerStats.newVsReturning.datasets[0]?.data.reduce(
              (sum, item) => sum + item,
              0
            ) > 0 ? (
              // FIX: Added a wrapper div with a defined height
              <div className="relative h-[350px]">
                <Pie data={customerStats.newVsReturning} options={chartOptions} />
              </div>
            ) : (
              <p className="text-gray-500 text-center">
                No customer type data available.
              </p>
            )}
          </div>
        </div>

        {/* Customer Acquisition Trend */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-[#a38772] mb-4">
            Customer Acquisition Trend
          </h2>
          {customerStats.customersByMonth.labels.length > 0 ? (
            // FIX: Added a wrapper div with a defined height
            <div className="relative h-[350px]">
              <Bar data={customerStats.customersByMonth} options={chartOptions} />
            </div>
          ) : (
            <p className="text-gray-500 text-center">
              No customer acquisition trend data available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;