// client/src/components/common/Logo.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ size = 'default' }) => {
  const sizeClass = 
    size === 'small' ? 'h-8' : 
    size === 'large' ? 'h-16' : 
    'h-10';
  
  return (
    <Link to="/" className="flex items-center">
      <img 
        src="/logo.png" 
        alt="Beauty & Wellness" 
        className={`${sizeClass} mr-2`}
      />
      <span className="text-xl font-bold text-[#a38772]">Beauty & Wellness</span>
    </Link>
  );
};

export default Logo;
