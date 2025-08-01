import React from 'react';
import clsx from 'clsx';
import { getStatusIcon, getStatusColor, getPositionColor } from '../../utils/rosterUtils';

const RosterPlayer = ({ player, isStarter = false, starterTypeDisplay, starterTypeColor }) => {
  return (
    <div
      className={clsx(
        "px-3 py-2 flex items-center justify-between",
        isStarter && "border-l-4 border-green-400",
        getStatusColor(player.status)
      )}
    >
      <div className="flex items-center space-x-2">
        {isStarter && starterTypeDisplay && (
          <span className={clsx(
            "text-xs font-medium px-2 py-1 rounded uppercase tracking-wide",
            starterTypeColor
          )}>
            {starterTypeDisplay}
          </span>
        )}
        
        {!isStarter && (
          <span className={clsx(
            "text-xs font-medium px-2 py-1 rounded uppercase tracking-wide bg-gray-100 dark:bg-gray-700",
            getPositionColor(player.originalPosition)
          )}>
            {player.originalPosition}
          </span>
        )}
        
        {getStatusIcon(player.status)}
        
        <span className={clsx("font-medium", getPositionColor(player.originalPosition))}>
          {player.name}
        </span>
        
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {player.team !== 'FA' ? player.team : 'Free Agent'}
        </span>
        
        {player.rank && player.rank !== 999 && (
          <span className={clsx(
            "text-xs px-1 rounded",
            isStarter 
              ? "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30"
              : "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30"
          )}>
            #{player.rank}
          </span>
        )}
        
        {player.pick_no && (
          <span className="text-xs text-green-600 dark:text-green-400">
            Pick #{player.pick_no}
          </span>
        )}
      </div>
    </div>
  );
};

export default RosterPlayer;
