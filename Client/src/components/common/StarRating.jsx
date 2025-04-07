// client/src/components/common/StarRating.jsx
import React from 'react';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';

const StarRating = ({ 
  rating,
  totalStars = 5,
  size = 'default',
  interactive = false,
  onRatingChange,
  hoverRating,
  onHoverChange
}) => {
  // Define size styles
  const sizeMap = {
    small: 'text-sm',
    default: 'text-base',
    large: 'text-lg',
    xl: 'text-xl'
  };
  
  const sizeClass = sizeMap[size] || sizeMap.default;
  
  // Handle star click
  const handleStarClick = (selectedRating) => {
    if (interactive && onRatingChange) {
      onRatingChange(selectedRating);
    }
  };
  
  // Handle star hover
  const handleStarHover = (hoveredRating) => {
    if (interactive && onHoverChange) {
      onHoverChange(hoveredRating);
    }
  };
  
  // Handle mouse leave
  const handleMouseLeave = () => {
    if (interactive && onHoverChange) {
      onHoverChange(0);
    }
  };
  
  const renderStar = (starPosition) => {
    const isActive = (hoverRating || rating) >= starPosition;
    const isHalfStar = !isActive && (rating > starPosition - 1 && rating < starPosition);
    
    if (isActive) {
      return <FaStar className="text-yellow-400" />;
    } else if (isHalfStar) {
      return <FaStarHalfAlt className="text-yellow-400" />;
    } else {
      return <FaRegStar className="text-yellow-400" />;
    }
  };
  
  return (
    <div 
      className={`flex ${interactive ? 'cursor-pointer' : ''} ${sizeClass}`}
      onMouseLeave={interactive ? handleMouseLeave : undefined}
    >
      {[...Array(totalStars)].map((_, index) => {
        const starPosition = index + 1;
        
        return (
          <span
            key={index}
            onClick={() => handleStarClick(starPosition)}
            onMouseEnter={() => handleStarHover(starPosition)}
            className="mr-0.5"
          >
            {renderStar(starPosition)}
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;