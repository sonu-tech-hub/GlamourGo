// client/src/pages/auth/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa';
import { gsap } from 'gsap';
import toast from 'react-hot-toast';

import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  
  useEffect(() => {
    // Animation
    gsap.from('.reset-card', {
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    });
    
    // Verify token
    const verifyToken = async () => {
      try {
        await api.get(`/auth/verify-reset-token/${token}`);
      } catch (error) {
        console.error('Invalid or expired token:', error);
        setIsValidToken(false);
        toast.error('Invalid or expired reset link');
      }
    };
    
    verifyToken();
  }, [token]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password
    if (formData.password.length < 8) {
      return toast.error('Password must be at least 8 characters long');
    }
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    
    setIsLoading(true);
    
    try {
      // Reset password
      await api.post('/auth/reset-password', {
        token,
        password: formData.password
      });
      
      setIsSuccess(true);
      toast.success('Password reset successfully');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fef4ea] py-12 px-4 sm:px-6 lg:px-8">
        <div className="reset-card max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-red-500 py-6">
            <h2 className="text-center text-2xl font-bold text-white">
              Invalid Reset Link
            </h2>
          </div>
          
          <div className="p-8 text-center">
            <p className="text-gray-600 mb-6">
              The password reset link is invalid or has expired. Please request a new link.
            </p>
            
            <Link
              to="/forgot-password"
              className="inline-block bg-[#doa189] hover:bg-[#ecdfcf] text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fef4ea] py-12 px-4 sm:px-6 lg:px-8">
      <div className="reset-card max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-[#doa189] py-6">
          <h2 className="text-center text-2xl font-bold text-white">
            Reset Your Password
          </h2>
        </div>
        
        <div className="p-8">
          {!isSuccess ? (
            <>
              <p className="text-gray-600 mb-6">
                Enter your new password below.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#doa189]"
                      placeholder="Create a new password (min. 8 characters)"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={toggleShowPassword}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#doa189]"
                      placeholder="Confirm your new password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={toggleShowConfirmPassword}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
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
                        Resetting Password...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <FaCheck className="text-green-500 text-2xl" />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800">Password Reset Successful</h3>
              
              <p className="text-gray-600">
                Your password has been reset successfully. You can now log in with your new password.
              </p>
              
              <p className="text-sm text-gray-500 mt-4">
                Redirecting to login page...
              </p>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <Link to="/login" className="text-[#doa189] hover:underline font-medium">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;