// client/src/pages/user/Profile.jsx (continued)
import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaCamera, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';

import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // General information state
  const [generalInfo, setGeneralInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Password visibility state
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  
  // Profile image
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  
  useEffect(() => {
    if (user) {
      setGeneralInfo({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
      
      if (user.profilePicture) {
        setPreviewUrl(user.profilePicture);
      }
    }
  }, [user]);
  
  const handleGeneralInfoChange = (e) => {
    const { name, value } = e.target;
    setGeneralInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.match('image.*')) {
        toast.error('Please select an image file');
        return;
      }
      
      setProfileImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const uploadProfileImage = async () => {
    if (!profileImage) return;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('profileImage', profileImage);
      
      const response = await api.post('/users/profile', formData);
      
      // Update user context with new profile image
      await updateProfile({ profilePicture: response.data.profilePicture });
      
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast.error(error.response?.data?.message || 'Failed to upload profile image');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(generalInfo.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    // Validate phone (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(generalInfo.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Update profile
      await updateProfile(generalInfo);
      
      // Upload profile image if changed
      if (profileImage) {
        await uploadProfileImage();
      }
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Validate new password
    if (passwordData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }
    
    // Validate password match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      toast.success('Password changed successfully');
      
      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-[#fef4ea] min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#a38772] mb-6">Profile Settings</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-4 px-6 text-center focus:outline-none ${
                activeTab === 'general'
                  ? 'border-b-2 border-[#doa189] text-[#doa189] font-medium'
                  : 'text-gray-500 hover:text-[#a38772]'
              }`}
              onClick={() => setActiveTab('general')}
            >
              General Information
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center focus:outline-none  ${
                activeTab === 'password'
                  ? 'border-b-2 border-[#doa189] text-[#doa189] font-medium'
                  : 'text-gray-500 hover:text-[#a38772]'
              }`}
              onClick={() => setActiveTab('password')}
            >
              Change Password
            </button>
          </div>
          
          <div className="p-6">
            {/* General Information Tab */}
            {activeTab === 'general' && (
              <form onSubmit={handleUpdateProfile}>
                <div className="flex flex-col md:flex-row">
                  {/* Profile Image */}
                  <div className="md:w-1/3 mb-6 md:mb-0 flex flex-col items-center ">
                    <div className="relative mb-4">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#doa189] text-white text-4xl">
                            {generalInfo.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <label
                        htmlFor="profile-image"
                        className="absolute bottom-0 right-0 w-8 h-8 bg-[#doa189] rounded-full flex items-center justify-center text-white cursor-pointer"
                      >
                        <FaCamera />
                        <input
                          type="file"
                          id="profile-image"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Upload a profile picture (max 5MB)
                    </p>
                  </div>
                  
                  {/* Profile Details */}
                  <div className="md:w-2/3 md:pl-8">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            id="name"
                            name="name"
                            type="text"
                            value={generalInfo.name}
                            onChange={handleGeneralInfoChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#doa189]"
                            placeholder="Enter your full name"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            id="email"
                            name="email"
                            type="email"
                            value={generalInfo.email}
                            onChange={handleGeneralInfoChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#doa189]"
                            placeholder="Enter your email"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={generalInfo.phone}
                            onChange={handleGeneralInfoChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#doa189]"
                            placeholder="Enter your 10-digit phone number"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={isLoading || isUploading}
                          className="w-full md:w-auto flex justify-center border-2 border-[#doa189] items-center bg-[#doa189] hover:bg-[#e5d9cb] text-[#b58a59] hover:text-[#392610] font-bold py-3 px-6 rounded-lg transition-colors"
                        >
                          {(isLoading || isUploading) ? (
                            <>
                              <LoadingSpinner size="small" className="mr-2" />
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}
            
            {/* Change Password Tab */}
            {activeTab === 'password' && (
              <form onSubmit={handleChangePassword} className="max-w-md mx-auto">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-gray-700 font-medium mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        id="currentPassword"
                        name="currentPassword"
                        type={showPasswords.currentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#doa189]"
                        placeholder="Enter your current password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => togglePasswordVisibility('currentPassword')}
                      >
                        {showPasswords.currentPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        id="newPassword"
                        name="newPassword"
                        type={showPasswords.newPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#doa189]"
                        placeholder="Enter new password (min. 8 characters)"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => togglePasswordVisibility('newPassword')}
                      >
                        {showPasswords.newPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPasswords.confirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#doa189]"
                        placeholder="Confirm your new password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => togglePasswordVisibility('confirmPassword')}
                      >
                        {showPasswords.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex justify-center items-center bg-[#doa189] hover:bg-[#e5d9cb] border-y-2 text-[#b58a59] hover:text-[#392610] font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner size="small" className="mr-2" />
                          Changing Password...
                        </>
                      ) : (
                        'Change Password'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
