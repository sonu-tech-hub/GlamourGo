// client/src/components/common/EmptyState.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon,
  title,
  message,
  actionText,
  actionLink,
  onActionClick
}) => {
  return (
    <div className="text-center p-8 bg-white rounded-lg shadow-sm">
      <div className="flex justify-center mb-4 text-gray-400">
        {icon}
      </div>
      
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-6">
        {message}
      </p>
      
      {actionText && (actionLink || onActionClick) && (
        actionLink ? (
          <Link
            to={actionLink}
            className="inline-block bg-[#doa189] hover:bg-[#ecdfcf] text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            {actionText}
          </Link>
        ) : (
          <button
            onClick={onActionClick}
            className="bg-[#doa189] hover:bg-[#ecdfcf] text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            {actionText}
          </button>
        )
      )}
    </div>
  );
};

export default EmptyState;