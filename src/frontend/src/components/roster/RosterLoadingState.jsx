import React from 'react';
import { Users } from 'lucide-react';

const RosterLoadingState = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Users className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Roster</h3>
      </div>
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-300">Loading roster...</span>
      </div>
    </div>
  );
};

export default RosterLoadingState;
