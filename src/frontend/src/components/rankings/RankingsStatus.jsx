import React from 'react';
import { TrendingUp, RefreshCw, Clock, Users, CheckCircle, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

/**
 * Component for displaying current rankings status and update controls
 */
const RankingsStatus = ({
  rankingsStatus,
  currentRankings,
  updateInProgress,
  onUpdateRankings
}) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'updating':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
          Current Rankings Status
        </h3>
        <button
          onClick={onUpdateRankings}
          disabled={updateInProgress}
          className={clsx(
            'flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors',
            updateInProgress
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
          )}
        >
          <RefreshCw className={clsx('w-4 h-4', updateInProgress && 'animate-spin')} />
          <span>{updateInProgress ? 'Updating...' : 'Update Rankings'}</span>
        </button>
      </div>

      {rankingsStatus && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Rankings Status</span>
              {getStatusIcon(rankingsStatus.update_in_progress ? 'updating' : 
                           rankingsStatus.needs_update ? 'error' : 'success')}
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
              {rankingsStatus.needs_update ? 'Needs Update' : 'Current'}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Last Updated</span>
              <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
              {rankingsStatus.last_update_time ? 
                new Date(rankingsStatus.last_update_time).toLocaleString() : 
                'Never'
              }
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Players</span>
              <Users className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
              {currentRankings?.length || 0}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RankingsStatus;