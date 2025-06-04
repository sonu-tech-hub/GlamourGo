// client/src/pages/PaymentFailedPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaTimesCircle, FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';

import { getAppointmentDetails } from '../services/appointmentService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PaymentFailedPage = () => {
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
          <div className="bg-red-500 p-6 text-white text-center">
            <FaTimesCircle className="text-5xl mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Payment Failed</h1>
            <p>Your payment could not be processed</p>
          </div>
          
          <div className="p-6">
            <div className="mb-6 bg-red-50 p-4 rounded-lg border border-red-100">
              <h2 className="font-semibold text-red-800 mb-2">
                What Happened?
              </h2>
              <p className="text-gray-700">
                Your payment could not be processed due to an error. This could be due to:
              </p>
              <ul className="list-disc pl-5 mt-2 text-gray-700 space-y-1">
                <li>Insufficient funds in your account</li>
                <li>Payment declined by your bank</li>
                <li>Temporary network issue</li>
                <li>Other payment processing error</li>
              </ul>
            </div>
            
            <div className="mb-6 border-b border-gray-200 pb-6">
              <h2 className="font-semibold text-[#a38772] mb-4 text-lg">
                Appointment Details
              </h2>
              
              <div className="space-y-3 text-gray-700">
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
                    {new Date(appointment.date).toLocaleDateString()}
                  </span>
                </p>
                
                <p className="flex justify-between">
                  <span>Time:</span>
                  <span className="font-medium">
                    {appointment.startTime} - {appointment.endTime}
                  </span>
                </p>
                
                <p className="flex justify-between text-[#doa189]">
                  <span>Amount:</span>
                  <span className="font-bold">₹{appointment.service.price}</span>
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to={`/payment/${appointment._id}`}
                className="flex items-center justify-center py-3 px-4 bg-[#doa189] text-white rounded-lg hover:bg-[#ecdfcf] transition-colors"
              >
                Try Payment Again
              </Link>
              
              <Link
                to="/user/appointments"
                className="flex items-center justify-center py-3 px-4 border border-[#doa189] text-[#doa189] rounded-lg hover:bg-[#fef4ea] transition-colors"
              >
                <FaCalendarAlt className="mr-2" />
                View Appointments
              </Link>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                Need help? <Link to="/contact" className="text-[#doa189] hover:underline">Contact our support team</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;