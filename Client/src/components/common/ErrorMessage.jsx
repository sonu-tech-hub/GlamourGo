// client/src/components/common/ErrorMessage.jsx
import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const ErrorMessage = ({ message = 'Something went wrong. Please try again later.' }) => {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
      <FaExclamationTriangle className="mt-1 mr-3 flex-shrink-0" />
      <p>{message}</p>
    </div>
  );
};

export default ErrorMessage;
