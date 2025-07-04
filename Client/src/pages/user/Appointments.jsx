// client/src/pages/user/Appointments.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FaCalendarAlt,
  FaFilter,
  FaSearch,
  FaSort
} from 'react-icons/fa';
import toast from 'react-hot-toast';

import { getUserAppointments } from '../../services/appointmentService'; // Use specific service import
import AppointmentCard from './AppointmentCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  // Fetch appointments on component mount
  useEffect(() => {
    const fetchUserAppointments = async () => {
      setIsLoading(true);
      try {
        const data = await getUserAppointments(); // Use the imported service function
        setAppointments(data);
      } catch (error) {
        console.error('Error fetching user appointments:', error);
        toast.error('Failed to load appointments.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAppointments();
  }, []); // Empty dependency array means this runs once on mount

  // Memoize filtered and sorted appointments to prevent unnecessary re-renders
  const filteredAndSortedAppointments = useMemo(() => {
    let filtered = [...appointments];

    const now = new Date();

    // Filter by tab
    if (activeTab === 'upcoming') {
      filtered = filtered.filter(appointment =>
        new Date(appointment.date) >= now &&
        appointment.status !== 'cancelled' &&
        appointment.status !== 'completed' &&
        appointment.status !== 'no-show'
      );
    } else if (activeTab === 'past') {
      filtered = filtered.filter(appointment =>
        new Date(appointment.date) < now ||
        appointment.status === 'cancelled' ||
        appointment.status === 'completed' ||
        appointment.status === 'no-show'
      );
    }
    // 'all' tab doesn't need initial filtering by date

    // Filter by status (applies to all tabs if a specific status is chosen)
    if (statusFilter !== 'all') {
      filtered = filtered.filter(appointment =>
        appointment.status === statusFilter
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(appointment =>
        appointment.service?.name.toLowerCase().includes(query) || // Added optional chaining
        appointment.shop?.name.toLowerCase().includes(query) || // Added optional chaining
        appointment._id?.toLowerCase().includes(query.substring(0,8)) // Allow searching by truncated ID
      );
    }

    // Apply sorting
    if (sortBy === 'date-desc') {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'date-asc') {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => (b.service?.price || 0) - (a.service?.price || 0)); // Handle potential undefined price
    } else if (sortBy === 'price-asc') {
      filtered.sort((a, b) => (a.service?.price || 0) - (b.service?.price || 0)); // Handle potential undefined price
    }

    return filtered;
  }, [appointments, activeTab, statusFilter, searchQuery, sortBy]);

  // Handler for when an appointment's status changes (e.g., cancelled)
  const handleStatusChange = () => {
    // Re-fetch appointments to get the updated list from the server
    const fetchUserAppointments = async () => {
      setIsLoading(true);
      try {
        const data = await getUserAppointments();
        setAppointments(data);
      } catch (error) {
        console.error('Error fetching user appointments after status change:', error);
        toast.error('Failed to refresh appointments.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserAppointments();
  };

  // Memoized counts for tab labels
  const upcomingCount = useMemo(() => appointments.filter(appointment =>
    new Date(appointment.date) >= new Date() &&
    appointment.status !== 'cancelled' &&
    appointment.status !== 'completed' &&
    appointment.status !== 'no-show'
  ).length, [appointments]);

  const pastCount = useMemo(() => appointments.filter(appointment =>
    new Date(appointment.date) < new Date() ||
    appointment.status === 'cancelled' ||
    appointment.status === 'completed' ||
    appointment.status === 'no-show'
  ).length, [appointments]);

  return (
    <div className="bg-[#fef4ea] min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#a38772] mb-4 md:mb-0">
            My Appointments
          </h1>

          <Link
            to="/shops"
            className="inline-flex items-center bg-[#d0a189] hover:bg-[#b88c6e] text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-md"
          >
            <FaCalendarAlt className="mr-2" />
            Book New Appointment
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-4 px-6 text-center focus:outline-none transition-colors duration-200 ${
                activeTab === 'upcoming'
                  ? 'border-b-2 border-[#d0a189] text-[#d0a189] font-medium'
                  : 'text-gray-500 hover:text-[#a38772]'
              }`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming ({upcomingCount})
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center focus:outline-none transition-colors duration-200 ${
                activeTab === 'past'
                  ? 'border-b-2 border-[#d0a189] text-[#d0a189] font-medium'
                  : 'text-gray-500 hover:text-[#a38772]'
              }`}
              onClick={() => setActiveTab('past')}
            >
              Past ({pastCount})
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center focus:outline-none transition-colors duration-200 ${
                activeTab === 'all'
                  ? 'border-b-2 border-[#d0a189] text-[#d0a189] font-medium'
                  : 'text-gray-500 hover:text-[#a38772]'
              }`}
              onClick={() => setActiveTab('all')}
            >
              All Appointments ({appointments.length})
            </button>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 items-center">
              {/* Search */}
              <div className="relative flex-grow w-full md:w-auto">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search service or shop name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189] focus:ring-1 focus:ring-[#d0a189]"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center w-full md:w-auto">
                <FaFilter className="text-gray-400 mr-2" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-2 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189] focus:ring-1 focus:ring-[#d0a189] appearance-none bg-white bg-no-repeat bg-[length:1.2em_1.2em] bg-[right_0.5rem_center]"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239CA3AF'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`}}
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
              <div className="flex items-center w-full md:w-auto">
                <FaSort className="text-gray-400 mr-2" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full pl-2 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189] focus:ring-1 focus:ring-[#d0a189] appearance-none bg-white bg-no-repeat bg-[length:1.2em_1.2em] bg-[right_0.5rem_center]"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239CA3AF'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`}}
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
                <p className="text-gray-500 mt-3">Loading your appointments...</p>
              </div>
            ) : filteredAndSortedAppointments.length > 0 ? (
              <div className="space-y-4">
                {filteredAndSortedAppointments.map(appointment => (
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
                icon={<FaCalendarAlt className="text-6xl text-[#d0a189]" />}
                title={`No ${activeTab} Appointments Found`}
                message={
                  searchQuery || statusFilter !== 'all'
                    ? "No appointments match your current filters. Try adjusting your search or filter options."
                    : activeTab === 'upcoming'
                    ? "You don't have any upcoming appointments scheduled."
                    : "You don't have any past appointments yet."
                }
                actionComponent={
                    (searchQuery || statusFilter !== 'all') ? (
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setStatusFilter('all');
                                setActiveTab('all'); // Reset activeTab when clearing filters
                            }}
                            className="text-[#d0a189] hover:underline font-medium px-4 py-2 rounded-md transition-colors"
                        >
                            Clear Filters
                        </button>
                    ) : (
                        <Link
                            to="/shops"
                            className="inline-flex items-center bg-[#d0a189] hover:bg-[#b88c6e] text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-md"
                        >
                            <FaCalendarAlt className="mr-2" /> Book an Appointment
                        </Link>
                    )
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