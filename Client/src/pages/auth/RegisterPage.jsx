// client/src/pages/auth/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaLock, 
  FaEye, 
  FaEyeSlash,
  FaArrowRight,
  FaStore,
  FaUserAlt
} from 'react-icons/fa';
import { gsap } from 'gsap';
import toast from 'react-hot-toast';

import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import OtpVerification from '../../components/auth/OtpVerification';

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'customer', // 'customer' or 'vendor'
    // Additional fields for vendors
    shopName: '',
    shopAddress: '',
    shopCategory: '',
    openingTime: '',
    closingTime: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  
  // Animation references
  const formRef = React.useRef(null);
  
  React.useEffect(() => {
    // Animate form on step change
    gsap.from(formRef.current, {
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    });
  }, [step]);
  
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
  
  const validateBasicInfo = () => {
    // Validate name
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return false;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    // Validate phone
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }
    
    // Validate password
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return false;
    }
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    
    return true;
  };
  
  const validateShopInfo = () => {
    // Only validate if user is a vendor
    if (formData.userType === 'vendor') {
      // Validate shop name
      if (!formData.shopName.trim()) {
        toast.error('Please enter your shop name');
        return false;
      }
      
      // Validate shop address
      if (!formData.shopAddress.trim()) {
        toast.error('Please enter your shop address');
        return false;
      }
      
      // Validate shop category
      if (!formData.shopCategory) {
        toast.error('Please select a shop category');
        return false;
      }
      
      // Validate opening time
      if (!formData.openingTime) {
        toast.error('Please enter your opening time');
        return false;
      }
      
      // Validate closing time
      if (!formData.closingTime) {
        toast.error('Please enter your closing time');
        return false;
      }
    }
    
    return true;
  };
  
  const sendOTP = async () => {
    setIsLoading(true);
    
    try {
      // In a real implementation, you'd call an API to send OTP
      // For this example, we'll simulate it with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setOtpSent(true);
      toast.success('OTP sent to your email and phone');
      
      // Move to OTP verification step
      setStep(2);
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const verifyOTP = async (otp) => {
    setIsLoading(true);
    
    try {
      // In a real implementation, you'd call an API to verify OTP
      // For this example, we'll simulate it with a timeout and accept any 6-digit OTP
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (otp.length !== 6 || !/^\d+$/.test(otp)) {
        throw new Error('Invalid OTP');
      }
      
      toast.success('OTP verified successfully');
      
      // If the user is a vendor, move to the shop details step
      if (formData.userType === 'vendor') {
        setStep(3);
      } else {
        // For customers, complete registration
        handleRegister();
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error(error.message || 'Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegister = async () => {
    setIsLoading(true);
    
    try {
      // Register the user
      await register(formData);
      
      toast.success(
        formData.userType === 'vendor'
          ? 'Registration successful! Your shop is pending approval.'
          : 'Registration successful!'
      );
      
      // Redirect based on user type
      if (formData.userType === 'vendor') {
        navigate('/vendor/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (step === 1) {
      // Validate personal details
      if (validateBasicInfo()) {
        sendOTP();
      }
    } else if (step === 3) {
      // Validate business details
      if (validateShopInfo()) {
        handleRegister();
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-[#fef4ea] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div ref={formRef} className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-[#doa189] py-6">
            <h2 className="text-center text-2xl font-bold text-white">
              {step === 1 && 'Create Your Account'}
              {step === 2 && 'Verify Your Account'}
              {step === 3 && 'Business Details'}
            </h2>
          </div>
          
          {/* Step indicators */}
          <div className="flex justify-between px-6 pt-6">
            <div className={`flex-1 text-center relative ${step >= 1 ? 'text-[#doa189]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-[#doa189] bg-[#doa189] text-white' : 'border-gray-300'}`}>
                1
              </div>
              <div className="mt-2 text-sm">Account</div>
              {step > 1 && <div className="absolute top-4 left-1/2 w-full h-0.5 bg-[#doa189] z-0"></div>}
            </div>
            
            <div className={`flex-1 text-center relative ${step >= 2 ? 'text-[#doa189]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-[#doa189] bg-[#doa189] text-white' : 'border-gray-300'}`}>
                2
              </div>
              <div className="mt-2 text-sm">Verify</div>
              {step > 2 && <div className="absolute top-4 left-1/2 w-full h-0.5 bg-[#doa189] z-0"></div>}
            </div>
            
            <div className={`flex-1 text-center ${step >= 3 ? 'text-[#doa189]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-[#doa189] bg-[#doa189] text-white' : 'border-gray-300'}`}>
                3
              </div>
              <div className="mt-2 text-sm">Business</div>
            </div>
          </div>
          
          <div className="p-6">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">I am registering as:</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      className={`flex items-center justify-center p-4 border rounded-lg ${
                        formData.userType === 'customer' 
                          ? 'border-[#doa189] bg-[#fef4ea] text-[#doa189]' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setFormData({ ...formData, userType: 'customer' })}
                    >
                      <FaUserAlt className="mr-2" />
                      <span>Customer</span>
                    </button>
                    
                    <button
                      type="button"
                      className={`flex items-center justify-center p-4 border rounded-lg ${
                        formData.userType === 'vendor' 
                          ? 'border-[#doa189] bg-[#fef4ea] text-[#doa189]' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setFormData({ ...formData, userType: 'vendor' })}
                    >
                      <FaStore className="mr-2" />
                      <span>Business Owner</span>
                    </button>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#doa189]"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#doa189]"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#doa189]"
                      placeholder="Enter your 10-digit phone number"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                    Password
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
                      placeholder="Create a password (min. 8 characters)"
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
                      placeholder="Confirm your password"
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
                        Processing...
                      </>
                    ) : (
                      <>
                        Continue
                        <FaArrowRight className="ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
            
            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <OtpVerification
                email={formData.email}
                phone={formData.phone}
                onVerify={verifyOTP}
                onResend={sendOTP}
                isLoading={isLoading}
              />
            )}
            
            {/* Step 3: Business Details (for vendors only) */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="shopName" className="block text-gray-700 font-medium mb-2">
                    Business Name
                  </label>
                  <input
                    id="shopName"
                    name="shopName"
                    type="text"
                    value={formData.shopName}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#doa189]"
                    placeholder="Enter your business name"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="shopCategory" className="block text-gray-700 font-medium mb-2">
                    Business Category
                  </label>
                  <select
                    id="shopCategory"
                    name="shopCategory"
                    value={formData.shopCategory}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#doa189]"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="salon">Salon</option>
                    <option value="spa">Spa</option>
                    <option value="gym">Gym</option>
                    <option value="yoga">Yoga Studio</option>
                    <option value="massage">Massage Center</option>
                    <option value="dance">Dance Academy</option>
                    <option value="tattoo">Tattoo Studio</option>
                    <option value="nail">Nail Art Studio</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="shopAddress" className="block text-gray-700 font-medium mb-2">
                    Business Address
                  </label>
                  <textarea
                    id="shopAddress"
                    name="shopAddress"
                    value={formData.shopAddress}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#doa189]"
                    placeholder="Enter your business address"
                    rows="3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="openingTime" className="block text-gray-700 font-medium mb-2">
                      Opening Time
                    </label>
                    <input
                      id="openingTime"
                      name="openingTime"
                      type="time"
                      value={formData.openingTime}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#doa189]"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="closingTime" className="block text-gray-700 font-medium mb-2">
                      Closing Time
                    </label>
                    <input
                      id="closingTime"
                      name="closingTime"
                      type="time"
                      value={formData.closingTime}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#doa189]"
                      required
                    />
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 italic">
                  Note: Your business will be reviewed by our team before it appears on the platform.
                </p>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center bg-[#doa189] hover:bg-[#ecdfcf] text-white font-bold py-3 px-4 rounded-lg transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="small" className="mr-2" />
                        Processing...
                      </>
                    ) : (
                      'Complete Registration'
                    )}
                  </button>
                </div>
              </form>
            )}
            
            {step === 1 && (
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link to="/login" className="text-[#doa189] hover:underline font-medium">
                    Sign In
                  </Link>
                </p>
              </div>
            )}
            
            {step > 1 && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="text-[#doa189] hover:underline font-medium"
                >
                  Back to Previous Step
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;