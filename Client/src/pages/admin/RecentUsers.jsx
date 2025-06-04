// client/src/components/admin/RecentUsers.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import { format } from 'date-fns';

import LoadingSpinner from '../../components/common/LoadingSpinner';

const RecentUsers = ({ users, isLoading }) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!users || users.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">No users found.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div key={user._id} className="flex items-center bg-white p-3 rounded-lg hover:bg-gray-50">
          <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-[#d0a189] flex items-center justify-center text-white">
            {user.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt={user.name} 
                className="h-10 w-10 object-cover"
              />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="ml-3 flex-grow">
            <div className="text-sm font-medium text-gray-900">{user.name}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-500">
              {format(new Date(user.createdAt), 'MMM d, yyyy')}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              user.userType === 'customer' ? 'bg-blue-100 text-blue-800' :
              user.userType === 'vendor' ? 'bg-purple-100 text-purple-800' :
              'bg-green-100 text-green-800'
            } mt-1`}>
              {user.userType}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentUsers;
