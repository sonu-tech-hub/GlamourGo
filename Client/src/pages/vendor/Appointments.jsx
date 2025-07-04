// pages/vendor/ShopAppointmentsPage.jsx
import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaClipboardCheck, FaRegTimesCircle } from 'react-icons/fa'; // Added new icons
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns'; // For date formatting

import { getShopAppointments, updateAppointmentStatus } from '../../services/appointmentService';
import { getAllShops } from '../../services/shopService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/common/ConfirmationModal'; // Re-using existing modal
import AppointmentDetailsModal from './AppointmentDetailsModal'; // New modal for details/status update

const Appointments = () => {
    const { user } = useAuth();
    const [shopId, setShopId] = useState('');
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false); // Add this state for button loading

    // Filter/Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedDate, setSelectedDate] = useState(''); // For date filtering

    // Modals states
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isConfirmStatusModalOpen, setIsConfirmStatusModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [newStatusForConfirm, setNewStatusForConfirm] = useState('');

    useEffect(() => {
        const fetchVendorShop = async () => {
            try {
                const userId = user?.user?.id;
                const userType = user?.user?.userType;

                if (!userId || userType !== 'vendor') {
                    setIsLoading(false);
                    toast.error('Only vendors can access this page.');
                    return;
                }

                const response = await getAllShops();
                const allShops = response.data.shops;
                const vendorShop = allShops.find(shop => shop.owner === userId);

                if (!vendorShop) {
                    toast.error('No shop found for your vendor account. Please create one.');
                    setIsLoading(false);
                    return;
                }
                setShopId(vendorShop._id);
            } catch (error) {
                console.error('Failed to fetch shop for vendor:', error);
                toast.error('Unable to find your shop. Please try again later.');
                setIsLoading(false);
            }
        };

        if (user) { // Only fetch if user object is available
            fetchVendorShop();
        }
    }, [user]);

    // --- Fetch Appointments once shopId is available ---
    const fetchAppointments = async () => {
        if (!shopId) return;
        setIsLoading(true);
        try {
            const response = await getShopAppointments(shopId);
            // Assuming 'response.appointments' is an array from backend
            const fetchedAppointments = response.appointments;

            if (!Array.isArray(fetchedAppointments)) {
                console.error('API did not return an array of appointments:', fetchedAppointments);
                toast.error('Invalid appointment data received.');
                setAppointments([]);
                setFilteredAppointments([]);
                return;
            }

            const sortedAppointments = fetchedAppointments.sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.startTime}`);
                const dateB = new Date(`${b.date}T${b.startTime}`);
                return dateB - dateA; // Most recent first
            });
            setAppointments(sortedAppointments);
            // Re-apply current filters after re-fetching, to keep view consistent
            applyFilters(sortedAppointments, searchQuery, selectedStatus, selectedDate);
        } catch (error) {
            console.error('Error fetching shop appointments:', error);
            toast.error(error.response?.data?.message || 'Failed to load appointments.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (shopId) { // Ensure shopId is set before fetching appointments
            fetchAppointments();
        }
    }, [shopId]); // Depend on shopId

    // --- Filtering Logic Helper ---
    const applyFilters = (appts, query, status, date) => {
        let currentFiltered = [...appts];

        if (status !== 'all') {
            currentFiltered = currentFiltered.filter(appt => appt.status === status);
        }

        if (date) {
            currentFiltered = currentFiltered.filter(appt =>
                format(parseISO(appt.date), 'yyyy-MM-dd') === date
            );
        }

        if (query) {
            const lowerCaseQuery = query.toLowerCase();
            currentFiltered = currentFiltered.filter(appt =>
                appt.user?.name?.toLowerCase().includes(lowerCaseQuery) ||
                appt.service?.name?.toLowerCase().includes(lowerCaseQuery) ||
                appt.notes?.toLowerCase().includes(lowerCaseQuery)
            );
        }
        setFilteredAppointments(currentFiltered);
    };

    // --- Apply filters whenever dependencies change ---
    useEffect(() => {
        applyFilters(appointments, searchQuery, selectedStatus, selectedDate);
    }, [appointments, searchQuery, selectedStatus, selectedDate]);


    // --- Status Update Handlers ---
    const handleStatusChangeClick = (appointment, newStatus) => {
        setSelectedAppointment(appointment);
        setNewStatusForConfirm(newStatus);
        setIsConfirmStatusModalOpen(true);
    };

    const handleConfirmStatusUpdate = async () => {
        if (!selectedAppointment || !newStatusForConfirm) return;

        setIsProcessing(true); // Start processing
        try {
            await updateAppointmentStatus(selectedAppointment._id, newStatusForConfirm);
            toast.success(`Appointment status updated to '${newStatusForConfirm.charAt(0).toUpperCase() + newStatusForConfirm.slice(1).replace('-', ' ')}' successfully!`);
            setIsConfirmStatusModalOpen(false);
            await fetchAppointments(); // Re-fetch to update UI with latest statuses
        } catch (error) {
            console.error('Error updating appointment status:', error);
            toast.error(error.response?.data?.message || 'Failed to update status.');
        } finally {
            setSelectedAppointment(null);
            setNewStatusForConfirm('');
            setIsProcessing(false); // End processing
        }
    };

    const openDetailsModal = (appointment) => {
        setSelectedAppointment(appointment);
        setIsDetailsModalOpen(true);
    };

    const renderStatusBadge = (status) => {
        let colorClass = '';
        switch (status) {
            case 'pending': colorClass = 'bg-yellow-100 text-yellow-800'; break;
            case 'confirmed': colorClass = 'bg-blue-100 text-blue-800'; break;
            case 'completed': colorClass = 'bg-green-100 text-green-800'; break;
            case 'cancelled': colorClass = 'bg-red-100 text-red-800'; break;
            case 'rejected': colorClass = 'bg-purple-100 text-purple-800'; break;
            case 'no-show': colorClass = 'bg-gray-100 text-gray-800'; break;
            default: colorClass = 'bg-gray-200 text-gray-700';
        }
        return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>
                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </span>
        );
    };

    if (isLoading) {
        return (
            <div className="bg-[#fef4ea] min-h-screen flex items-center justify-center">
                <LoadingSpinner />
                <p className="text-gray-500 mt-2">Loading appointments...</p>
            </div>
        );
    }

    if (!shopId) {
        return (
            <div className="bg-[#fef4ea] min-h-screen flex items-center justify-center text-center py-12">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-[#a38772] mb-4">No Shop Found</h2>
                    <p className="text-gray-600 mb-6">You need to have a shop associated with your vendor account to view appointments.</p>
                    {/* Optionally, add a button to navigate to a "Create Shop" page */}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#fef4ea] min-h-screen py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <h1 className="text-3xl font-bold text-[#a38772] mb-4 md:mb-0">
                        Manage Appointments
                    </h1>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by user, service, or notes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#a38772]"
                            />
                        </div>

                        <div className="flex items-center">
                            <FaFilter className="text-gray-400 mr-2" />
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full pl-2 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#a38772]"
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="rejected">Rejected</option>
                                <option value="no-show">No-Show</option>
                            </select>
                        </div>

                        <div className="flex items-center">
                            <FaCalendarAlt className="text-gray-400 mr-2" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full pl-2 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#a38772]"
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-8">
                            <LoadingSpinner />
                            <p className="text-gray-500 mt-2">Loading appointments...</p>
                        </div>
                    ) : filteredAppointments.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-[#fef4ea]"> {/* Changed to match your branding color */}
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Appointment
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date & Time
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Service
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredAppointments.map(appointment => (
                                        <tr key={appointment._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{appointment._id.substring(0, 8)}...</div>
                                                <div className="text-sm text-gray-500">Booking ID</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {appointment.user?.name || 'N/A'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {appointment.user?.phone || appointment.user?.email || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {format(parseISO(appointment.date), 'MMM dd, yyyy')}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {appointment.startTime} - {appointment.endTime}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {appointment.service?.name || 'N/A'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ₹{appointment.payment?.amount || appointment.service?.price || '0.00'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {renderStatusBadge(appointment.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex flex-col space-y-2 items-end"> {/* Use flex-col for stacking buttons */}
                                                    {/* Buttons for Pending Appointments */}
                                                    {appointment.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusChangeClick(appointment, 'confirmed')}
                                                                disabled={isProcessing}
                                                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed w-fit"
                                                            >
                                                                <FaCheckCircle className="mr-1" /> Confirm
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusChangeClick(appointment, 'cancelled')}
                                                                disabled={isProcessing}
                                                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed w-fit"
                                                            >
                                                                <FaRegTimesCircle className="mr-1" /> Cancel
                                                            </button>
                                                        </>
                                                    )}
                                                    {/* Buttons for Confirmed Appointments */}
                                                    {appointment.status === 'confirmed' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusChangeClick(appointment, 'completed')}
                                                                disabled={isProcessing}
                                                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed w-fit"
                                                            >
                                                                <FaClipboardCheck className="mr-1" /> Complete
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusChangeClick(appointment, 'cancelled')}
                                                                disabled={isProcessing}
                                                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed w-fit"
                                                            >
                                                                <FaRegTimesCircle className="mr-1" /> Cancel
                                                            </button>
                                                        </>
                                                    )}
                                                    {/* Optional: View Details Button - always available */}
                                                    <button
                                                        onClick={() => openDetailsModal(appointment)}
                                                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-fit"
                                                    >
                                                        View Details
                                                    </button>
                                                    
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No appointments found for your shop.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Appointment Details/Status Update Modal */}
            {selectedAppointment && (
                <AppointmentDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    appointment={selectedAppointment}
                    onStatusChangeRequest={handleStatusChangeClick} // Pass handler for status change
                    shopOwnerId={user?.user?.id} // Pass current user ID for authorization check in modal
                />
            )}

            {/* Confirmation Modal for Status Change */}
            <ConfirmationModal
                isOpen={isConfirmStatusModalOpen}
                onClose={() => {
                    setIsConfirmStatusModalOpen(false);
                    setSelectedAppointment(null);
                    setNewStatusForConfirm('');
                }}
                onConfirm={handleConfirmStatusUpdate}
                title={`Confirm Status Change to '${newStatusForConfirm.charAt(0).toUpperCase() + newStatusForConfirm.slice(1).replace('-', ' ')}'`}
                message={`Are you sure you want to change the status of this appointment (${selectedAppointment?.user?.name || 'N/A'} for ${selectedAppointment?.service?.name || 'N/A'}) to "${newStatusForConfirm}"?`}
                confirmButtonText="Confirm Change"
                confirmButtonColor="blue" // You might adjust this to green for confirm, red for cancel etc.
            />
        </div>
    );
};

export default Appointments;