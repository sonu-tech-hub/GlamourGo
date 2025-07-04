import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaStore,
  FaUserAlt,
} from "react-icons/fa";
import { gsap } from "gsap";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import OtpVerification from "./OtpVerification";
import api from "../../services/api";

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "", // Needed for controlled input
    email: "", // Needed for controlled input
    phone: "", // Needed for controlled input
    password: "", // Needed for controlled input
    confirmPassword: "", // Needed for controlled input
    userType: "customer", // Default value, not an empty string
    // Additional fields for vendors
    shopName: "", // Needed for controlled input
    shopAddress: "", // Needed for controlled input
    shopCategory: "", // Needed for controlled input
    openingTime: "", // Needed for controlled input
    closingTime: "", // Needed for controlled input
    latitude: "", // Needed for controlled input
    longitude: "", // Needed for controlled input
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate(); // Animation references

  const formRef = React.useRef(null);

  React.useEffect(() => {
    // Animate form on step change
    gsap.from(formRef.current, {
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    });
    gsap.to(formRef.current, {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: "power3.out", // delay: 0.2, // Optional: Add a slight delay for smoother transition
    });
  }, [step]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateBasicInfo = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return false;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return true;
  };

  const validateShopInfo = () => {
    if (formData.userType === "vendor") {
      if (!formData.shopName.trim()) {
        toast.error("Please enter your business name");
        return false;
      }

      if (!formData.shopAddress.trim()) {
        toast.error("Please enter your business address");
        return false;
      }

      if (!formData.shopCategory) {
        toast.error("Please select a business category");
        return false;
      }

      if (!formData.openingTime) {
        toast.error("Please enter your opening time");
        return false;
      }

      if (!formData.closingTime) {
        toast.error("Please enter your closing time");
        return false;
      }
      // Latitude and Longitude validation
      if (!formData.latitude || isNaN(parseFloat(formData.latitude))) {
        toast.error("Please enter a valid business latitude");
        return false;
      }
      if (!formData.longitude || isNaN(parseFloat(formData.longitude))) {
        toast.error("Please enter a valid business longitude");
        return false;
      }
    }
    return true;
  };

  const sendOTP = async () => {
    setIsLoading(true);
    try {
      await api.post("/auth/send-otp", {
        email: formData.email,
        phone: formData.phone,
        purpose: "registration",
      });
      toast.success("OTP sent to your email and phone");
      setStep(2); // Move to OTP verification step
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error(
        error.response?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async ({ email, phone, otp }) => {
    if (!email || !phone || !otp) {
      toast.error("Missing email, phone, or OTP");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/verify-otp", {
        email,
        phone,
        otp,
        purpose: "registration",
      });

      toast.success("OTP verified successfully");

      if (formData.userType === "vendor") {
        setStep(3); // Move to business details for vendors
      } else {
        handleRegister(); // Directly register customers
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error(error.response?.data?.message || "Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      await register(formData);

      toast.success(
        formData.userType === "vendor"
          ? "Registration successful! Your business is pending approval."
          : "Registration successful!"
      );

      if (formData.userType === "vendor") {
        navigate("/vendor/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (step === 1) {
      if (validateBasicInfo()) {
        sendOTP();
      }
    } else if (step === 3) {
      if (validateShopInfo()) {
        handleRegister();
      }
    } // No explicit handleSubmit for step 2, as OtpVerification handles its own submission (via onVerify prop)
  };

  return (
    <div className="min-h-screen bg-[#fef4ea] py-12 px-4 sm:px-6 lg:px-8">
       {" "}
      <div className="max-w-md mx-auto">
           {" "}
        <div
          ref={formRef}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
               {" "}
          <div className="bg-[#d0a189] py-6">
            <h2 className="text-center text-2xl font-bold text-white">
                        {step === 1 && "Create Your Account"}         {" "}
              {step === 2 && "Verify Your Account"}         {" "}
              {step === 3 && "Business Details"}       {" "}
            </h2>
                   
          </div>
                {/* Step indicators */}     {" "}
          <div className="flex justify-between px-6 pt-6 relative">
                       {" "}
            <div
              className={`flex-1 text-center relative ${
                step >= 1 ? "text-[#d0a189]" : "text-gray-400"
              }`}
            >
                           {" "}
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center border-2 ${
                  step >= 1
                    ? "border-[#d0a189] bg-[#d0a189] text-white"
                    : "border-gray-300"
                }`}
              >
                                1              {" "}
              </div>
                            <div className="mt-2 text-sm">Account</div>         
                 {" "}
              {step > 1 && (
                <div className="absolute top-4 left-[calc(50%+1rem)] w-[calc(100%-2rem)] h-0.5 bg-[#d0a189] z-0 -translate-x-1/2"></div>
              )}
                         {" "}
            </div>
                       {" "}
            <div
              className={`flex-1 text-center relative ${
                step >= 2 ? "text-[#d0a189]" : "text-gray-400"
              }`}
            >
                           {" "}
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center border-2 ${
                  step >= 2
                    ? "border-[#d0a189] bg-[#d0a189] text-white"
                    : "border-gray-300"
                }`}
              >
                                2              {" "}
              </div>
                            <div className="mt-2 text-sm">Verify</div>         
                 {" "}
              {step > 2 && (
                <div className="absolute top-4 left-[calc(50%+1rem)] w-[calc(100%-2rem)] h-0.5 bg-[#d0a189] z-0 -translate-x-1/2"></div>
              )}
                         {" "}
            </div>
                       {" "}
            <div
              className={`flex-1 text-center ${
                step >= 3 ? "text-[#d0a189]" : "text-gray-400"
              }`}
            >
                           {" "}
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center border-2 ${
                  step >= 3
                    ? "border-[#d0a189] bg-[#d0a189] text-white"
                    : "border-gray-300"
                }`}
              >
                                3              {" "}
              </div>
                            <div className="mt-2 text-sm">Business</div>       
                 {" "}
            </div>
                     {" "}
          </div>
                   {" "}
          <div className="p-6">
                        {/* Step 1: Basic Info */}           {" "}
            {step === 1 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                               {" "}
                <div className="mb-4">
                                   {" "}
                  <label className="block text-gray-700 font-medium mb-2">
                                        I am registering as:                
                     {" "}
                  </label>
                                   {" "}
                  <div className="grid grid-cols-2 gap-4">
                                       {" "}
                    <button
                      type="button"
                      className={`flex items-center justify-center p-4 border rounded-lg transition-colors ${
                        formData.userType === "customer"
                          ? "border-[#d0a189] bg-[#fef4ea] text-[#d0a189]"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() =>
                        setFormData({ ...formData, userType: "customer" })
                      }
                    >
                                            <FaUserAlt className="mr-2" />     
                                      <span>Customer</span>                 
                       {" "}
                    </button>
                                       {" "}
                    <button
                      type="button"
                      className={`flex items-center justify-center p-4 border rounded-lg transition-colors ${
                        formData.userType === "vendor"
                          ? "border-[#d0a189] bg-[#fef4ea] text-[#d0a189]"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() =>
                        setFormData({ ...formData, userType: "vendor" })
                      }
                    >
                                            <FaStore className="mr-2" />       
                                    <span>Business Owner</span>                 
                       {" "}
                    </button>
                                     {" "}
                  </div>
                                 {" "}
                </div>
                               {" "}
                <div>
                                   {" "}
                  <label
                    htmlFor="name"
                    className="block text-gray-700 font-medium mb-2"
                  >
                                        Full Name                  {" "}
                  </label>
                                   {" "}
                  <div className="relative">
                                       {" "}
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                       {" "}
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
                      placeholder="Enter your full name"
                      required
                    />
                                     {" "}
                  </div>
                                 {" "}
                </div>
                               {" "}
                <div>
                                   {" "}
                  <label
                    htmlFor="email"
                    className="block text-gray-700 font-medium mb-2"
                  >
                                        Email Address                  {" "}
                  </label>
                                   {" "}
                  <div className="relative">
                                       {" "}
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                       {" "}
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
                      placeholder="Enter your email"
                      required
                    />
                                     {" "}
                  </div>
                                 {" "}
                </div>
                               {" "}
                <div>
                                   {" "}
                  <label
                    htmlFor="phone"
                    className="block text-gray-700 font-medium mb-2"
                  >
                                        Phone Number                  {" "}
                  </label>
                                   {" "}
                  <div className="relative">
                                       {" "}
                    <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                       {" "}
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
                      placeholder="Enter your 10-digit phone number"
                      required
                    />
                                     {" "}
                  </div>
                                 {" "}
                </div>
                               {" "}
                <div>
                                   {" "}
                  <label
                    htmlFor="password"
                    className="block text-gray-700 font-medium mb-2"
                  >
                                        Password                  {" "}
                  </label>
                                   {" "}
                  <div className="relative">
                                       {" "}
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                       {" "}
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
                      placeholder="Create a password (min. 8 characters)"
                      required
                    />
                                       {" "}
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={toggleShowPassword}
                    >
                                           {" "}
                      {showPassword ? <FaEyeSlash /> : <FaEye />}               
                         {" "}
                    </button>
                                     {" "}
                  </div>
                                 {" "}
                </div>
                               {" "}
                <div>
                                   {" "}
                  <label
                    htmlFor="confirmPassword"
                    className="block text-gray-700 font-medium mb-2"
                  >
                                        Confirm Password                  {" "}
                  </label>
                                   {" "}
                  <div className="relative">
                                       {" "}
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                       {" "}
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
                      placeholder="Confirm your password"
                      required
                    />
                                       {" "}
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={toggleShowConfirmPassword}
                    >
                                           {" "}
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}       
                                 {" "}
                    </button>
                                     {" "}
                  </div>
                                 {" "}
                </div>
                               {" "}
                <div>
                                   {" "}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex justify-center items-center font-bold py-3 px-4 rounded-lg transition-colors ${
                      isLoading
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-[#d0a189] hover:bg-[#ecdfcf] text-white hover:text-[#8b612e]"
                    }`}
                  >
                                       {" "}
                    {isLoading ? (
                      <>
                                               {" "}
                        <LoadingSpinner size="small" className="mr-2" />       
                                        Processing...                      {" "}
                      </>
                    ) : (
                      <>
                                                Continue                        {" "}
                        <FaArrowRight className="ml-2" />                   
                         {" "}
                      </>
                    )}
                                     {" "}
                  </button>
                                 {" "}
                </div>
                             {" "}
              </form>
            )}
                        {/* Step 2: OTP Verification - Conditionally render */} 
                     {" "}
            {step === 2 && (
              <OtpVerification
                email={formData.email}
                phone={formData.phone}
                onVerify={(otp) =>
                  verifyOTP({
                    email: formData.email,
                    phone: formData.phone,
                    otp,
                  })
                }
                onResend={sendOTP}
                isLoading={isLoading}
              />
            )}
                        {/* Step 3: Business Details (for vendors only) */}     
                 {" "}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                               {" "}
                <div>
                                   {" "}
                  <label
                    htmlFor="shopName"
                    className="block text-gray-700 font-medium mb-2"
                  >
                                        Business Name                  {" "}
                  </label>
                                   {" "}
                  <input
                    id="shopName"
                    name="shopName"
                    type="text"
                    value={formData.shopName}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
                    placeholder="Enter your business name"
                    required
                  />
                                 {" "}
                </div>
                               {" "}
                <div>
                                   {" "}
                  <label
                    htmlFor="shopCategory"
                    className="block text-gray-700 font-medium mb-2"
                  >
                                        Business Category                  {" "}
                  </label>
                                   {" "}
                  <select
                    id="shopCategory"
                    name="shopCategory"
                    value={formData.shopCategory}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
                    required
                  >
                                       {" "}
                    <option value="">Select Category</option>{" "}
                    {/* This empty value is needed */}                   {" "}
                    <option value="salon">Salon</option>                   {" "}
                    <option value="spa">Spa</option>                   {" "}
                    <option value="gym">Gym</option>                   {" "}
                    <option value="yoga">Yoga Studio</option>                   {" "}
                    <option value="massage">Massage Center</option>             
                          <option value="dance">Dance Academy</option>         
                              <option value="tattoo">Tattoo Studio</option>     
                                  <option value="nail">Nail Art Studio</option> 
                                      <option value="other">Other</option>     
                               {" "}
                  </select>
                                 {" "}
                </div>
                               {" "}
                <div>
                                   {" "}
                  <label
                    htmlFor="shopAddress"
                    className="block text-gray-700 font-medium mb-2"
                  >
                                        Business Address                  {" "}
                  </label>
                                   {" "}
                  <textarea
                    id="shopAddress"
                    name="shopAddress"
                    value={formData.shopAddress}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
                    placeholder="Enter your business address"
                    rows="3"
                    required
                  />
                                 {" "}
                </div>
                                {/* Latitude Input */}               {" "}
                <div>
                                   {" "}
                  <label
                    htmlFor="latitude"
                    className="block text-gray-700 font-medium mb-2"
                  >
                                        Business Latitude                  {" "}
                  </label>
                                   {" "}
                  <input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
                    placeholder="e.g., 28.6139"
                    required
                  />
                                 {" "}
                </div>
                                {/* Longitude Input */}               {" "}
                <div>
                                   {" "}
                  <label
                    htmlFor="longitude"
                    className="block text-gray-700 font-medium mb-2"
                  >
                                        Business Longitude                
                     {" "}
                  </label>
                                   {" "}
                  <input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
                    placeholder="e.g., 77.1025"
                    required
                  />
                                 {" "}
                </div>
                               {" "}
                <div className="grid grid-cols-2 gap-4">
                                   {" "}
                  <div>
                                       {" "}
                    <label
                      htmlFor="openingTime"
                      className="block text-gray-700 font-medium mb-2"
                    >
                                            Opening Time                  
                       {" "}
                    </label>
                                       {" "}
                    <input
                      id="openingTime"
                      name="openingTime"
                      type="time"
                      value={formData.openingTime}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
                      required
                    />
                                     {" "}
                  </div>
                                   {" "}
                  <div>
                                       {" "}
                    <label
                      htmlFor="closingTime"
                      className="block text-gray-700 font-medium mb-2"
                    >
                                            Closing Time                  
                       {" "}
                    </label>
                                       {" "}
                    <input
                      id="closingTime"
                      name="closingTime"
                      type="time"
                      value={formData.closingTime}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
                      required
                    />
                                     {" "}
                  </div>
                                 {" "}
                </div>
                               {" "}
                <p className="text-sm text-gray-500 italic">
                                    Note: Your business will be reviewed by our
                  team before it                   appears on the platform.    
                             {" "}
                </p>
                               {" "}
                <div className="pt-2">
                                   {" "}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex justify-center items-center font-bold py-3 px-4 rounded-lg transition-colors ${
                      isLoading
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-[#d0a189] hover:bg-[#ecdfcf] text-white hover:text-[#8b612e]"
                    }`}
                  >
                                       {" "}
                    {isLoading ? (
                      <>
                                               {" "}
                        <LoadingSpinner size="small" className="mr-2" />       
                                        Processing...                      {" "}
                      </>
                    ) : (
                      "Complete Registration"
                    )}
                                     {" "}
                  </button>
                                 {" "}
                </div>
                             {" "}
              </form>
            )}
                       {" "}
            {step === 1 && (
              <div className="mt-6 text-center">
                               {" "}
                <p className="text-gray-600">
                                    Already have an account?                  {" "}
                  <Link
                    to="/login"
                    className="text-[#d0a189] hover:underline font-medium"
                  >
                                        Sign In                  {" "}
                  </Link>
                                 {" "}
                </p>
                             {" "}
              </div>
            )}
                        {/* Back button logic */}           {" "}
            {step > 1 && (
              <div className="mt-6 text-center">
                               {" "}
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="text-[#d0a189] hover:underline font-medium"
                >
                                    Back to Previous Step                {" "}
                </button>
                             {" "}
              </div>
            )}
                     {" "}
          </div>
                 {" "}
        </div>
             {" "}
      </div>
         {" "}
    </div>
  );
};

export default RegisterPage;
