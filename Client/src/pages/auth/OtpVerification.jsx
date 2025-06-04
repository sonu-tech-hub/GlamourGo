// client/src/components/auth/OtpVerification.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaEnvelope, FaPhone, FaLock } from 'react-icons/fa';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const OtpVerification = ({ email, phone, onVerify, onResend, isLoading }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef([]);
  
  // Initialize timer
  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer(prevTimer => {
        if (prevTimer <= 1) {
          clearInterval(countdown);
          setCanResend(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
    
    return () => clearInterval(countdown);
  }, []);
  
  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);
  
  const handleChange = (e, index) => {
    const { value } = e.target;
    
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;
    
    // Update OTP array
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1); // Take only the first digit
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };
  
  const handleKeyDown = (e, index) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    }
    
    // Handle left arrow
    if (e.key === 'ArrowLeft' && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
    
    // Handle right arrow
    if (e.key === 'ArrowRight' && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };
  
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    // Check if pasted data is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      
      // Focus the last input
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const otpValue = otp.join('');
    
    // Validate OTP (must be 6 digits)
    if (otpValue.length !== 6) {
      alert('Please enter the complete 6-digit OTP');
      return;
    }
    
    onVerify(otpValue);
  };
  
  const handleResend = () => {
    if (canResend) {
      onResend();
      setTimer(30);
      setCanResend(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-center text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#fef4ea] flex items-center justify-center">
            <FaLock className="text-[#doa189] text-xl" />
          </div>
        </div>
        
        <p className="text-center text-gray-700 mb-2">
          Enter the verification code sent to:
        </p>
        
        <div className="flex flex-col items-center justify-center text-center mb-6">
          <div className="flex items-center mb-1">
            <FaEnvelope className="text-gray-500 mr-2" />
            <span className="text-gray-800 font-medium">{email}</span>
          </div>
          
          {phone && (
            <div className="flex items-center">
              <FaPhone className="text-gray-500 mr-2" />
              <span className="text-gray-800 font-medium">{phone}</span>
            </div>
          )}
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="flex justify-center space-x-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              value={digit}
              onChange={e => handleChange(e, index)}
              onKeyDown={e => handleKeyDown(e, index)}
              onPaste={index === 0 ? handlePaste : null}
              className="w-12 h-14 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:border-[#doa189]"
              maxLength={1}
              autoComplete="one-time-code"
              inputMode="numeric"
              disabled={isLoading}
              required
            />
          ))}
        </div>
        
        <button
          type="submit"
          disabled={isLoading || otp.join('').length !== 6}
          className="w-full flex justify-center items-center bg-[#doa189] hover:bg-[#ecdfcf] text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="small" className="mr-2" />
              Verifying...
            </>
          ) : (
            'Verify'
          )}
        </button>
      </form>
      
      <div className="text-center">
        <p className="text-gray-600">
          Didn't receive the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend || isLoading}
            className={`${
              canResend 
                ? 'text-[#doa189] hover:underline font-medium' 
                : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            {canResend ? 'Resend' : `Resend in ${timer}s`}
          </button>
        </p>
      </div>
    </div>
  );
};

export default OtpVerification;
