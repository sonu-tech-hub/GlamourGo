// client/src/pages/auth/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { gsap } from 'gsap';
import toast from 'react-hot-toast';

import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  
  React.useEffect(() => {
    // Animation
    gsap.from('.forgot-card', {
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    });
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email.trim()) {
      return toast.error('Please enter your email address');
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return toast.error('Please enter a valid email address');
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, call your API to send reset password email
      await api.post('/auth/forgot-password', { email });
      
      setIsEmailSent(true);
      toast.success('Reset link sent to your email');
    } catch (error) {
      console.error('Error sending reset link:', error);
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fef4ea] py-12 px-4 sm:px-6 lg:px-8">
      <div className="forgot-card max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-[#doa189] py-6">
          <h2 className="text-center text-2xl font-bold text-white">
            Reset Your Password
          </h2>
        </div>
        
        <div className="p-8">
          {!isEmailSent ? (
            <>
              <p className="text-gray-600 mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#doa189]"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center bg-[#doa189] hover:bg-[#ecdfcf] text-white font-bold py-3 px-4 rounded-lg transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="small" className="mr-2" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800">Check Your Email</h3>
              
              <p className="text-gray-600">
                We've sent a password reset link to <span className="font-medium">{email}</span>.
                Please check your inbox and follow the instructions to reset your password.
              </p>
              
              <p className="text-sm text-gray-500 mt-4">
                If you don't receive an email within a few minutes, check your spam folder
                or <button 
                  onClick={() => setIsEmailSent(false)}
                  className="text-[#doa189] hover:underline font-medium"
                >
                  try again
                </button>.
              </p>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="flex items-center justify-center text-[#doa189] hover:underline font-medium"
            >
              <FaArrowLeft className="mr-2" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
