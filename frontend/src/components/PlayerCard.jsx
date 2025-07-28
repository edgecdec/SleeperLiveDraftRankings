import React from 'react';
import { User, Trophy, Target, Hash } from 'lucide-react';
import clsx from 'clsx';
import { getPositionBadgeClass, getPositionBorderClass } from '../constants/positions';
import { useSettings } from '../contexts/SettingsContext';

const PlayerCard = ({ player, rank, showRank = true, isTopTier = false }) => {
  // Use try-catch to handle cases where SettingsContext might not be available
  let rainbowEffectsEnabled = true; // Default to enabled
  try {
    const settings = useSettings();
    rainbowEffectsEnabled = settings.rainbowEffectsEnabled;
  } catch (e) {
    // Fallback if context is not available
    console.warn('Settings context not available, using default rainbow effects setting');
  }
  const getTierClass = (tier) => {
    return `tier-${tier}`;
  };

  return (
    <div className={clsx(
      'bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 hover:shadow-md transition-all duration-200 p-3',
      getPositionBorderClass(player.position),
      getTierClass(player.tier),
      isTopTier && rainbowEffectsEnabled && 'top-tier-player'
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {player.name}
              </h3>
              <span className={clsx('position-badge', getPositionBadgeClass(player.position))}>
                {player.position}
              </span>
            </div>
            
            <div className="flex items-center space-x-1 mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">{player.team}</span>
              {player.tier && (
                <div className="flex items-center space-x-1">
                  <Trophy className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Tier {player.tier}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {showRank && (
          <div className="flex-shrink-0">
            <div className="flex flex-col items-end space-y-1">
              {/* Target number (position among remaining players) */}
              <div className="flex items-center space-x-1" title="Target rank - position among remaining players">
                <Target className="w-3 h-3 text-blue-500" />
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">#{player.target_rank || rank}</span>
              </div>
              
              {/* Overall rank from original rankings */}
              {player.rank && player.rank !== 999 && (
                <div className="flex items-center space-x-1" title="Overall rank from your original rankings">
                  <Hash className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">#{player.rank}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;
