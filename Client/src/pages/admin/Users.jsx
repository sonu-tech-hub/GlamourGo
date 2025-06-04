// client/src/pages/admin/Users.jsx
import React, { useState, useEffect } from 'react';
import { FaUser, FaSearch, FaFilter, FaBan, FaCheck, FaUserCog } from 'react-icons/fa';
import toast from 'react-hot-toast';

import { getAllUsers, updateUserStatus } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
// console.log("users",users);
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, userTypeFilter, statusFilter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await getAllUsers();
      const userList = Array.isArray(response?.data?.users) ? response.data.users : [];
      setUsers(userList);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (userTypeFilter !== 'all') {
      filtered = filtered.filter(user => user.userType === userTypeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.phone?.includes(query)
      );
    }

    setFilteredUsers(filtered);
  };

  const openModal = (user, action) => {
    setSelectedUser(user);
    setModalAction(action);
    setShowModal(true);
  };

  const handleUserAction = async () => {
    if (!selectedUser) return;
    setIsProcessing(true);

    try {
      if (modalAction === 'suspend' || modalAction === 'activate') {
        const newStatus = modalAction === 'suspend' ? 'suspended' : 'active';
        await updateUserStatus(selectedUser._id, newStatus);
        setUsers(prev =>
          prev.map(user =>
            user._id === selectedUser._id ? { ...user, status: newStatus } : user
          )
        );
        toast.success(`User ${modalAction === 'suspend' ? 'suspended' : 'activated'} successfully`);
      } else if (modalAction === 'makeAdmin') {
        setUsers(prev =>
          prev.map(user =>
            user._id === selectedUser._id ? { ...user, userType: 'admin' } : user
          )
        );
        toast.success(`${selectedUser.name || 'User'} is now an admin`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setIsProcessing(false);
      setShowModal(false);
    }
  };

  const getModalContent = () => {
    const name = selectedUser?.name || 'this user';
    switch (modalAction) {
      case 'suspend':
        return {
          title: 'Suspend User',
          message: `Are you sure you want to suspend ${name}? They will not be able to access their account.`,
          confirmButtonText: 'Suspend',
          confirmButtonColor: 'red',
        };
      case 'activate':
        return {
          title: 'Activate User',
          message: `Are you sure you want to activate ${name}? This will restore access to their account.`,
          confirmButtonText: 'Activate',
          confirmButtonColor: 'green',
        };
      case 'makeAdmin':
        return {
          title: 'Make Admin',
          message: `Are you sure you want to make ${name} an admin? This grants full administrative access.`,
          confirmButtonText: 'Make Admin',
          confirmButtonColor: 'blue',
        };
      default:
        return {
          title: 'Confirm Action',
          message: 'Are you sure you want to proceed?',
          confirmButtonText: 'Confirm',
          confirmButtonColor: 'blue',
        };
    }
  };

  return (
    <div className="bg-[#fef4ea] min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-[#a38772]">Manage Users</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
              />
            </div>

            <div className="flex items-center">
              <FaUser className="text-gray-400 mr-2" />
              <select
                value={userTypeFilter}
                onChange={(e) => setUserTypeFilter(e.target.value)}
                className="pl-2 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
              >
                <option value="all">All Types</option>
                <option value="customer">Customers</option>
                <option value="vendor">Vendors</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            <div className="flex items-center">
              <FaFilter className="text-gray-400 mr-2" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-2 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d0a189]"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <LoadingSpinner />
              <p className="text-gray-500 mt-4">Loading users...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined On</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-[#d0a189] flex items-center justify-center text-white">
                            {user.profilePicture ? (
                              <img src={user.profilePicture} alt={user.name || 'User'} className="h-10 w-10 object-cover" />
                            ) : (
                              (user.name?.charAt(0)?.toUpperCase() || '?')
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name || 'Unnamed'}</div>
                            <div className="text-sm text-gray-500">ID: {user._id?.substring(0, 8)}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email || '-'}</div>
                        <div className="text-sm text-gray-500">{user.phone || '-'}</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
                          user.userType === 'customer' ? 'bg-blue-100 text-blue-800' :
                          user.userType === 'vendor' ? 'bg-purple-100 text-purple-800' :
                          user.userType === 'admin' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.userType ? user.userType.charAt(0).toUpperCase() + user.userType.slice(1) : 'Unknown'}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' :
                          user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Unknown'}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {user.status === 'active' ? (
                          <button
                            onClick={() => openModal(user, 'suspend')}
                            className="text-red-600 hover:text-red-900 mr-3"
                            title="Suspend User"
                          >
                            <FaBan />
                          </button>
                        ) : (
                          <button
                            onClick={() => openModal(user, 'activate')}
                            className="text-green-600 hover:text-green-900 mr-3"
                            title="Activate User"
                          >
                            <FaCheck />
                          </button>
                        )}
                        {user.userType !== 'admin' && (
                          <button
                            onClick={() => openModal(user, 'makeAdmin')}
                            className="text-blue-600 hover:text-blue-900"
                            title="Make Admin"
                          >
                            <FaUserCog />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FaUser className="text-gray-300 text-5xl mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-1">No Users Found</h3>
              <p className="text-gray-500">
                {searchQuery || userTypeFilter !== 'all' || statusFilter !== 'all'
                  ? 'No users match your search criteria. Try adjusting your filters.'
                  : 'There are no users registered in the system yet.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedUser && (
        <ConfirmationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={handleUserAction}
          title={getModalContent().title}
          message={getModalContent().message}
          confirmButtonText={getModalContent().confirmButtonText}
          confirmButtonColor={getModalContent().confirmButtonColor}
          isLoading={isProcessing}
        />
      )}
    </div>
  );
};

export default Users;
