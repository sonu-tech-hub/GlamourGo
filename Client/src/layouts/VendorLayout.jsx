// client/src/layouts/VendorLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import VendorSidebar from '../components/layout/VendorSidebar';
import VendorHeader from '../components/layout/VendorHeader';
import MobileSidebarToggle from '../components/layout/MobileSidebarToggle';

const VendorLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  return (
    <div className="flex h-screen bg-[#fef4ea]">
      {/* Sidebar */}
      <VendorSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      {/* Mobile Sidebar Toggle */}
      <MobileSidebarToggle 
        isOpen={isSidebarOpen} 
        onClick={toggleSidebar} 
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <VendorHeader />
        
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;