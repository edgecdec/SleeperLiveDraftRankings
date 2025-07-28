import React from 'react';
import { Upload, Trash2 } from 'lucide-react';
import clsx from 'clsx';

/**
 * Component for displaying and managing custom uploaded rankings
 */
const CustomRankingsList = ({
  customRankings,
  selectedRankingType,
  selectedCustomId,
  currentFormat,
  onSelectRankings,
  onDeleteRankings
}) => {
  if (!customRankings || customRankings.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <Upload className="w-5 h-5 mr-2 text-purple-500 dark:text-purple-400" />
        Your Custom Rankings
      </h3>
      <div className="space-y-3">
        {customRankings.map((ranking) => {
          const isSelected = selectedRankingType === 'custom' && selectedCustomId === ranking.id;
          const isCurrentFormat = currentFormat && currentFormat.source === 'custom' && currentFormat.rankings_filename === ranking.filename;
          
          return (
            <div
              key={ranking.id}
              className={clsx(
                'border rounded-lg p-4 transition-all relative cursor-pointer',
                isSelected
                  ? 'border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/30 ring-2 ring-purple-200 dark:ring-purple-400/50'
                  : isCurrentFormat
                  ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/30 ring-2 ring-green-200 dark:ring-green-400/50'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
              )}
              onClick={() => onSelectRankings('custom', ranking.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {ranking.display_name || ranking.name}
                      {isCurrentFormat && (
                        <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-medium">
                          (Active)
                        </span>
                      )}
                    </h4>
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                      Custom
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {ranking.description || 'Custom uploaded rankings'}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{ranking.player_count || 'Unknown'} players</span>
                    <span>Uploaded: {ranking.upload_time ? new Date(ranking.upload_time).toLocaleDateString() : 'Unknown'}</span>
                    {ranking.scoring_format && ranking.league_type && (
                      <span>{ranking.scoring_format} • {ranking.league_type}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRankings(ranking.id);
                    }}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Delete custom rankings"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomRankingsList;