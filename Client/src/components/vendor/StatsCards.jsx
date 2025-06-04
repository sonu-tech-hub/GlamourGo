import React from 'react';
import {
  FaCalendarAlt,
  FaMoneyBillWave,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaStar,
  FaUserPlus,
  FaUserTie,
  FaExchangeAlt
} from 'react-icons/fa';

const StatsCards = ({ stats, isLoading }) => {
  const cards = [
    {
      title: 'Total Users',
      value: stats.totalUsers ?? 0,
      icon: <FaUsers className="text-white text-2xl" />,
      color: 'bg-blue-600',
      change: '+3% from last month'
    },
    {
      title: 'New Users This Month',
      value: stats.newUsersThisMonth ?? 0,
      icon: <FaUserPlus className="text-white text-2xl" />,
      color: 'bg-purple-600',
      change: null
    },
    {
      title: 'Total Vendors',
      value: stats.totalVendors ?? 0,
      icon: <FaUserTie className="text-white text-2xl" />,
      color: 'bg-indigo-600',
      change: null
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers ?? 0,
      icon: <FaUsers className="text-white text-2xl" />,
      color: 'bg-yellow-500',
      change: '+5% from last month'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue ?? 0}`,
      icon: <FaMoneyBillWave className="text-white text-2xl" />,
      color: 'bg-green-500',
      change: '+8% from last month'
    },
    {
      title: 'Average Transaction Value',
      value: `₹${stats.averageTransactionValue ?? 0}`,
      icon: <FaExchangeAlt className="text-white text-2xl" />,
      color: 'bg-emerald-500',
      change: null
    },
    {
      title: 'Total Transactions',
      value: stats.totalTransactions ?? 0,
      icon: <FaExchangeAlt className="text-white text-2xl" />,
      color: 'bg-pink-500',
      change: null
    },
    {
      title: 'Completed Transactions',
      value: stats.completedTransactions ?? 0,
      icon: <FaCheckCircle className="text-white text-2xl" />,
      color: 'bg-green-600',
      change: null
    },
    {
      title: 'Total Appointments',
      value: stats.totalAppointments ?? 0,
      icon: <FaCalendarAlt className="text-white text-2xl" />,
      color: 'bg-blue-500',
      change: '+12% from last month'
    },
    {
      title: 'Today\'s Appointments',
      value: stats.todayAppointments ?? '--',
      icon: <FaCalendarAlt className="text-white text-2xl" />,
      color: 'bg-purple-500',
      change: null
    },
    {
      title: 'Today\'s Revenue',
      value: `₹${stats.todayRevenue ?? 0}`,
      icon: <FaMoneyBillWave className="text-white text-2xl" />,
      color: 'bg-green-400',
      change: null
    },
    {
      title: 'Rating',
      value: stats.reviewsAverage ? stats.reviewsAverage.toFixed(1) : '0.0',
      icon: <FaStar className="text-white text-2xl" />,
      color: 'bg-orange-500',
      change: null
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-start">
            <div
              className={`w-12 h-12 rounded-full ${card.color} flex items-center justify-center mr-4`}
            >
              {card.icon}
            </div>
            <div>
              <h3 className="text-gray-500 font-medium">{card.title}</h3>
              {isLoading ? (
                <div className="h-7 w-24 bg-gray-200 rounded animate-pulse mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              )}
              {card.change && (
                <p className="text-xs text-green-600 mt-1">{card.change}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
