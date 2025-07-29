import React from 'react';
import { Users } from 'lucide-react';

const RosterErrorState = ({ error }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Users className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Roster</h3>
      </div>
      <div className="text-red-600 dark:text-red-400 text-center py-4">
        Error: {error}
      </div>
    </div>
  );
};

export default RosterErrorState;
