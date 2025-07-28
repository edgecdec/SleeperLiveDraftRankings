import React from 'react';
import { Star, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

/**
 * Component for displaying and selecting FantasyPros rankings
 */
const FantasyProsRankings = ({
  availableFormats,
  currentFormat,
  selectedRankingType,
  selectedFormatKey,
  onSelectRankings,
  onEnableAutoDetection,
  getFormatDisplayName
}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <Star className="w-5 h-5 mr-2 text-yellow-500 dark:text-yellow-400" />
        FantasyPros Rankings
        {currentFormat && (
          <span className="ml-3 text-sm font-normal text-gray-600 dark:text-gray-300">
            Current: {getFormatDisplayName(currentFormat.scoring_format, currentFormat.league_type)}
            {currentFormat.is_manual ? (
              <span className="ml-1 text-blue-600 dark:text-blue-400">(Manual)</span>
            ) : (
              <span className="ml-1 text-green-600 dark:text-green-400">(Auto-detected)</span>
            )}
          </span>
        )}
      </h3>
      
      {availableFormats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(availableFormats).map(([scoring, formats]) => (
            Object.entries(formats).map(([formatType, formatInfo]) => {
              const formatKey = `${scoring}_${formatType}`;
              const isSelected = selectedRankingType === 'fantasypros' && selectedFormatKey === formatKey;
              const isCurrentFormat = currentFormat && currentFormat.format_key === formatKey;
              
              return (
                <div
                  key={formatKey}
                  className={clsx(
                    'border rounded-lg p-4 cursor-pointer transition-all relative',
                    isSelected
                      ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-200 dark:ring-blue-400/50'
                      : isCurrentFormat
                      ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/30 ring-2 ring-green-200 dark:ring-green-400/50'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700',
                    !formatInfo.exists && 'opacity-60'
                  )}
                  onClick={() => onSelectRankings('fantasypros', formatKey)}
                >
                  {isCurrentFormat && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {getFormatDisplayName(scoring, formatType)}
                        {isCurrentFormat && (
                          <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-medium">
                            {currentFormat.is_manual ? '(Active - Manual)' : '(Active - Auto)'}
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {formatInfo.filename}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={clsx(
                          'text-xs px-2 py-1 rounded-full',
                          formatInfo.exists 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        )}>
                          {formatInfo.exists ? 'Available' : 'Not Downloaded'}
                        </span>
                        {(formatInfo.timestamp || formatInfo.last_modified) && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Updated: {formatInfo.timestamp ? 
                              new Date(formatInfo.timestamp).toLocaleString() : 
                              formatInfo.last_modified
                            }
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                </div>
              );
            })
          ))}
        </div>
      )}
      
      {/* Auto-detection toggle */}
      {currentFormat && currentFormat.is_manual && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Manual ranking selection is active. 
                <span className="font-medium"> Current: {getFormatDisplayName(currentFormat.scoring_format, currentFormat.league_type)}</span>
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                Switch back to automatic detection based on league settings?
              </p>
            </div>
            <button
              onClick={onEnableAutoDetection}
              className="px-3 py-1 text-xs bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              Enable Auto
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FantasyProsRankings;