// client/src/pages/user/AppointmentDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaMapMarkerAlt, 
  FaTag, 
  FaPhone, 
  FaEnvelope,
  FaUserAlt,
  FaCreditCard,
  FaPrint,
  FaPencilAlt,
  FaTimes,
  FaCheckCircle,
  FaTimesCircle,
  FaBan
} from 'react-icons/fa';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { getStatusColor } from '../../utils/helpers';

const AppointmentDetail = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  
  const [appointment, setAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  useEffect(() => {
    fetchAppointmentDetails();
  }, [appointmentId]);
  
  const fetchAppointmentDetails = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/appointments/${appointmentId}`);
      setAppointment(response.data);
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      toast.error('Failed to load appointment details');
    } finally {
      setIsLoading(false);
    }
  };
  
  const cancelAppointment = async () => {
    setIsCancelling(true);
    try {
      await api.delete(`/appointments/${appointmentId}`);
      toast.success('Appointment cancelled successfully');
      fetchAppointmentDetails();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setIsCancelling(false);
      setShowCancelModal(false);
    }
  };
  
  const printReceipt = () => {
    window.print();
  };
  
  // Check if appointment can be cancelled
  const canCancel = appointment && 
    ['pending', 'confirmed'].includes(appointment.status) && 
    new Date(appointment.date) > new Date();
  
  // Check if appointment can be reviewed
  const canReview = appointment && 
    appointment.status === 'completed' && 
    !appointment.isReviewed;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#fef4ea]">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!appointment) {
    return (
      <div className="min-h-screen bg-[#fef4ea] py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <FaTimesCircle className="text-red-500 text-5xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Appointment Not Found</h2>
            <p className="text-gray-600 mb-6">The appointment you're looking for doesn't exist or you don't have permission to view it.</p>
            <Link
              to="/user/appointments"
              className="inline-block bg-[#doa189] hover:bg-[#ecdfcf] text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Go to My Appointments
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#fef4ea] py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Appointment Status Header */}
          <div className={`p-6 text-white ${
            appointment.status === 'confirmed' ? 'bg-green-600' :
            appointment.status === 'completed' ? 'bg-blue-600' :
            appointment.status === 'cancelled' ? 'bg-red-600' :
            appointment.status === 'no-show' ? 'bg-gray-600' :
            'bg-yellow-600'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  Appointment {appointment.status === 'pending' ? 'Pending' :
                              appointment.status === 'confirmed' ? 'Confirmed' :
                              appointment.status === 'completed' ? 'Completed' :
                              appointment.status === 'cancelled' ? 'Cancelled' :
                              'Marked as No-Show'}
                </h1>
                <p>
                  Booking ID: {appointment._id.substring(0, 8).toUpperCase()}
                </p>
              </div>
              
              <div className="mt-4 md:mt-0">
                {appointment.status === 'confirmed' && (
                  <div className="flex items-center">
                    <FaCheckCircle className="mr-2" />
                    <span>Your appointment is confirmed!</span>
                  </div>
                )}
                
                {appointment.status === 'pending' && (
                  <div className="flex items-center">
                    <FaClock className="mr-2" />
                    <span>Waiting for confirmation</span>
                  </div>
                )}
                
                {appointment.status === 'completed' && (
                  <div className="flex items-center">
                    <FaCheckCircle className="mr-2" />
                    <span>Service completed - Thank you!</span>
                  </div>
                )}
                
                {appointment.status === 'cancelled' && (
                  <div className="flex items-center">
                    <FaTimes className="mr-2" />
                    <span>This appointment has been cancelled</span>
                  </div>
                )}
                
                {appointment.status === 'no-show' && (
                  <div className="flex items-center">
                    <FaBan className="mr-2" />
                    <span>You didn't show up for this appointment</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Main Appointment Details */}
              <div className="md:col-span-2 space-y-6">
                {/* Service Details */}
                <div className="bg-[#fef4ea] rounded-lg p-4">
                  <h2 className="text-lg font-semibold text-[#a38772] mb-3">
                    Service Details
                  </h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <FaTag className="text-[#doa189] mt-1 mr-3" />
                      <div>
                        <p className="text-gray-600 text-sm">Service</p>
                        <p className="font-medium">{appointment.service.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <FaCalendarAlt className="text-[#doa189] mt-1 mr-3" />
                      <div>
                        <p className="text-gray-600 text-sm">Date</p>
                        <p className="font-medium">
                          {format(new Date(appointment.date), 'EEEE, MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <FaClock className="text-[#doa189] mt-1 mr-3" />
                      <div>
                        <p className="text-gray-600 text-sm">Time</p>
                        <p className="font-medium">
                          {appointment.startTime} - {appointment.endTime}
                        </p>
                      </div>
                    </div>
                    
                    {appointment.notes && (
                      <div className="flex items-start">
                        <div className="text-[#doa189] mt-1 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Notes</p>
                          <p className="font-medium">{appointment.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Shop Details */}
                <div className="rounded-lg border border-gray-200 p-4">
                  <h2 className="text-lg font-semibold text-[#a38772] mb-3">
                    Shop Details
                  </h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="text-[#doa189] mt-1 mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Shop Name</p>
                        <Link to={`/shop/${appointment.shop._id}`} className="font-medium text-[#doa189] hover:underline">
                          {appointment.shop.name}
                        </Link>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <FaMapMarkerAlt className="text-[#doa189] mt-1 mr-3" />
                      <div>
                        <p className="text-gray-600 text-sm">Address</p>
                        <p className="font-medium">
                          {appointment.shop.address.street}, {appointment.shop.address.city}
                        </p>
                        <a 
                          href={`https://maps.google.com/?q=${appointment.shop.address.street}, ${appointment.shop.address.city}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-[#doa189] hover:underline"
                        >
                          Get Directions
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <FaPhone className="text-[#doa189] mt-1 mr-3" />
                      <div>
                        <p className="text-gray-600 text-sm">Phone</p>
                        <a 
                          href={`tel:${appointment.shop.contactInfo.phone}`} 
                          className="font-medium hover:text-[#doa189]"
                        >
                          {appointment.shop.contactInfo.phone}
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <FaEnvelope className="text-[#doa189] mt-1 mr-3" />
                      <div>
                        <p className="text-gray-600 text-sm">Email</p>
                        <a 
                          href={`mailto:${appointment.shop.contactInfo.email}`} 
                          className="font-medium hover:text-[#doa189]"
                        >
                          {appointment.shop.contactInfo.email}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Payment Details & Actions */}
              <div className="space-y-6">
                {/* Payment Details */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h2 className="text-lg font-semibold text-[#a38772] mb-3">
                    Payment Details
                  </h2>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Price</span>
                      <span className="font-medium">₹{appointment.service.price}</span>
                    </div>
                    
                    {appointment.promotion && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-₹{appointment.promotion.discount}</span>
                      </div>
                    )}
                    
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between font-bold">
                        <span>Total Paid</span>
                        <span>
                          ₹{appointment.promotion 
                            ? (appointment.service.price - appointment.promotion.discount)
                            : appointment.service.price
                          }
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-600">Payment Method</span>
                      <span className={`${
                        appointment.payment.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {appointment.payment.method === 'online' 
                          ? 'Paid Online' 
                          : appointment.payment.method === 'wallet'
                          ? 'Paid from Wallet'
                          : 'Pay at Shop'
                        }
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Payment Status</span>
                      <span className={`${
                        appointment.payment.status === 'completed' ? 'text-green-600' : 
                        appointment.payment.status === 'pending' ? 'text-yellow-600' :
                        appointment.payment.status === 'refunded' ? 'text-blue-600' :
                        'text-red-600'
                      }`}>
                        {appointment.payment.status.charAt(0).toUpperCase() + appointment.payment.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* User Info */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h2 className="text-lg font-semibold text-[#a38772] mb-3">
                    Customer Details
                  </h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <FaUserAlt className="text-[#doa189] mt-1 mr-3" />
                      <div>
                        <p className="text-gray-600 text-sm">Name</p>
                        <p className="font-medium">
                          {appointment.user.name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <FaPhone className="text-[#doa189] mt-1 mr-3" />
                      <div>
                        <p className="text-gray-600 text-sm">Phone</p>
                        <p className="font-medium">
                          {appointment.user.phone}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <FaEnvelope className="text-[#doa189] mt-1 mr-3" />
                      <div>
                        <p className="text-gray-600 text-sm">Email</p>
                        <p className="font-medium">
                          {appointment.user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h2 className="text-lg font-semibold text-[#a38772] mb-3">
                    Actions
                  </h2>
                  
                  <div className="space-y-3">
                    <button
                      onClick={printReceipt}
                      className="w-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      <FaPrint className="mr-2" />
                      Print Receipt
                    </button>
                    
                    {canReview && (
                      <Link
                        to={`/shop/${appointment.shop._id}/write-review?appointmentId=${appointment._id}`}
                        className="w-full flex items-center justify-center bg-[#fef4ea] hover:bg-[#ecdfcf] text-[#doa189] font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        <FaPencilAlt className="mr-2" />
                        Write a Review
                      </Link>
                    )}
                    
                    {canCancel && (
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="w-full flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        <FaTimes className="mr-2" />
                        Cancel Appointment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Cancel Appointment Modal */}
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={cancelAppointment}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmButtonText="Yes, Cancel Appointment"
        confirmButtonColor="red"
        isLoading={isCancelling}
      />
    </div>
  );
};

export default AppointmentDetail;