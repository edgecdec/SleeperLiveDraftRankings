import React from 'react';
import clsx from 'clsx';
import { Users } from 'lucide-react';

const RosterEmptyState = ({ isSidebar = false }) => {
  return (
    <div className={clsx(
      "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700",
      isSidebar ? "p-3" : "p-4"
    )}>
      <div className="flex items-center space-x-2 mb-4">
        <Users className="w-5 h-5 text-blue-600" />
        <h3 className={clsx("font-semibold text-gray-900 dark:text-white", isSidebar ? "text-base" : "text-lg")}>
          My Roster
        </h3>
      </div>
      <div className="text-center py-8">
        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Roster Not Available</h4>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Roster information is not available for this league.
        </p>
      </div>
    </div>
  );
};

export default RosterEmptyState;
