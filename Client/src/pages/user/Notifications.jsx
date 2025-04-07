// client/src/pages/user/Notifications.jsx
import React, { useState, useEffect } from 'react';
import { FaBell, FaCheck, FaTrash } from 'react-icons/fa';
import { format, formatDistance } from 'date-fns';
import toast from 'react-hot-toast';

import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  
  useEffect(() => {
    fetchNotifications();
  }, []);
  
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/users/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };
  
  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/users/notifications/${notificationId}/read`);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };
  
  const markAllAsRead = async () => {
    try {
      await api.put('/users/notifications/mark-all-read');
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };
  
  const deleteNotification = async (notificationId) => {
    setIsDeleting(true);
    try {
      await api.delete(`/users/notifications/${notificationId}`);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification._id !== notificationId)
      );
      
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };
  
  const deleteAllNotifications = async () => {
    setIsDeleting(true);
    try {
      await api.delete('/users/notifications/clear-all');
      
      // Update local state
      setNotifications([]);
      
      toast.success('All notifications cleared');
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Failed to clear notifications');
    } finally {
      setIsDeleting(false);
      setShowClearAllModal(false);
    }
  };
  
  // Open delete confirmation modal
  const openDeleteModal = (notification) => {
    setSelectedNotification(notification);
    setShowDeleteModal(true);
  };
  
  // Get unread count
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  return (
    <div className="bg-[#fef4ea] min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#a38772] mb-4 md:mb-0">
            Notifications
          </h1>
          
          {notifications.length > 0 && (
            <div className="space-x-3">
              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-white transition-colors ${
                  unreadCount === 0 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-[#doa189] hover:bg-[#ecdfcf]'
                }`}
              >
                <FaCheck className="mr-2" />
                Mark All as Read
              </button>
              
              <button
                onClick={() => setShowClearAllModal(true)}
                className="inline-flex items-center px-4 py-2 rounded-lg text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                <FaTrash className="mr-2" />
                Clear All
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="text-center py-8">
              <LoadingSpinner />
              <p className="text-gray-500 mt-3">Loading notifications...</p>
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div 
                  key={notification._id} 
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-[#fef4ea]' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                      !notification.read ? 'bg-[#doa189] text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      <FaBell />
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-1">
                        <p className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notification.message}
                        </p>
                        
                        <span className="text-sm text-gray-500">
                          {formatDistance(new Date(notification.createdAt), new Date(), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        {format(new Date(notification.createdAt), 'MMMM d, yyyy • h:mm a')}
                      </div>
                      
                      <div className="mt-2 flex">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="text-sm text-[#doa189] hover:underline mr-4"
                          >
                            Mark as read
                          </button>
                        )}
                        
                        <button
                          onClick={() => openDeleteModal(notification)}
                          className="text-sm text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="flex items-center justify-center">
                <FaBell className="text-gray-300 text-5xl mb-3" />
              </div>
              <h3 className="text-lg font-medium text-gray-500 mb-1">No Notifications</h3>
              <p className="text-gray-500">
                You don't have any notifications at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Notification Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => deleteNotification(selectedNotification?._id)}
        title="Delete Notification"
        message="Are you sure you want to delete this notification? This action cannot be undone."
        confirmButtonText="Delete"
        confirmButtonColor="red"
        isLoading={isDeleting}
      />
      
      {/* Clear All Notifications Modal */}
      <ConfirmationModal
        isOpen={showClearAllModal}
        onClose={() => setShowClearAllModal(false)}
        onConfirm={deleteAllNotifications}
        title="Clear All Notifications"
        message="Are you sure you want to clear all notifications? This action cannot be undone."
        confirmButtonText="Clear All"
        confirmButtonColor="red"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Notifications;
