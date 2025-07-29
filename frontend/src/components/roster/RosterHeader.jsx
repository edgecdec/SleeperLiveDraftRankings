import React from 'react';
import clsx from 'clsx';
import { Users, User } from 'lucide-react';

const RosterHeader = ({ 
  username, 
  totalPlayers, 
  totalSlots, 
  draftedThisDraft, 
  isSidebar = false 
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <Users className="w-5 h-5 text-blue-600" />
        <h3 className={clsx("font-semibold text-gray-900 dark:text-white", isSidebar ? "text-base" : "text-lg")}>
          My Roster
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          ({totalPlayers}/{totalSlots} filled)
        </span>
        {draftedThisDraft > 0 && (
          <span className="text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
            +{draftedThisDraft} drafted
          </span>
        )}
      </div>
      {!isSidebar && (
        <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300">
          <User className="w-4 h-4" />
          <span>{username}</span>
        </div>
      )}
    </div>
  );
};

export default RosterHeader;
