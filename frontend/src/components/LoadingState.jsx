import React from 'react';
import DraftHeader from './DraftHeader';

const LoadingState = ({ currentDraft, userLeagues, onDraftChange, onBackToSetup, username }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DraftHeader 
        currentDraft={currentDraft}
        leagues={userLeagues}
        onDraftChange={onDraftChange}
        onBackToSetup={onBackToSetup}
        username={username}
      />
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Loading Draft Data</h2>
          <p className="text-gray-600 dark:text-gray-300">Fetching the latest player rankings for {currentDraft.leagueName}...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
