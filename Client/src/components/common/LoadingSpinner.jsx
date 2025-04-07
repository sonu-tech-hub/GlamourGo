// client/src/components/common/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ size = 'default', className = '' }) => {
  const sizeClass = 
    size === 'small' ? 'w-5 h-5' : 
    size === 'large' ? 'w-12 h-12' : 
    'w-8 h-8';
  
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`${sizeClass} border-4 border-gray-200 border-t-[#doa189] rounded-full animate-spin`}></div>
    </div>
  );
};

export default LoadingSpinner;
