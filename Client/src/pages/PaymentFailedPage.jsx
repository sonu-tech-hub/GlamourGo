// client/src/pages/PaymentFailedPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaTimesCircle, FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { format } from 'date-fns'; // Import format from date-fns

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
        // Ensure data exists before setting state
        if (response && response.data) {
          setAppointment(response.data);
        } else {
          toast.error('Appointment details could not be found.');
          // Optionally redirect if appointment is critical and not found
          // navigate('/user/appointments');
        }
      } catch (error) {
        console.error('Error fetching appointment details for failed page:', error);
        toast.error(error.response?.data?.message || 'Failed to load appointment details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Handle case where appointment details are not found after loading
  if (!appointment) {
    return (
      <div className="text-center py-12 px-4 min-h-screen flex flex-col justify-center items-center bg-[#fef4ea]">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-[#a38772] mb-4">Appointment Not Found</h2>
          <p className="text-gray-600 mb-6">The appointment details could not be loaded. It might not exist or the link is invalid.</p>
          <Link
            to="/user/appointments"
            className="bg-[#d0a189] hover:bg-[#b88c6e] text-white font-bold py-2 px-6 rounded-lg transition-colors inline-flex items-center justify-center" // Corrected color and added flex styles
          >
            <FaArrowLeft className="mr-2" /> Go to My Appointments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fef4ea] min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header Section - Payment Failed */}
          <div className="bg-red-600 p-6 text-white text-center"> {/* Slightly darker red for impact */}
            <FaTimesCircle className="text-5xl mx-auto mb-4 animate-bounce-in" /> {/* Added simple animation */}
            <h1 className="text-2xl font-bold">Payment Failed</h1>
            <p className="text-red-100">We could not process your payment at this time.</p>
          </div>

          <div className="p-6">
            {/* What Happened Section */}
            <div className="mb-6 bg-red-50 p-4 rounded-lg border border-red-200"> {/* Stronger border */}
              <h2 className="font-semibold text-red-800 mb-3 text-lg"> {/* Adjusted margin and text size */}
                What Happened?
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3"> {/* Added leading-relaxed */}
                Your payment could not be processed due to an error. This might be caused by:
              </p>
              <ul className="list-disc pl-5 mt-2 text-gray-700 space-y-1">
                <li>Insufficient funds in your account.</li>
                <li>Your bank declined the transaction.</li>
                <li>A temporary network or server issue.</li>
                <li>Incorrect payment details provided.</li>
              </ul>
            </div>

            {/* Appointment Details Section */}
            <div className="mb-6 border-b border-gray-200 pb-6">
              <h2 className="font-semibold text-[#a38772] mb-4 text-lg">
                Appointment Details
              </h2>

              <div className="space-y-3 text-gray-700">
                <p className="flex justify-between">
                  <span>Service:</span>
                  <span className="font-medium">{appointment.service?.name}</span> {/* Added optional chaining */}
                </p>

                <p className="flex justify-between">
                  <span>Shop:</span>
                  <span className="font-medium">{appointment.shop?.name}</span> {/* Added optional chaining */}
                </p>

                <p className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-medium">
                    {format(new Date(appointment.date), 'MMMM d, yyyy')} {/* Used date-fns for consistent formatting */}
                  </span>
                </p>

                <p className="flex justify-between">
                  <span>Time:</span>
                  <span className="font-medium">
                    {appointment.startTime} - {appointment.endTime}
                  </span>
                </p>

                <p className="flex justify-between font-bold text-[#d0a189] text-xl pt-2 border-t border-gray-100 mt-3"> {/* Corrected color, increased size, added top border */}
                  <span>Amount:</span>
                  <span>₹{appointment.service?.price}</span> {/* Added optional chaining */}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to={`/payment/${appointment._id}`}
                className="flex items-center justify-center py-3 px-4 bg-[#d0a189] text-white rounded-lg hover:bg-[#b88c6e] transition-colors font-semibold" // Corrected colors and added font-semibold
              >
                <FaArrowLeft className="mr-2" /> Try Payment Again
              </Link>

              <Link
                to="/user/appointments"
                className="flex items-center justify-center py-3 px-4 border border-[#d0a189] text-[#d0a189] rounded-lg hover:bg-[#fef4ea] transition-colors font-semibold" // Corrected colors and added font-semibold
              >
                <FaCalendarAlt className="mr-2" />
                View My Appointments
              </Link>
            </div>

            {/* Support Message */}
            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                Need further assistance? <Link to="/contact" className="text-[#d0a189] hover:underline font-medium">Contact our support team</Link> {/* Corrected color, added font-medium */}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Basic keyframe for bounce-in animation (add to your CSS file, e.g., index.css or global.css)
      @keyframes bounceIn {
        0% { transform: scale(0.3); opacity: 0; }
        50% { transform: scale(1.1); opacity: 1; }
        70% { transform: scale(0.9); }
        100% { transform: scale(1); }
      }
      .animate-bounce-in {
        animation: bounceIn 0.8s ease-out;
      }
      */}
    </div>
  );
};

export default PaymentFailedPage;