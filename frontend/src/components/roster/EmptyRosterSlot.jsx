import React from 'react';
import clsx from 'clsx';

const EmptyRosterSlot = ({ slotType, slotDisplay, isStarter = false, isLast = false }) => {
  return (
    <div
      className={clsx(
        "px-3 py-2 flex items-center justify-between",
        isStarter 
          ? "border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50"
          : "bg-gray-100 dark:bg-gray-700/50",
        !isLast && "border-b border-gray-200 dark:border-gray-700"
      )}
    >
      <div className="flex items-center space-x-2">
        <span className="text-xs font-medium px-2 py-1 rounded uppercase tracking-wide bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
          {slotDisplay}
        </span>
        <span className="text-gray-500 dark:text-gray-400 italic">
          {isStarter ? "Empty - Need to draft" : "Empty bench slot"}
        </span>
      </div>
    </div>
  );
};

export default EmptyRosterSlot;
