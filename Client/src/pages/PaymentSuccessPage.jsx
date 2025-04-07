// pages/PaymentSuccessPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaCheckCircle, FaCalendarAlt, FaDownload } from 'react-icons/fa';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import { getAppointmentDetails } from '../services/appointmentService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PaymentSuccessPage = () => {
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchAppointment = async () => {
      setIsLoading(true);
      try {
        const response = await getAppointmentDetails(appointmentId);
        setAppointment(response.data);
      } catch (error) {
        console.error('Error fetching appointment:', error);
        toast.error('Failed to load appointment details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAppointment();
  }, [appointmentId]);
  
  const handleDownloadReceipt = () => {
    // In a real implementation, you would generate a PDF receipt
    // For now, we'll just show a toast
    toast.success('Receipt downloaded successfully');
  };
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!appointment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-[#a38772] mb-4">Appointment not found</h2>
        <p className="text-gray-600 mb-6">The appointment details could not be found.</p>
        <Link
          to="/user/appointments"
          className="bg-[#doa189] hover:bg-[#ecdfcf] text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Go to My Appointments
        </Link>
      </div>
    );
  }
  
  return (
    <div className="bg-[#fef4ea] min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-500 p-6 text-white text-center">
            <FaCheckCircle className="text-5xl mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Payment Successful!</h1>
            <p>Your appointment has been confirmed</p>
          </div>
          
          <div className="p-6">
            <div className="mb-6 border-b border-gray-200 pb-6">
              <h2 className="font-semibold text-[#a38772] mb-4 text-lg">
                Appointment Details
              </h2>
              
              <div className="space-y-3 text-gray-700">
                <p className="flex justify-between">
                  <span>Booking ID:</span>
                  <span className="font-medium">{appointment._id.substring(0, 8).toUpperCase()}</span>
                </p>
                
                <p className="flex justify-between">
                  <span>Service:</span>
                  <span className="font-medium">{appointment.service.name}</span>
                </p>
                
                <p className="flex justify-between">
                  <span>Shop:</span>
                  <span className="font-medium">{appointment.shop.name}</span>
                </p>
                
                <p className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-medium">
                    {format(new Date(appointment.date), 'MMMM d, yyyy')}
                  </span>
                </p>
                
                <p className="flex justify-between">
                  <span>Time:</span>
                  <span className="font-medium">
                    {appointment.startTime} - {appointment.endTime}
                  </span>
                </p>
                
                <p className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">{appointment.service.duration} mins</span>
                </p>
              </div>
            </div>
            
            <div className="mb-6 border-b border-gray-200 pb-6">
              <h2 className="font-semibold text-[#a38772] mb-4 text-lg">
                Payment Information
              </h2>
              
              <div className="space-y-3 text-gray-700">
                <p className="flex justify-between">
                  <span>Payment Status:</span>
                  <span className="font-medium text-green-500">Paid</span>
                </p>
                
                <p className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-medium">
                    {appointment.payment.method === 'online' ? 'Online Payment' : 'Wallet'}
                  </span>
                </p>
                
                <p className="flex justify-between">
                  <span>Transaction ID:</span>
                  <span className="font-medium">{appointment.payment.transactionId}</span>
                </p>
                
                <p className="flex justify-between">
                  <span>Amount Paid:</span>
                  <span className="font-medium text-[#doa189]">₹{appointment.service.price}</span>
                </p>
              </div>
            </div>
            
            <div className="mb-6 bg-[#fef4ea] p-4 rounded-lg">
              <h2 className="font-semibold text-[#a38772] mb-2">
                Shop Location
              </h2>
              
              <p className="text-gray-700">
                {appointment.shop.address.street}, {appointment.shop.address.city}, {appointment.shop.address.state} {appointment.shop.address.zipCode}
              </p>
              
              <div className="mt-3">
                <a
                  href={`https://maps.google.com/?q=${appointment.shop.address.coordinates.lat},${appointment.shop.address.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#doa189] hover:underline font-medium"
                >
                  Get Directions
                </a>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleDownloadReceipt}
                className="flex items-center justify-center py-3 px-4 border border-[#doa189] text-[#doa189] rounded-lg hover:bg-[#fef4ea] transition-colors"
              >
                <FaDownload className="mr-2" />
                Download Receipt
              </button>
              
              <Link
                to="/user/appointments"
                className="flex items-center justify-center py-3 px-4 bg-[#doa189] text-white rounded-lg hover:bg-[#ecdfcf] transition-colors"
              >
                <FaCalendarAlt className="mr-2" />
                View Appointments
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
