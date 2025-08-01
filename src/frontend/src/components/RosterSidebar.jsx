import React, { useState } from 'react';
import { X, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import MyRoster from './MyRoster';
import clsx from 'clsx';

const RosterSidebar = ({ 
  isOpen, 
  onToggle, 
  leagueId, 
  draftId, 
  username, 
  lastUpdated,
  data // Add draft data prop
}) => {
  console.log('RosterSidebar: Received leagueId:', leagueId);
  
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        "fixed left-0 top-0 h-full bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out z-50",
        "w-80 xl:w-96",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Roster</h2>
          </div>
          <button
            onClick={onToggle}
            className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Close roster"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="h-full overflow-y-auto pb-16">
          {leagueId && username ? (
            <MyRoster 
              leagueId={leagueId}
              draftId={draftId}
              username={username}
              lastUpdated={lastUpdated}
              isVisible={isOpen}
              isSidebar={true}
              data={data}
            />
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>No league selected</p>
            </div>
          )}
        </div>
      </div>

      {/* Toggle button when closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className={clsx(
            "fixed left-0 top-1/2 transform -translate-y-1/2 z-40",
            "bg-white dark:bg-gray-800 shadow-lg rounded-r-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
            "border border-l-0 border-gray-200 dark:border-gray-700"
          )}
          title="Show roster"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      )}
    </>
  );
};

export default RosterSidebar;
