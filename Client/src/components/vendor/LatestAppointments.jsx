// client/src/components/vendor/LatestAppointments.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaCalendarAlt, FaClock, FaTag } from 'react-icons/fa';
import { format } from 'date-fns';

import { getStatusColor } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';

const LatestAppointments = ({ appointments, isLoading }) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!appointments || appointments.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">No appointments found.</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Service
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date & Time
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {appointments.map((appointment) => (
            <tr key={appointment._id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#doa189] flex items-center justify-center text-white">
                    {appointment.user.name?.charAt(0) || <FaUser />}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      {appointment.user.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {appointment.user.phone}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {appointment.service.name}
                </div>
                <div className="text-xs text-gray-500">
                  ₹{appointment.service.price}
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {format(new Date(appointment.date), 'MMM d, yyyy')}
                </div>
                <div className="text-xs text-gray-500">
                  {appointment.startTime} - {appointment.endTime}
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                <Link
                  to={`/vendor/appointments/${appointment._id}`}
                  className="text-[#doa189] hover:text-[#ecdfcf]"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LatestAppointments;
