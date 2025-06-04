// pages/user/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { FaCalendarAlt, FaHeart, FaWallet, FaUser, FaInfoCircle } from 'react-icons/fa';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import { getUserAppointments } from '../../services/appointmentService';
import { getUserProfile } from '../../services/userService';
import { getFavoriteShops } from '../../services/shopService';
import AppointmentCard from './AppointmentCard';
import ShopCard from '../../components/shop/ShopCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const UserDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [favoriteShops, setFavoriteShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Get user profile
        const profileResponse = await getUserProfile();
        setProfile(profileResponse.data);
        
        
        // Get user appointments
        const appointmentsResponse = await getUserAppointments();
        setAppointments(appointmentsResponse.data);
        
        
        // Get favorite shops
        const favoritesResponse = await getFavoriteShops();
        setFavoriteShops(favoritesResponse.data);
        console.log("favirites",favoritesResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
    
    // Animations
    gsap.from('.dashboard-card', {
      y: 30,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8,
      ease: 'power3.out'
    });
    gsap.to('.dashboard-card', {
      y: 0,
      opacity: 1,
      stagger: 0.1,
      duration: 0.8,
      ease: 'power3.out'
    });
  }, []);
  
  // Filter upcoming appointments
  const upcomingAppointments = appointments.filter(
    appointment => new Date(appointment.date) >= new Date()
  );
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="bg-[#fef4ea] min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#a38772] mb-6">
          Welcome, {user?.user?.name || 'User'}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Quick Stats */}
          <div className="dashboard-card bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-[#doa189] bg-opacity-20 flex items-center justify-center mr-4">
                <FaCalendarAlt className="text-[#doa189] text-xl" />
              </div>
              <div>
                <h2 className="text-gray-600">Upcoming Appointments</h2>
                <p className="text-3xl font-bold text-[#a38772]">
                  {upcomingAppointments.length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="dashboard-card bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-[#doa189] bg-opacity-20 flex items-center justify-center mr-4">
                <FaHeart className="text-[#doa189] text-xl" />
              </div>
              <div>
                <h2 className="text-gray-600">Favorite Shops</h2>
                <p className="text-3xl font-bold text-[#a38772]">
                  {favoriteShops.length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="dashboard-card bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-[#doa189] bg-opacity-20 flex items-center justify-center mr-4">
                <FaWallet className="text-[#doa189] text-xl" />
              </div>
              <div>
                <h2 className="text-gray-600">Wallet Balance</h2>
                <p className="text-3xl font-bold text-[#a38772]">
                  ₹{profile?.wallet?.balance || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Upcoming Appointments */}
        <div className="dashboard-card bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#a38772]">
              Upcoming Appointments
            </h2>
            <Link 
              to="/user/appointments" 
              className="text-[#doa189] hover:underline font-medium"
            >
              View All
            </Link>
          </div>
          
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.slice(0, 3).map(appointment => (
                <AppointmentCard 
                  key={appointment._id} 
                  appointment={appointment} 
                  showActions={true}
                  onStatusChange={() => {
                    // Refresh appointments after status change
                    getUserAppointments().then(res => {
                      setAppointments(res.data);
                    });
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaCalendarAlt className="text-gray-300 text-5xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-500 mb-2">
                No Upcoming Appointments
              </h3>
              <p className="text-gray-500 mb-4">
                You don't have any upcoming appointments scheduled.
              </p>
              <Link
                to="/shops"
                className="inline-block bg-[#doa189] hover:bg-[#ecdfcf] text-[#a27947] border-x-2 hover:text-[#a38772] font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Book an Appointment
              </Link>
            </div>
          )}
        </div>
        
        {/* Favorite Shops */}
        <div className="dashboard-card bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#a38772]">
              Favorite Shops
            </h2>
            <Link 
              to="/user/favorites" 
              className="text-[#doa189] hover:underline font-medium"
            >
              View All
            </Link>
          </div>
          
          {favoriteShops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteShops.slice(0, 3).map(shop => (
                 <ShopCard 
                 key={shop._id} 
                 shop={shop} 
                 onFavoriteToggle={() => {
                   // Refresh favorites after toggle
                   getFavoriteShops().then(res => {
                     setFavoriteShops(res.data);
                   });
                 }}
               />
             ))}
           </div>
         ) : (
           <div className="text-center py-8">
             <FaHeart className="text-gray-300 text-5xl mx-auto mb-4" />
             <h3 className="text-xl font-semibold text-gray-500 mb-2">
               No Favorite Shops Yet
             </h3>
             <p className="text-gray-500 mb-4">
               You haven't added any shops to your favorites list.
             </p>
             <Link
               to="/shops"
               className="inline-block bg-[#doa189] hover:bg-[#ecdfcf] text-[#a27947] border-x-2 hover:text-[#a38772] font-medium py-2 px-6 rounded-lg transition-colors"
             >
               Explore Shops
             </Link>
           </div>
         )}
       </div>
       
       {/* User Profile */}
       <div className="dashboard-card bg-white rounded-lg shadow-md p-6">
         <div className="flex items-center justify-between mb-6">
           <h2 className="text-xl font-bold text-[#a38772]">
             Profile Information
           </h2>
           <Link 
             to="/user/profile" 
             className="text-[#doa189] hover:underline font-medium"
           >
             Edit Profile
           </Link>
         </div>
         
         <div className="flex flex-col md:flex-row ">
           <div className="md:w-1/4 mb-6 md:mb-0 flex flex-col items-center">
             <div className="w-24 h-24 rounded-full overflow-hidden bg-[#doa189] flex items-center justify-center mb-3 border-x-2 border-[#a38772]">
               {profile?.profilePicture ? (
                 <img 
                   src={profile.profilePicture} 
                   alt={profile.name} 
                   className="w-full h-full object-cover "
                 />
               ) : (
                 <FaUser className="text-white text-4xl" />
               )}
             </div>
             
             <Link
               to="/user/profile"
               className="text-[#doa189] text-sm hover:underline"
             >
               Change Photo
             </Link>
           </div>
           
           <div className="md:w-3/4 grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-1">
               <p className="text-gray-500 text-sm">Full Name</p>
               <p className="font-medium text-gray-800">{profile?.name || 'N/A'}</p>
             </div>
             
             <div className="space-y-1">
               <p className="text-gray-500 text-sm">Email Address</p>
               <p className="font-medium text-gray-800">{profile?.email || 'N/A'}</p>
             </div>
             
             <div className="space-y-1">
               <p className="text-gray-500 text-sm">Phone Number</p>
               <p className="font-medium text-gray-800">{profile?.phone || 'N/A'}</p>
             </div>
             
             <div className="space-y-1">
               <p className="text-gray-500 text-sm">Account Status</p>
               <p className="font-medium text-gray-800">
                 <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                   Active
                 </span>
               </p>
             </div>
             
             <div className="space-y-1 md:col-span-2">
               <p className="text-gray-500 text-sm">Joined On</p>
               <p className="font-medium text-gray-800">
                 {profile?.createdAt ? format(new Date(profile.createdAt), 'MMMM d, yyyy') : 'N/A'}
               </p>
             </div>
           </div>
         </div>
       </div>
     </div>
   </div>
 );
};

export default UserDashboard;
