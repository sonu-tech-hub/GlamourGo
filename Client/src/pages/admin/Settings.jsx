// client/src/pages/admin/Settings.jsx
import React, { useState } from 'react';
import { FaSave, FaCog, FaBell, FaLock, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Settings = () => {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Beauty & Wellness',
    siteDescription: 'Beauty, wellness, and fitness services booking platform',
    supportEmail: 'support@beautyandwellness.com',
    contactPhone: '+91 1234567890',
    currency: 'INR'
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false,
    adminAlerts: true
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    passwordExpiry: 90,
    sessionTimeout: 30
  });
  
  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleToggle = (settingsType, name) => {
    if (settingsType === 'notification') {
      setNotificationSettings(prev => ({
        ...prev,
        [name]: !prev[name]
      }));
    } else if (settingsType === 'security') {
      setSecuritySettings(prev => ({
        ...prev,
        [name]: !prev[name]
      }));
    }
  };
  
  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecuritySettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const saveSettings = (settingsType) => {
    // In a real implementation, save settings to backend
    toast.success(`${settingsType} settings saved successfully`);
  };
  
  return (
    <div className="bg-[#fef4ea] min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-[#a38772]">Admin Settings</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* General Settings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#a38772] flex items-center">
                  <FaCog className="mr-2" /> 
                  General Settings
                </h2>
                <button
                  onClick={() => saveSettings('General')}
                  className="flex items-center bg-[#d0a189] hover:bg-[#ecdfcf] text-white py-2 px-4 rounded-lg transition-colors"
                >
                  <FaSave className="mr-2" />
                  Save Changes
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    name="siteName"
                    value={generalSettings.siteName}
                    onChange={handleGeneralChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Support Email
                  </label>
                  <input
                    type="email"
                    name="supportEmail"
                    value={generalSettings.supportEmail}
                    onChange={handleGeneralChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    name="contactPhone"
                    value={generalSettings.contactPhone}
                    onChange={handleGeneralChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={generalSettings.currency}
                    onChange={handleGeneralChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
                  >
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-2">
                    Site Description
                  </label>
                  <textarea
                    name="siteDescription"
                    value={generalSettings.siteDescription}
                    onChange={handleGeneralChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
                    rows="3"
                  ></textarea>
                </div>
              </div>
            </div>
            
            {/* Notification Settings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#a38772] flex items-center">
                  <FaBell className="mr-2" /> 
                  Notification Settings
                </h2>
                <button
                  onClick={() => saveSettings('Notification')}
                  className="flex items-center bg-[#d0a189] hover:bg-[#ecdfcf] text-white py-2 px-4 rounded-lg transition-colors"
                >
                  <FaSave className="mr-2" />
                  Save Changes
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-700">Email Notifications</h3>
                    <p className="text-sm text-gray-500">Send notifications via email</p>
                  </div>
                  <button 
                    onClick={() => handleToggle('notification', 'emailNotifications')}
                    className={`text-2xl ${notificationSettings.emailNotifications ? 'text-green-500' : 'text-gray-400'}`}
                  >
                    {notificationSettings.emailNotifications ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-700">SMS Notifications</h3>
                    <p className="text-sm text-gray-500">Send notifications via SMS</p>
                  </div>
                  <button 
                    onClick={() => handleToggle('notification', 'smsNotifications')}
                    className={`text-2xl ${notificationSettings.smsNotifications ? 'text-green-500' : 'text-gray-400'}`}
                  >
                    {notificationSettings.smsNotifications ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-700">Push Notifications</h3>
                    <p className="text-sm text-gray-500">Send browser push notifications</p>
                  </div>
                  <button 
                    onClick={() => handleToggle('notification', 'pushNotifications')}
                    className={`text-2xl ${notificationSettings.pushNotifications ? 'text-green-500' : 'text-gray-400'}`}
                  >
                    {notificationSettings.pushNotifications ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-700">Admin Alerts</h3>
                    <p className="text-sm text-gray-500">Receive important system alerts</p>
                  </div>
                  <button 
                    onClick={() => handleToggle('notification', 'adminAlerts')}
                    className={`text-2xl ${notificationSettings.adminAlerts ? 'text-green-500' : 'text-gray-400'}`}
                  >
                    {notificationSettings.adminAlerts ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Security Settings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#a38772] flex items-center">
                  <FaLock className="mr-2" /> 
                  Security Settings
                </h2>
                <button
                  onClick={() => saveSettings('Security')}
                  className="flex items-center bg-[#d0a189] hover:bg-[#ecdfcf] text-white py-2 px-4 rounded-lg transition-colors"
                >
                  <FaSave className="mr-2" />
                  Save Changes
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-700">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
                  </div>
                  <button 
                    onClick={() => handleToggle('security', 'twoFactorAuth')}
                    className={`text-2xl ${securitySettings.twoFactorAuth ? 'text-green-500' : 'text-gray-400'}`}
                  >
                    {securitySettings.twoFactorAuth ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Password Expiry (days)
                  </label>
                  <input
                    type="number"
                    name="passwordExpiry"
                    value={securitySettings.passwordExpiry}
                    onChange={handleSecurityChange}
                    min="0"
                    max="365"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Set to 0 to disable password expiry
                  </p>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    name="sessionTimeout"
                    value={securitySettings.sessionTimeout}
                    onChange={handleSecurityChange}
                    min="5"
                    max="1440"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-[#a38772] mb-4">
                Settings Help
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-700 mb-2">General Settings</h3>
                  <p className="text-sm text-blue-600">
                    Configure basic information about your platform, including site name, description, and contact details.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-700 mb-2">Notification Settings</h3>
                  <p className="text-sm text-green-600">
                    Manage how notifications are sent to users and administrators across different channels.
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-medium text-purple-700 mb-2">Security Settings</h3>
                  <p className="text-sm text-purple-600">
                    Configure security options such as two-factor authentication, password policies, and session timeouts.
                  </p>
                </div>
                
                <div className="p-4 bg-[#fef4ea] rounded-lg">
                  <h3 className="font-medium text-[#a38772] mb-2">Need Help?</h3>
                  <p className="text-sm text-[#a38772]">
                    If you need assistance with configuring your system settings, please refer to the documentation or contact technical support.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Settings;
