// client/src/components/common/Badge.jsx
import React from 'react';

const Badge = ({ 
  children, 
  variant = 'default',
  size = 'default'
}) => {
  // Define variant styles
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-[#fef4ea] text-[#doa189]',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };
  
  // Define size styles
  const sizeStyles = {
    small: 'text-xs px-2 py-0.5',
    default: 'text-xs px-2.5 py-0.5',
    large: 'text-sm px-3 py-1'
  };
  
  const badgeClass = `inline-flex items-center font-medium rounded-full ${variantStyles[variant] || variantStyles.default} ${sizeStyles[size] || sizeStyles.default}`;
  
  return (
    <span className={badgeClass}>
      {children}
    </span>
  );
};

export default Badge;