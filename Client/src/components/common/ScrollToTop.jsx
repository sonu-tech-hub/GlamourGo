// client/src/components/common/ScrollToTop.jsx
import React from 'react';
import { FaArrowUp } from 'react-icons/fa';

const ScrollToTop = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 p-3 bg-[#doa189] text-white rounded-full shadow-md hover:bg-[#ecdfcf] transition-colors z-40"
      aria-label="Scroll to top"
    >
      <FaArrowUp />
    </button>
  );
};

export default ScrollToTop;
