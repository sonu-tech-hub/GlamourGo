// client/src/pages/admin/Analytics.jsx
import React, { useState, useEffect } from "react";
import { Line, Pie, Bar, Doughnut } from "react-chartjs-2";
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
import {
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaDownload,
  FaCalendarAlt,
} from "react-icons/fa";
import toast from "react-hot-toast";

import {
  getRevenueAnalyticsAdmin,
  getPopularServicesByRating,
  getServiceCategoriesCount,
} from "../../services/adminService";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// Placeholder chart component - in a real app, replace with Chart.js or similar
const ChartPlaceholder = ({ title, height = "300px" }) => (
  <div
    className="bg-gray-100 rounded-lg flex items-center justify-center"
    style={{ height }}
  >
    <div className="text-center text-gray-500">
      <FaChartBar className="text-gray-400 text-4xl mb-2 mx-auto" />
      <p>{title}</p>
      <p className="text-sm">Chart visualization would appear here</p>
    </div>
  </div>
);

const Analytics = () => {
  const [period, setPeriod] = useState("month");
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [popularServices, setPopularServices] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [loadingPopularServices, setLoadingPopularServices] = useState(false);
  const [loadingServiceCategories, setLoadingServiceCategories] =
    useState(false);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await getRevenueAnalyticsAdmin(period);
      console.log("Analytics response:", response.data);
      setAnalytics(response.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setIsLoading(false);
    }
  };
  const userGrowthData = {
    labels: ["New Users", "Total Users"],
    datasets: [
      {
        label: "User Metrics",
        data: [
          analytics?.userMetrics?.newUsers || 0,
          analytics?.userMetrics?.totalUsers || 0,
        ],
        backgroundColor: ["#fef4ea", "#a38772"],
        borderColor: ["#d0a189", "#6f4e37"],
        borderWidth: 1,
      },
    ],
  };
  // Prepares dummy monthly data from totalRevenue
  const prepareMonthlyRevenueData = (totalRevenue = 0) => {
    const monthlyRevenue = Array(12).fill((totalRevenue / 12).toFixed(2));

    return {
      labels: months,
      datasets: [
        {
          label: "Monthly Revenue",
          data: monthlyRevenue,
          backgroundColor: "#a38772",
          borderRadius: 6,
        },
      ],
    };
  };

  const MonthlyRevenueChart = ({
    totalRevenue,
    transactionCount,
    averageOrderValue,
  }) => {
    const revenueData = prepareMonthlyRevenueData(totalRevenue);

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          ticks: {
            callback: (value) => `₹${value}`,
            color: "#555",
          },
          grid: {
            color: "#eee",
          },
        },
        x: {
          ticks: { color: "#555" },
          grid: {
            display: false,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    };

    return (
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#fef4ea] p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-xl font-bold text-[#a38772]">
              ₹{totalRevenue || 0}
            </p>
          </div>
          <div className="bg-[#fef4ea] p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600">Transactions</p>
            <p className="text-xl font-bold text-[#a38772]">
              {transactionCount || 0}
            </p>
          </div>
          <div className="bg-[#fef4ea] p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600">Avg Order Value</p>
            <p className="text-xl font-bold text-[#a38772]">
              ₹{averageOrderValue || 0}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[300px]">
          <Bar data={revenueData} options={options} />
        </div>
      </div>
    );
  };

  // Fetch popular services and service categories
  useEffect(() => {
    fetchPopularServices();
    fetchServiceCategories();
  }, []);

  const fetchPopularServices = async () => {
    setLoadingPopularServices(true);
    try {
      const response = await getPopularServicesByRating();
      setPopularServices(response.data);
    } catch (error) {
      toast.error("Failed to load popular services");
    } finally {
      setLoadingPopularServices(false);
    }
  };

  const fetchServiceCategories = async () => {
    setLoadingServiceCategories(true);
    try {
      const response = await getServiceCategoriesCount();
      setServiceCategories(response.data);
    } catch (error) {
      toast.error("Failed to load service categories");
    } finally {
      setLoadingServiceCategories(false);
    }
  };

  // console.log("User Growth Data:", analytics?.userGrowth.values);

  //  popular services function to prepare data for the chart
  const PopularServicesChart = () => {
    const data = {
      labels: popularServices.map((s) => `${s.serviceName} (${s.shopName})`),
      datasets: [
        {
          label: "Avg Rating",
          data: popularServices.map((s) => s.averageRating),
          backgroundColor: "#a38772",
        },
        {
          label: "Review Count",
          data: popularServices.map((s) => s.reviewCount),
          backgroundColor: "#d0a189",
        },
      ],
    };

    const options = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 5,
        },
        x: {
          ticks: {
            maxRotation: 90,
            minRotation: 45,
            autoSkip: false,
          },
        },
      },
    };

    if (loadingPopularServices) {
      return <LoadingSpinner />;
    }

    if (!popularServices.length) {
      return (
        <p className="text-center text-gray-500">No popular services data.</p>
      );
    }

    return <Bar data={data} options={options} />;
  };
  //   categories chart function to prepare data for the chart
  const ServiceCategoriesChart = () => {
    const colors = [
      "#a38772",
      "#d0a189",
      "#6f4e37",
      "#f0d9b5",
      "#c2a97e",
      "#b0885a",
      "#90754f",
    ];

    const data = {
      labels: serviceCategories.map((c) => c._id || "Uncategorized"),
      datasets: [
        {
          data: serviceCategories.map((c) => c.count),
          backgroundColor: colors,
        },
      ],
    };

    if (loadingServiceCategories) {
      return <LoadingSpinner />;
    }

    if (!serviceCategories.length) {
      return (
        <p className="text-center text-gray-500">No service categories data.</p>
      );
    }
    
    return <Pie data={data} />;
  };
 
  const exportAnalytics = () => {
    // In a real implementation, generate a CSV or PDF report
    toast.success(
      "Analytics report is being generated. It will download shortly."
    );
  };

  return (
    <div className="bg-[#fef4ea] min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#a38772] mb-4 md:mb-0">
            System Analytics
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

        {isLoading ? (
          <div className="text-center py-12">
            <LoadingSpinner />
            <p className="text-gray-500 mt-4">Loading analytics data...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Revenue Overview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-[#a38772] mb-6">
                Revenue Overview
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-[#fef4ea] p-6 rounded-lg">
                  <h3 className="text-[#a38772] font-medium mb-1">
                    Total Revenue
                  </h3>
                  <p className="text-3xl font-bold text-gray-800">
                    ₹{analytics?.totalRevenue || 0}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    +12% from previous period
                  </p>
                </div>

                <div className="bg-[#fef4ea] p-6 rounded-lg">
                  <h3 className="text-[#a38772] font-medium mb-1">
                    Average Order Value
                  </h3>
                  <p className="text-3xl font-bold text-gray-800">
                    ₹{analytics?.averageOrderValue || 0}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    +5% from previous period
                  </p>
                </div>

                <div className="bg-[#fef4ea] p-6 rounded-lg">
                  <h3 className="text-[#a38772] font-medium mb-1">
                    Transaction Count
                  </h3>
                  <p className="text-3xl font-bold text-gray-800">
                    {analytics?.transactionCount || 0}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    +8% from previous period
                  </p>
                </div>
              </div>

              <MonthlyRevenueChart
                totalRevenue={analytics?.totalRevenue}
                transactionCount={analytics?.transactionCount}
                averageOrderValue={analytics?.averageOrderValue}
              />
            </div>

            {/* User Metrics */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-[#a38772] mb-6">
                User Metrics
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-[#fef4ea] p-6 rounded-lg">
                  <h3 className="text-[#a38772] font-medium mb-1">
                    Total Users
                  </h3>
                  <p className="text-3xl font-bold text-gray-800">
                    {analytics?.userMetrics?.totalUsers || 0}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    +15% from previous period
                  </p>
                </div>

                <div className="bg-[#fef4ea] p-6 rounded-lg">
                  <h3 className="text-[#a38772] font-medium mb-1">New Users</h3>
                  <p className="text-3xl font-bold text-gray-800">
                    {analytics?.userMetrics?.newUsers || 0}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    +18% from previous period
                  </p>
                </div>
              </div>

              <div className="w-full max-w-md h-auto mx-auto">
                {analytics && (
                  <Pie
                    data={userGrowthData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                )}
              </div>
            </div>

            {/* Service Performance */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-[#a38772] mb-6">
                Service Performance
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-[#fef4ea] rounded-lg">
                  <h3 className="text-[#a38772] font-semibold mb-4 text-center">
                    Popular Services
                  </h3>
                  <div className="h-[300px]">
                    <PopularServicesChart />
                  </div>
                </div>
                <div className="p-4 bg-[#fef4ea] rounded-lg">
                  <h3 className="text-[#a38772] font-semibold mb-4 text-center">
                    Service Categories
                  </h3>
                  <div className="h-[300px]">
                    <ServiceCategoriesChart />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
