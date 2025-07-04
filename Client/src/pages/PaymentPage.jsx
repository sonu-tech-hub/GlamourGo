// pages/PaymentPage.jsx
import React, { useState, useEffect }  from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaWallet, FaCreditCard, FaLock } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

// Import your service functions. Ensure these functions are correctly defined
// to fetch data from your backend API.
import { getAppointmentDetails } from '../services/appointmentService';
import { createPaymentOrder, verifyPayment, payUsingWallet } from '../services/paymentService';
import { getUserProfile } from '../services/userService';

import LoadingSpinner from '../components/common/LoadingSpinner';

const PaymentPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [user, setUser] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // Default to Razorpay
  const [isLoading, setIsLoading] = useState(true); // For initial data fetch
  const [isProcessing, setIsProcessing] = useState(false); // For payment initiation/wallet payment

  // --- Fetch Appointment and User Data ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get appointment details
        const appointmentResponse = await getAppointmentDetails(appointmentId);
        // console.log('Appointment response from service:', appointmentResponse); // Keep for debugging

        // IMPORTANT: Assuming getAppointmentDetails returns the raw appointment object directly.
        // If your service returns { data: appointmentObject }, change this back to appointmentResponse.data
        if (appointmentResponse) { // Check if response itself is not null/undefined
          setAppointment(appointmentResponse);
        } else {
          toast.error('Appointment details not found.');
          navigate('/user/appointments'); // Redirect if appointment is critical and not found
          return; // Stop execution if appointment data is missing
        }

        // Get user profile for wallet balance
        const userResponse = await getUserProfile();
        // console.log('User response from service:', userResponse); // Keep for debugging

        // IMPORTANT: Assuming getUserProfile returns the raw user object directly.
        // If your service returns { data: userObject }, change this back to userResponse.data
        if (userResponse) { // Check if response itself is not null/undefined
          setUser(userResponse);
        } else {
          toast.error('User profile not found. Wallet balance may not be available.');
          // Do not redirect, as the page can still function for Razorpay
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error(error.response?.data?.message || 'Failed to load payment data. Please try again.');
        // If critical data like appointment isn't found, you might want to redirect
        if (error.response?.status === 404) { // Example: If the appointment ID is not found
            navigate('/user/appointments');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
  }, [appointmentId, navigate]); // Add navigate to dependency array as it's used inside useEffect

  // --- Initialize Razorpay SDK ---
  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
        toast.error('Razorpay SDK failed to load. Please check your internet connection.');
      };
      document.body.appendChild(script);
    });
  };

  // IMPORTANT: For demonstration/testing in this Canvas environment,
  // we are using a placeholder for the Razorpay Key ID.
  // In a real-world production application, you MUST NOT hardcode API keys.
  // Instead, load them securely from environment variables (e.g., REACT_APP_RAZORPAY_KEY_ID
  // processed by your build tool like Webpack/Vite) or a backend service.
  const RAZORPAY_KEY_ID = 'rzp_test_YOUR_ACTUAL_RAZORPAY_KEY_ID'; // Replace this with your actual key for testing

  // --- Handle Pay Now (Razorpay or Wallet) ---
  const handlePayNow = async () => {
    if (!appointment || !user) {
        toast.error("Required appointment or user data is missing. Please refresh.");
        return;
    }

    if (paymentMethod === 'wallet') {
      handleWalletPayment();
      return;
    }

    // Razorpay payment
    setIsProcessing(true);
    try {
      const res = await initializeRazorpay();

      if (!res) {
        // Error message already shown in initializeRazorpay
        setIsProcessing(false); // Ensure processing is reset if SDK fails to load
        return;
      }

      // Check if Razorpay Key ID is available (and not the placeholder)
      if (!RAZORPAY_KEY_ID || RAZORPAY_KEY_ID === 'rzp_test_YOUR_ACTUAL_RAZORPAY_KEY_ID') {
        toast.error('Razorpay Key ID is not configured. Please replace the placeholder in PaymentPage.jsx with your actual key.');
        setIsProcessing(false);
        return;
      }

      // Create payment order on backend
      const orderResponse = await createPaymentOrder(appointmentId);
      // Ensure orderResponse.data exists and has expected properties
      if (!orderResponse || !orderResponse.data || !orderResponse.data.id || !orderResponse.data.amount) {
          throw new Error("Invalid order response from server. Missing ID or amount.");
      }
      const { id: orderId, amount } = orderResponse.data;

      // Configure Razorpay options
      const options = {
        key: RAZORPAY_KEY_ID, // Use the safely accessed key
        amount: amount, // amount in paisa (e.g., 10000 for ₹100)
        currency: 'INR',
        name: 'Beauty & Wellness', // Your business name
        description: `Payment for ${appointment.service.name} at ${appointment.shop.name}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            // Verify payment on backend
            const paymentData = {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              appointmentId: appointmentId
            };

            await verifyPayment(paymentData);

            toast.success('Payment successful!');
            navigate(`/payment/success/${appointmentId}`);
          } catch (error) {
            console.error('Payment verification failed:', error);
            // More specific error message for verification failure
            toast.error(error.response?.data?.message || 'Payment verification failed. Please contact support.');
            navigate(`/payment/failed/${appointmentId}`);
          } finally {
            setIsProcessing(false); // Reset processing state after handler completes
          }
        },
        prefill: {
          name: user.name || '', // Provide fallback empty string if null
          email: user.email || '',
          contact: user.phone || ''
        },
        theme: {
          color: '#d0a189' // Corrected typo: #doa189 -> #d0a189
        },
        modal: {
            ondismiss: function() { // Handle when user closes Razorpay modal
                toast('Payment cancelled by user.', { icon: '👋' });
                setIsProcessing(false); // Reset processing state if modal dismissed
            }
        }
      };

      // Initialize and open Razorpay checkout
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

      // The 'payment.failed' event handler is for internal Razorpay errors,
      // not usually for user cancellations (which are caught by ondismiss).
      paymentObject.on('payment.failed', function (response) {
        toast.error('Payment failed due to an error. Please try again.');
        console.error('Razorpay payment failed event:', response.error);
        setIsProcessing(false); // Ensure processing is reset on failure
        navigate(`/payment/failed/${appointmentId}`); // Or handle failure accordingly
      });

    } catch (error) {
      console.error('Error initiating Razorpay payment:', error);
      toast.error(error.response?.data?.message || 'Payment initiation failed. Please try again.');
      setIsProcessing(false); // Ensure processing is reset on error before modal opens
    }
  };

  // --- Handle Wallet Payment ---
  const handleWalletPayment = async () => {
    // Prevent wallet payment if balance is insufficient
    if (!user || user.wallet?.balance === undefined || user.wallet.balance < appointment.service.price) {
      toast.error('Insufficient wallet balance to complete this payment.');
      return; // Exit function early
    }

    setIsProcessing(true);
    try {
      await payUsingWallet(appointmentId);
      toast.success('Payment successful using wallet!');
      navigate(`/payment/success/${appointmentId}`);
    } catch (error) {
      console.error('Wallet payment failed:', error);
      toast.error(error.response?.data?.message || 'Wallet payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Loading State ---
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // --- No Appointment Found State ---
  if (!appointment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-[#a38772] mb-4">Appointment not found</h2>
        <p className="text-gray-600 mb-6">The appointment you're trying to pay for could not be found or has expired.</p>
        <button
          onClick={() => navigate('/user/appointments')}
          className="bg-[#d0a189] hover:bg-[#b88c6e] text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Go to My Appointments
        </button>
      </div>
    );
  }

  // --- Render Payment Page ---
  const isWalletInsufficient = user?.wallet?.balance === undefined || user.wallet.balance < appointment.service.price;

  return (
    <div className="bg-[#fef4ea] min-h-screen py-8 font-inter"> {/* Added Inter font class */}
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="bg-[#d0a189] p-6 text-white">
              <h1 className="text-2xl font-bold">Complete Your Payment</h1>
              <p>Confirm your appointment by completing the payment.</p>
            </div>

            <div className="p-6">
              {/* Appointment Details Summary */}
              <div className="mb-6 bg-[#fef4ea] p-4 rounded-lg">
                <h2 className="font-semibold text-[#a38772] mb-3 text-lg">
                  Appointment Details
                </h2>

                <div className="space-y-2 text-gray-700">
                  <p className="flex justify-between">
                    <span>Service:</span>
                    <span className="font-medium">{appointment.service.name}</span>
                  </p>

                  <p className="flex justify-between">
                    <span>Shop:</span>
                    <span className="font-medium">{appointment.shop.name}</span>
                  </p>

                  <p className="flex justify-between">
                    <span>Date & Time:</span>
                    <span className="font-medium">
                      {/* Corrected date format to explicitly show year */}
                      {format(new Date(appointment.date), 'MMMM d,PPPP')} at {appointment.startTime}
                    </span>
                  </p>

                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <p className="flex justify-between font-bold text-[#d0a189] text-xl">
                      <span>Total Amount:</span>
                      <span>₹{appointment.service.price}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Select Payment Method */}
              <div className="mb-6">
                <h2 className="font-semibold text-[#a38772] mb-4 text-lg">
                  Select Payment Method
                </h2>

                <div className="space-y-3">
                  {/* Razorpay Option */}
                  <div
                    className={`border rounded-lg p-4 cursor-pointer flex items-center transition-all duration-200 ease-in-out ${
                      paymentMethod === 'razorpay' ? 'border-[#d0a189] bg-[#fef4ea]' : 'border-gray-200 hover:border-[#d0a189]'
                    }`}
                    onClick={() => setPaymentMethod('razorpay')}
                  >
                    <div className="flex-shrink-0 mr-4">
                      <FaCreditCard className="text-[#d0a189] text-2xl" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium">Credit/Debit Card, UPI & Net Banking (via Razorpay)</h3>
                      <p className="text-sm text-gray-500">
                        Pay securely using your preferred online method.
                      </p>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      {paymentMethod === 'razorpay' && (
                        <FaCheckCircle className="text-green-500 text-xl" /> 
                      )}
                    </div>
                  </div>

                  {/* Wallet Option */}
                  <div
                    className={`border rounded-lg p-4 cursor-pointer flex items-center transition-all duration-200 ease-in-out ${
                      paymentMethod === 'wallet' ? 'border-[#d0a189] bg-[#fef4ea]' : 'border-gray-200 hover:border-[#d0a189]'
                    } ${isWalletInsufficient ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''}`} 
                    onClick={() => {
                      if (!isWalletInsufficient) {
                        setPaymentMethod('wallet');
                      } else {
                        toast.error('Insufficient wallet balance for this payment.');
                      }
                    }}
                  >
                    <div className="flex-shrink-0 mr-4">
                      <FaWallet className="text-[#d0a189] text-2xl" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium">Pay with Wallet Balance</h3>
                      <p className="text-sm text-gray-500">
                        Current Balance: <span className="font-semibold">₹{user?.wallet?.balance || 0}</span>
                        {isWalletInsufficient && (
                          <span className="text-red-600 ml-2 font-medium">(Insufficient Balance)</span> 
                        )}
                      </p>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      {paymentMethod === 'wallet' && (
                        <FaCheckCircle className="text-green-500 text-xl" /> 
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Amount and Pay Now Button */}
              <div className="flex justify-between items-center border-t border-gray-200 pt-6">
                <div className="text-[#a38772]">
                  <p className="font-semibold">Amount Due:</p>
                  <p className="text-3xl font-bold">₹{appointment.service.price}</p>
                </div>

                <button
                  onClick={handlePayNow}
                  disabled={isProcessing || (paymentMethod === 'wallet' && isWalletInsufficient)}
                  className={`px-8 py-3 bg-[#d0a189] text-white rounded-lg transition-colors duration-200 ease-in-out flex items-center justify-center font-semibold text-lg ${
                    isProcessing || (paymentMethod === 'wallet' && isWalletInsufficient)
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-[#b88c6e]'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <LoadingSpinner size="small" className="mr-2 text-white" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaLock className="mr-2" />
                      Pay Now
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Secure Payment Footer */}
            <div className="bg-gray-50 p-4 text-center text-sm text-gray-500 flex items-center justify-center">
              <FaLock className="mr-2 text-green-600" />
              All payments are secure and encrypted.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
