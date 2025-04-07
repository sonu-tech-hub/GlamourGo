// client/src/components/common/ConfirmationModal.jsx
import React from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action?',
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  confirmButtonColor = 'red',
  isLoading = false
}) => {
  if (!isOpen) return null;
  
  // Calculate button color class
  const buttonColorClass = 
    confirmButtonColor === 'red' ? 'bg-red-600 hover:bg-red-700' : 
    confirmButtonColor === 'green' ? 'bg-green-600 hover:bg-green-700' : 
    `bg-[#doa189] hover:bg-[#ecdfcf]`;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <FaExclamationTriangle className="text-yellow-500 mr-2" />
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700">{message}</p>
        </div>
        
        <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 mr-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            disabled={isLoading}
          >
            {cancelButtonText}
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-6 py-2 text-white rounded-lg transition-colors ${buttonColorClass} flex items-center`}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="small" className="mr-2" />
                Processing...
              </>
            ) : (
              confirmButtonText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;