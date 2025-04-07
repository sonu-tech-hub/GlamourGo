// pages/PaymentPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaWallet, FaCreditCard, FaLock } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

import { getAppointmentDetails } from '../services/appointmentService';
import { createPaymentOrder, verifyPayment, payUsingWallet } from '../services/paymentService';
import { getUserProfile } from '../services/userService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PaymentPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  
  const [appointment, setAppointment] = useState(null);
  const [user, setUser] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get appointment details
        const appointmentResponse = await getAppointmentDetails(appointmentId);
        setAppointment(appointmentResponse.data);
        
        // Get user profile for wallet balance
        const userResponse = await getUserProfile();
        setUser(userResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load payment data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [appointmentId]);
  
  const initializeRazorpay = async () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
        toast.error('Razorpay SDK failed to load. Please try again later.');
      };
      document.body.appendChild(script);
    });
  };
  
  const handlePayNow = async () => {
    if (paymentMethod === 'wallet') {
      handleWalletPayment();
      return;
    }
    
    setIsProcessing(true);
    try {
      // Load Razorpay SDK
      const res = await initializeRazorpay();
      
      if (!res) {
        toast.error('Razorpay SDK failed to load');
        return;
      }
      
      // Create payment order
      const orderResponse = await createPaymentOrder(appointmentId);
      const { id: orderId, amount } = orderResponse.data;
      
      // Configure Razorpay options
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: amount,
        currency: 'INR',
        name: 'Beauty & Wellness',
        description: `Payment for ${appointment.service.name} at ${appointment.shop.name}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            // Verify payment
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
            toast.error('Payment verification failed. Please contact support.');
            navigate(`/payment/failed/${appointmentId}`);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone
        },
        theme: {
          color: '#doa189'
        }
      };
      
      // Initialize Razorpay
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      
      // Handle payment failure
      paymentObject.on('payment.failed', function (response) {
        toast.error('Payment failed. Please try again.');
        console.error('Payment failed:', response.error);
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error(error.response?.data?.message || 'Payment initialization failed');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleWalletPayment = async () => {
    setIsProcessing(true);
    try {
      await payUsingWallet(appointmentId);
      toast.success('Payment successful!');
      navigate(`/payment/success/${appointmentId}`);
    } catch (error) {
      console.error('Wallet payment failed:', error);
      toast.error(error.response?.data?.message || 'Wallet payment failed');
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!appointment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-[#a38772] mb-4">Appointment not found</h2>
        <p className="text-gray-600 mb-6">The appointment you're trying to pay for could not be found.</p>
        <button
          onClick={() => navigate('/user/appointments')}
          className="bg-[#doa189] hover:bg-[#ecdfcf] text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Go to My Appointments
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-[#fef4ea] min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-[#doa189] p-6 text-white">
              <h1 className="text-2xl font-bold">Payment</h1>
              <p>Complete your payment to confirm your appointment</p>
            </div>
            <div className="p-6">
              <div className="mb-6 bg-[#fef4ea] p-4 rounded-lg">
                <h2 className="font-semibold text-[#a38772] mb-2">
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
                      {format(new Date(appointment.date), 'MMMM d, yyyy')} at {appointment.startTime}
                    </span>
                  </p>
                  
                  <p className="flex justify-between font-bold text-[#doa189]">
                    <span>Amount:</span>
                    <span>₹{appointment.service.price}</span>
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="font-semibold text-[#a38772] mb-4">
                  Select Payment Method
                </h2>
                
                <div className="space-y-3">
                  <div
                    className={`border rounded-lg p-4 cursor-pointer flex items-center ${
                      paymentMethod === 'razorpay' ? 'border-[#doa189] bg-[#fef4ea]' : 'border-gray-200'
                    }`}
                    onClick={() => setPaymentMethod('razorpay')}
                  >
                    <div className="flex-shrink-0 mr-4">
                      <FaCreditCard className="text-[#doa189] text-2xl" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium">Credit/Debit Card or UPI</h3>
                      <p className="text-sm text-gray-500">
                        Pay securely using your credit/debit card or UPI
                      </p>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      {paymentMethod === 'razorpay' && (
                        <FaCheckCircle className="text-green-500" />
                      )}
                    </div>
                  </div>
                  
                  <div
                    className={`border rounded-lg p-4 cursor-pointer flex items-center ${
                      paymentMethod === 'wallet' ? 'border-[#doa189] bg-[#fef4ea]' : 'border-gray-200'
                    } ${user?.wallet?.balance < appointment.service.price ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => {
                      if (user?.wallet?.balance >= appointment.service.price) {
                        setPaymentMethod('wallet');
                      } else {
                        toast.error('Insufficient wallet balance');
                      }
                    }}
                  >
                    <div className="flex-shrink-0 mr-4">
                      <FaWallet className="text-[#doa189] text-2xl" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium">Wallet Balance</h3>
                      <p className="text-sm text-gray-500">
                        Current Balance: ₹{user?.wallet?.balance || 0}
                        {user?.wallet?.balance < appointment.service.price && (
                          <span className="text-red-500 ml-2">(Insufficient)</span>
                        )}
                      </p>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      {paymentMethod === 'wallet' && (
                        <FaCheckCircle className="text-green-500" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center border-t border-gray-200 pt-6">
                <div className="text-[#a38772]">
                  <p className="font-semibold">Total Amount:</p>
                  <p className="text-2xl font-bold">₹{appointment.service.price}</p>
                </div>
                
                <button
                  onClick={handlePayNow}
                  disabled={isProcessing || (paymentMethod === 'wallet' && user?.wallet?.balance < appointment.service.price)}
                  className={`px-6 py-3 bg-[#doa189] text-white rounded-lg transition-colors flex items-center ${
                    isProcessing || (paymentMethod === 'wallet' && user?.wallet?.balance < appointment.service.price)
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-[#ecdfcf]'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <LoadingSpinner size="small" className="mr-2" />
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
            
            <div className="bg-gray-50 p-4 text-center text-sm text-gray-500 flex items-center justify-center">
              <FaLock className="mr-2 text-green-500" />
              All payments are secure and encrypted
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
