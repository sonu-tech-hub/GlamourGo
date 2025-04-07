// pages/PaymentFailedPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';

const PaymentFailedPage = () => {
  return (
    <div className="bg-[#fef4ea] min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-red-500 p-6 text-white text-center">
            <FaTimesCircle className="text-5xl mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Payment Failed!</h1>
            <p>There was an error processing your payment.</p>
          </div>

          <div className="p-6 text-center">
            <p className="text-gray-700 mb-4">
              We were unable to complete your payment at this time. Please review your payment details and try again.
            </p>
            <p className="text-gray-700 mb-6">
              If the problem persists, please contact our support team.
            </p>

            <div className="space-y-3">
              <Link
                to="/checkout" // Or the previous page where payment was attempted
                className="bg-[#doa189] hover:bg-[#ecdfcf] text-white font-bold py-3 px-6 rounded-lg transition-colors inline-block"
              >
                Try Again
              </Link>
              <Link
                to="/user/appointments"
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-6 rounded-lg transition-colors inline-block"
              >
                Go to My Appointments
              </Link>
              <Link
                to="/"
                className="text-[#a38772] hover:underline font-medium inline-block mt-2"
              >
                Back to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;