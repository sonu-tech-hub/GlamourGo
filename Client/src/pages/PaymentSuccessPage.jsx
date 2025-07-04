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
        // Ensure data exists before setting state
        if (response && response.data) {
          setAppointment(response.data);
        } else {
          toast.error('Appointment details could not be found.');
          // Optionally, you might want to redirect here if data is critical
          // navigate('/user/appointments');
        }
      } catch (error) {
        console.error('Error fetching appointment details for success page:', error);
        toast.error(error.response?.data?.message || 'Failed to load appointment details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  const handleDownloadReceipt = () => {
    // In a real implementation, you would make an API call to generate and download a PDF receipt.
    // Example: window.open(`/api/receipt/${appointmentId}`);
    // Or trigger a backend endpoint that returns a file stream.

    toast.success('Your receipt is being prepared for download!');
    // For a more realistic "download," you might trigger a small delay
    // or a more robust download mechanism here.
  };

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
            className="bg-[#d0a189] hover:bg-[#b88c6e] text-white font-bold py-2 px-6 rounded-lg transition-colors inline-flex items-center justify-center"
          >
            <FaCalendarAlt className="mr-2" /> Go to My Appointments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fef4ea] min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header Section - Payment Success */}
          <div className="bg-green-600 p-6 text-white text-center"> {/* Slightly darker green for impact */}
            <FaCheckCircle className="text-5xl mx-auto mb-4 animate-scale-in" /> {/* Added simple animation */}
            <h1 className="text-2xl font-bold">Payment Successful!</h1>
            <p className="text-green-100">Your appointment has been successfully confirmed.</p>
          </div>

          <div className="p-6">
            {/* Appointment Details Section */}
            <div className="mb-6 border-b border-gray-200 pb-6">
              <h2 className="font-semibold text-[#a38772] mb-4 text-lg">
                Your Confirmed Appointment
              </h2>

              <div className="space-y-3 text-gray-700">
                <p className="flex justify-between">
                  <span>Booking ID:</span>
                  <span className="font-medium">{appointment._id?.substring(0, 8).toUpperCase()}</span> {/* Added optional chaining */}
                </p>

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
                    {format(new Date(appointment.date), 'MMMM d, YYYY')} {/* Corrected 'RRRR' to 'YYYY' */}
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
                  <span className="font-medium">{appointment.service?.duration} mins</span> {/* Added optional chaining */}
                </p>
              </div>
            </div>

            {/* Payment Information Section */}
            <div className="mb-6 border-b border-gray-200 pb-6">
              <h2 className="font-semibold text-[#a38772] mb-4 text-lg">
                Payment Information
              </h2>

              <div className="space-y-3 text-gray-700">
                <p className="flex justify-between">
                  <span>Payment Status:</span>
                  <span className="font-medium text-green-600">Paid Successfully</span> {/* Slightly darker green */}
                </p>

                <p className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-medium">
                    {appointment.payment?.method === 'online' ? 'Online Payment' : 'Wallet'} {/* Added optional chaining */}
                  </span>
                </p>

                <p className="flex justify-between">
                  <span>Transaction ID:</span>
                  <span className="font-medium">{appointment.payment?.transactionId || 'N/A'}</span> {/* Added optional chaining and N/A fallback */}
                </p>

                <p className="flex justify-between font-bold text-[#d0a189] text-xl pt-2 border-t border-gray-100 mt-3"> {/* Corrected color, increased size, added top border */}
                  <span>Amount Paid:</span>
                  <span>₹{appointment.service?.price}</span> {/* Added optional chaining */}
                </p>
              </div>
            </div>

            {/* Shop Location Section */}
            <div className="mb-6 bg-[#fef4ea] p-4 rounded-lg">
              <h2 className="font-semibold text-[#a38772] mb-3 text-lg"> {/* Adjusted margin */}
                Shop Location
              </h2>

              <p className="text-gray-700 mb-2">
                {appointment.shop?.address?.street}, {appointment.shop?.address?.city}, {appointment.shop?.address?.state} {appointment.shop?.address?.zipCode} {/* Added optional chaining */}
              </p>

              <div className="mt-3">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${appointment.shop?.address?.coordinates?.lat},${appointment.shop?.address?.coordinates?.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#d0a189] hover:underline font-medium inline-flex items-center" // Corrected color, added flex styles
                >
                  Get Directions <span className="ml-1 text-sm">↗</span>
                </a>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleDownloadReceipt}
                className="flex items-center justify-center py-3 px-4 border border-[#d0a189] text-[#d0a189] rounded-lg hover:bg-[#fef4ea] transition-colors font-semibold" // Corrected colors and added font-semibold
              >
                <FaDownload className="mr-2" />
                Download Receipt
              </button>

              <Link
                to="/user/appointments"
                className="flex items-center justify-center py-3 px-4 bg-[#d0a189] text-white rounded-lg hover:bg-[#b88c6e] transition-colors font-semibold" // Corrected colors and added font-semibold
              >
                <FaCalendarAlt className="mr-2" />
                View My Appointments
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Basic keyframe for scale-in animation (add to your CSS file, e.g., index.css or global.css)
      @keyframes scaleIn {
        0% { transform: scale(0.8); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
      .animate-scale-in {
        animation: scaleIn 0.5s ease-out;
      }
      */}
    </div>
  );
};

export default PaymentSuccessPage;