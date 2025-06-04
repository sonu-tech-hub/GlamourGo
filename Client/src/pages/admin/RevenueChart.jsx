// client/src/components/admin/RevenueChart.jsx
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { FaChartLine } from 'react-icons/fa';

import LoadingSpinner from '../../components/common/LoadingSpinner';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const RevenueChart = ({ isLoading }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });
  
  useEffect(() => {
    // In a real implementation, you'd fetch data from an API
    // This is mock data for demonstration
    const mockData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Revenue',
          data: [12500, 19000, 15000, 22000, 25000, 30000],
          borderColor: 'rgba(208, 161, 137, 1)',
          backgroundColor: 'rgba(208, 161, 137, 0.2)',
          tension: 0.4,
          fill: true
        }
      ]
    };
    
    setChartData(mockData);
  }, []);
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Revenue: ₹${context.raw.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        }
      }
    }
  };
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default RevenueChart;