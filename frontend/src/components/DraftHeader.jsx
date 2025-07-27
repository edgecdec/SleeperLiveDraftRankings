import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock, Users, Trophy, Settings, Zap, User, TrendingUp } from 'lucide-react';
import clsx from 'clsx';
import LeagueSelector from './LeagueSelector';
import RankingsManager from './RankingsManager';
import SettingsModal from './SettingsModal';

const DraftHeader = ({ 
  data, 
  lastUpdated, 
  onRefresh, 
  loading, 
  refreshing,
  currentDraft, 
  leagues, 
  onDraftChange, 
  onBackToSetup,
  username 
}) => {
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(30);
  const [showRankingsManager, setShowRankingsManager] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Countdown timer for next auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastUpdated) {
        const secondsSinceUpdate = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
        const remaining = Math.max(0, 30 - secondsSinceUpdate);
        setTimeUntilRefresh(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  const formatTime = (date) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString();
  };

  const getDraftStatusColor = (status) => {
    switch (status) {
      case 'complete': return 'text-green-600';
      case 'drafting': return 'text-blue-600';
      case 'pre_draft': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getDraftStatusIcon = (status) => {
    switch (status) {
      case 'complete': return '✅';
      case 'drafting': return '🔴';
      case 'pre_draft': return '⏳';
      default: return '❓';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Title and current draft info */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Trophy className="w-8 h-8 text-primary-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Fantasy Draft Assistant</h1>
            </div>
            
            {/* Current Draft Info */}
            {currentDraft && (
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-300">@{username}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getDraftStatusIcon(currentDraft.status)}</span>
                  <span className={`font-medium ${getDraftStatusColor(currentDraft.status)}`}>
                    {currentDraft.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            )}
            
            {/* Live Stats */}
            {data && (
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{data.total_available} available</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Zap className="w-4 h-4" />
                  <span>{data.total_drafted} drafted</span>
                </div>
                {data.is_dynasty_keeper && (
                  <div className="flex items-center space-x-1">
                    <Trophy className="w-4 h-4 text-purple-600" />
                    <span className="text-purple-600 font-medium">
                      {data.total_rostered} rostered
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right side - Controls and league selector */}
          <div className="flex items-center space-x-4">
            {/* League Selector */}
            {currentDraft && leagues && (
              <LeagueSelector
                currentDraft={currentDraft}
                leagues={leagues}
                onDraftChange={onDraftChange}
                onBackToSetup={onBackToSetup}
              />
            )}

            {/* Auto-refresh countdown */}
            {currentDraft && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <Clock className="w-4 h-4" />
                <span>Next update: {timeUntilRefresh}s</span>
              </div>
            )}

            {/* Last updated */}
            {lastUpdated && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Updated: {formatTime(lastUpdated)}
              </div>
            )}

            {/* Refresh button */}
            {currentDraft && (
              <button
                onClick={onRefresh}
                disabled={loading || refreshing}
                className={clsx(
                  'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                  (loading || refreshing)
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                )}
              >
                <RefreshCw className={clsx('w-4 h-4', (loading || refreshing) && 'animate-spin')} />
                <span>
                  {loading ? 'Loading...' : refreshing ? 'Refreshing...' : 'Refresh'}
                </span>
              </button>
            )}

            {/* Rankings Manager button */}
            <button 
              onClick={() => setShowRankingsManager(true)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200"
              title="Manage Rankings"
            >
              <TrendingUp className="w-5 h-5" />
            </button>

            {/* Settings button */}
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Rankings Manager Modal */}
        <RankingsManager
          isOpen={showRankingsManager}
          onClose={() => setShowRankingsManager(false)}
          currentDraft={currentDraft}
        />

        {/* Settings Modal */}
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </div>
    </div>
  );
};

export default DraftHeader;
