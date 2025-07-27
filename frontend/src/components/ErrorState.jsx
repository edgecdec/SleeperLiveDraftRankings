import React from 'react';
import { AlertCircle } from 'lucide-react';
import DraftHeader from './DraftHeader';

const ErrorState = ({ 
  error, 
  onRetry, 
  currentDraft, 
  userLeagues, 
  onDraftChange, 
  onBackToSetup, 
  username 
}) => {
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
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Connection Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={onRetry}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
