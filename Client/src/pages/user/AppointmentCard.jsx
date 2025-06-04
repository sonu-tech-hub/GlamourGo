// client/src/components/user/AppointmentCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTag, FaEllipsisV, FaTimes, FaBan } from 'react-icons/fa';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import api from '../../services/api';
import { getStatusColor } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const AppointmentCard = ({ appointment, showActions = true, onStatusChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  const handleCancelAppointment = async () => {
    setIsLoading(true);
    try {
      await api.delete(`/appointments/${appointment._id}`);
      toast.success('Appointment cancelled successfully');
      
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setIsLoading(false);
      setShowCancelModal(false);
    }
  };
  
  // Format appointment date
  const formattedDate = format(new Date(appointment.date), 'MMM d, yyyy');
  
  // Check if appointment is upcoming or past
  const isUpcoming = new Date(appointment.date) >= new Date();
  
  // Check if appointment can be cancelled
  const canCancel = isUpcoming && ['pending', 'confirmed'].includes(appointment.status);
  
  // Check if appointment can be reviewed
  const canReview = appointment.status === 'completed' && !appointment.isReviewed;
  
  return (
    <>
      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
        <div className="flex flex-col md:flex-row">
          {/* Shop/Service Info */}
          <div className="md:w-1/2 mb-4 md:mb-0 md:pr-4">
            <div className="flex items-center mb-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </span>
              
              {appointment.payment.method === 'online' && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#fef4ea] text-[#doa189]">
                  Paid Online
                </span>
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-[#a38772]">
              {appointment.service.name}
            </h3>
            
            <p className="text-gray-600 text-sm mb-3">
              at <Link to={`/shop/${appointment.shop._id}`} className="hover:underline text-[#doa189]">
                {appointment.shop.name}
              </Link>
            </p>
            
            <div className="space-y-1">
              <div className="flex items-start">
                <FaCalendarAlt className="text-[#doa189] mt-1 mr-2 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-gray-600">Date</p>
                  <p className="font-medium">{formattedDate}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FaClock className="text-[#doa189] mt-1 mr-2 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-gray-600">Time</p>
                  <p className="font-medium">{appointment.startTime} - {appointment.endTime}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Location & Price Info */}
          <div className="md:w-1/2 border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-4">
            <div className="space-y-2">
              <div className="flex items-start">
                <FaMapMarkerAlt className="text-[#doa189] mt-1 mr-2 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-gray-600">Location</p>
                  <p className="font-medium">
                    {appointment.shop.address.street}, {appointment.shop.address.city}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FaTag className="text-[#doa189] mt-1 mr-2 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-gray-600">Price</p>
                  <p className="font-medium">
                    ₹{appointment.service.price}
                    {appointment.promotion && (
                      <span className="ml-2 text-green-600 text-xs">
                        (Saved ₹{appointment.promotion.discount})
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-4 flex justify-end space-x-2">
              <Link
                to={`/appointments/${appointment._id}`}
                className="px-3 py-1 bg-[#fef4ea] text-[#doa189] rounded-lg hover:bg-[#ecdfcf] transition-colors text-sm font-medium"
              >
                View Details
              </Link>
              
              {showActions && (
                <>
                  {canCancel && (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium flex items-center"
                    >
                      <FaTimes className="mr-1" />
                      Cancel
                    </button>
                  )}
                  
                  {canReview && (
                    <Link
                      to={`/shop/${appointment.shop._id}/write-review?appointmentId=${appointment._id}`}
                      className="px-3 py-1 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                    >
                      Write Review
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelAppointment}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmButtonText="Yes, Cancel Appointment"
        confirmButtonColor="red"
        isLoading={isLoading}
      />
    </>
  );
};

export default AppointmentCard;
