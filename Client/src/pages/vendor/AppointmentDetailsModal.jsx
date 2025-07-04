// pages/vendor/AppointmentDetailsModal.jsx
import React from 'react'; // No need for useState if not managing internal state for form inputs etc.
import { FaTimes, FaUser, FaClock, FaTag, FaMoneyBill, FaCalendarAlt, FaInfoCircle, FaPencilAlt, FaCheckCircle, FaBan, FaRegClock, FaReceipt } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';

const AppointmentDetailsModal = ({ isOpen, onClose, appointment, onStatusChangeRequest, shopOwnerId }) => {
    if (!isOpen || !appointment) return null;

    // Helper to render status badge (can be shared with main page)
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
            <span className={`px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${colorClass}`}>
                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </span>
        );
    };

    // Determine available status transitions for shop owner (mirroring backend logic)
    const getAvailableTransitions = (currentStatus) => {
        const transitions = {
            pending: [{ value: 'confirmed', label: 'Confirm', icon: FaCheckCircle }, { value: 'cancelled', label: 'Cancel', icon: FaBan }, { value: 'rejected', label: 'Reject', icon: FaBan }],
            confirmed: [{ value: 'completed', label: 'Complete', icon: FaReceipt }, { value: 'cancelled', label: 'Cancel', icon: FaBan }, { value: 'no-show', label: 'No Show', icon: FaRegClock }],
            // Once completed, cancelled, no-show, or rejected, no further status changes are typically allowed from the UI.
            completed: [],
            cancelled: [],
            'no-show': [],
            rejected: []
        };
        // Filter out options that are the current status
        return transitions[currentStatus] || [];
    };

    const transitions = getAvailableTransitions(appointment.status);

    const handleUpdateClick = (newStatus) => {
        // Pass the appointment and new status to the parent's handler
        onStatusChangeRequest(appointment, newStatus);
        // After requesting the change, we can optimistically close this modal.
        // The main page's `handleConfirmStatusUpdate` will re-fetch data.
        onClose(); // Close the details modal immediately after initiating status change
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all scale-100 opacity-100 animate-fade-in-up">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <h2 className="text-2xl font-bold text-[#a38772]">Appointment Details</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <FaTimes size={24} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 mb-6">
                        <div>
                            <p className="text-gray-600 flex items-center mb-1">
                                <FaUser className="mr-2 text-[#a38772]" /> {/* Corrected color */}
                                <span className="font-semibold">Customer:</span> {appointment.user?.name || 'N/A'}
                            </p>
                            <p className="text-gray-600 flex items-center mb-1">
                                <FaCalendarAlt className="mr-2 text-[#a38772]" /> {/* Corrected color */}
                                <span className="font-semibold">Date:</span> {format(parseISO(appointment.date), 'PPPP')}
                            </p>
                            <p className="text-gray-600 flex items-center mb-1">
                                <FaRegClock className="mr-2 text-[#a38772]" /> {/* Corrected color */}
                                <span className="font-semibold">Time:</span> {appointment.startTime} - {appointment.endTime}
                            </p>
                            <p className="text-gray-600 flex items-center mb-1">
                                <FaTag className="mr-2 text-[#a38772]" /> {/* Corrected color */}
                                <span className="font-semibold">Service:</span> {appointment.service?.name || 'N/A'} ({appointment.service?.duration || 'N/A'} mins)
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-600 flex items-center mb-1">
                                <FaPencilAlt className="mr-2 text-[#a38772]" /> {/* Corrected color */}
                                <span className="font-semibold">Staff:</span> {appointment.staff?.name || 'Any Available'}
                            </p>
                            <p className="text-gray-600 flex items-center mb-1">
                                <FaMoneyBill className="mr-2 text-[#a38772]" /> {/* Corrected color */}
                                <span className="font-semibold">Amount:</span> ₹{appointment.payment?.amount || '0.00'}
                                {appointment.promotion && (
                                    <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                                        Coupon: {appointment.promotion.code} (-₹{appointment.promotion.discount})
                                    </span>
                                )}
                            </p>
                            <p className="text-gray-600 flex items-center mb-1">
                                <FaInfoCircle className="mr-2 text-[#a38772]" /> {/* Corrected color */}
                                <span className="font-semibold">Payment Status:</span> {appointment.payment?.status.charAt(0).toUpperCase() + appointment.payment?.status.slice(1) || 'N/A'} ({appointment.payment?.method || 'N/A'})
                            </p>
                            <p className="text-gray-600 flex items-center mb-1">
                                <span className="font-semibold mr-2">Current Status:</span> {renderStatusBadge(appointment.status)}
                            </p>
                        </div>
                    </div>

                    {appointment.notes && (
                        <div className="mb-6">
                            <p className="text-gray-600 flex items-start">
                                <span className="font-semibold mr-2">Notes:</span> {appointment.notes}
                            </p>
                        </div>
                    )}

                    {/* Shop Owner Actions */}
                    {shopOwnerId && appointment.shop?.owner === shopOwnerId && transitions.length > 0 && (
                        <div className="border-t pt-4 mt-4">
                            <h3 className="text-lg font-semibold text-[#a38772] mb-3">Update Status:</h3>
                            <div className="flex flex-wrap gap-3">
                                {transitions.map(transition => (
                                    <button
                                        key={transition.value}
                                        onClick={() => handleUpdateClick(transition.value)} // Call the new handler
                                        className={`flex items-center px-4 py-2 rounded-lg font-medium text-white transition-colors
                                            ${transition.value === 'confirmed' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                                            ${transition.value === 'completed' ? 'bg-green-500 hover:bg-green-600' : ''}
                                            ${transition.value === 'cancelled' || transition.value === 'rejected' ? 'bg-red-500 hover:bg-red-600' : ''}
                                            ${transition.value === 'no-show' ? 'bg-gray-500 hover:bg-gray-600' : ''}
                                        `}
                                    >
                                        <transition.icon className="mr-2" />
                                        {transition.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppointmentDetailsModal;