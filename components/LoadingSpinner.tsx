
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-4">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-t-2 border-blue-400"></div>
    </div>
  );
};
