import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

const ConnectionStatus = ({ error, onRetry }) => {
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500 p-4">
        <div className="flex items-center">
          <WifiOff className="w-5 h-5 text-red-400 dark:text-red-500 mr-2" />
          <p className="text-sm text-red-700 dark:text-red-300">
            Connection issues detected. Data may be outdated. 
            <button 
              onClick={onRetry}
              className="ml-2 underline hover:no-underline text-red-700 dark:text-red-300"
            >
              Retry
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 dark:border-green-500 p-2">
      <div className="flex items-center">
        <Wifi className="w-4 h-4 text-green-400 dark:text-green-500 mr-2" />
        <p className="text-xs text-green-700 dark:text-green-300">Live updates active</p>
      </div>
    </div>
  );
};

export default ConnectionStatus;
