import React from 'react';
import { FaBars } from 'react-icons/fa';

const MobileSidebarToggle = ({ isOpen, onClick }) => {
  return (
    <button
      className="fixed bottom-4 left-4 lg:hidden z-40 p-3 bg-[#d0a189] text-white rounded-full shadow-md" // Corrected hex code here
      onClick={onClick}
      aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
    >
      <FaBars />
    </button>
  );
};

export default MobileSidebarToggle;