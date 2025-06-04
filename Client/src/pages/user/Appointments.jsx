// client/src/pages/user/Appointments.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaCalendarAlt, 
  FaFilter,
  FaSearch,
  FaSortAmountDown,
  FaSort
} from 'react-icons/fa';
import toast from 'react-hot-toast';

import api from '../../services/api';
import AppointmentCard from './AppointmentCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  
  useEffect(() => {
    fetchAppointments();
  }, []);
  
  useEffect(() => {
    // Apply filters and sorting
    let filtered = [...appointments];
    
    // Filter by tab
    if (activeTab === 'upcoming') {
      filtered = filtered.filter(appointment => 
        new Date(appointment.date) >= new Date() && 
        appointment.status !== 'cancelled'
      );
    } else if (activeTab === 'past') {
      filtered = filtered.filter(appointment => 
        new Date(appointment.date) < new Date() || 
        appointment.status === 'cancelled'
      );
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(appointment => 
        appointment.status === statusFilter
      );
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(appointment => 
        appointment.service.name.toLowerCase().includes(query) ||
        appointment.shop.name.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    if (sortBy === 'date-desc') {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'date-asc') {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.service.price - a.service.price);
    } else if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.service.price - b.service.price);
    }
    
    setFilteredAppointments(filtered);
  }, [appointments, activeTab, statusFilter, searchQuery, sortBy]);
  
  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/appointments/user');
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStatusChange = () => {
    // Refresh appointments after status change
    fetchAppointments();
  };
  
  // Count upcoming appointments
  const upcomingCount = appointments.filter(appointment => 
    new Date(appointment.date) >= new Date() && 
    appointment.status !== 'cancelled'
  ).length;
  
  // Count past appointments
  const pastCount = appointments.filter(appointment => 
    new Date(appointment.date) < new Date() || 
    appointment.status === 'cancelled'
  ).length;
  
  return (
    <div className="bg-[#fef4ea] min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#a38772] mb-4 md:mb-0">
            My Appointments
          </h1>
          
          <Link
            to="/shops"
            className="inline-flex items-center border-2 bg-[#doa189] hover:bg-[#e1c5a1] text-[#875e2c] font-bold py-2 px-4 rounded-lg transition-colors"
          >
            <FaCalendarAlt className="mr-2" />
            Book New Appointment
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-4 px-6 text-center focus:outline-none ${
                activeTab === 'upcoming'
                  ? 'border-b-2 border-[#doa189] text-[#doa189] font-medium'
                  : 'text-gray-500 hover:text-[#a38772]'
              }`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming ({upcomingCount})
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center focus:outline-none ${
                activeTab === 'past'
                  ? 'border-b-2 border-[#doa189] text-[#doa189] font-medium'
                  : 'text-gray-500 hover:text-[#a38772]'
              }`}
              onClick={() => setActiveTab('past')}
            >
              Past ({pastCount})
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center focus:outline-none ${
                activeTab === 'all'
                  ? 'border-b-2 border-[#doa189] text-[#doa189] font-medium'
                  : 'text-gray-500 hover:text-[#a38772]'
              }`}
              onClick={() => setActiveTab('all')}
            >
              All Appointments ({appointments.length})
            </button>
          </div>
          
          {/* Filters */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
              {/* Search */}
              <div className="relative flex-grow">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search service or shop name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#doa189]"
                />
              </div>
              
              {/* Status Filter */}
              <div className="flex items-center">
                <FaFilter className="text-gray-400 mr-2" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-2 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#doa189]"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no-show">No-Show</option>
                </select>
              </div>
              
              {/* Sort Order */}
              <div className="flex items-center">
                <FaSort className="text-gray-400 mr-2" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-2 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#doa189]"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="price-asc">Price: Low to High</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Appointments List */}
          <div className="p-4">
            {isLoading ? (
              <div className="text-center py-8">
                <LoadingSpinner />
                <p className="text-gray-500 mt-3">Loading appointments...</p>
              </div>
            ) : filteredAppointments.length > 0 ? (
              <div className="space-y-4">
                {filteredAppointments.map(appointment => (
                  <AppointmentCard
                    key={appointment._id}
                    appointment={appointment}
                    showActions={true}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<FaCalendarAlt className="text-6xl" />}
                title={`No ${activeTab} Appointments Found`}
                message={
                  searchQuery || statusFilter !== 'all'
                    ? "No appointments match your filters. Try adjusting your search or filters."
                    : activeTab === 'upcoming'
                    ? "You don't have any upcoming appointments."
                    : "You don't have any past appointments yet."
                }
                actionText={
                  searchQuery || statusFilter !== 'all'
                    ? <span className=" text-[#875e2c] px-4 py-2 rounded-md cursor-pointer">Clear Filters</span>
                    : <span className=" text-[#875e2c] px-4 py-2 rounded-md cursor-pointer">Book an Appointment</span>
                }
                actionLink={
                  searchQuery || statusFilter !== 'all'
                    ? null
                    : "/shops"
                }
                onActionClick={
                  searchQuery || statusFilter !== 'all'
                    ? () => {
                        setSearchQuery('');
                        setStatusFilter('all');
                      }
                    : null
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
