// client/src/components/common/Logo.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo.png'

const Logo = ({ size = 'default' }) => {
  const sizeClass = 
    size === 'small' ? 'h-8' : 
    size === 'large' ? 'h-16' : 
    'h-10';
  
  return (
    <Link to="/" className="flex items-center">
      <img 
        src={logo}
        alt="GlamourGo" 
        className={`${sizeClass} mr-2`}
      />
      <span className="text-xl font-bold text-[#11511e]">GlamourGo</span>
    </Link>
  );
};

export default Logo;
