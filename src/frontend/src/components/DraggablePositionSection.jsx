import React, { useState } from 'react';
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import PlayerCard from './PlayerCard';
import clsx from 'clsx';
import { calculateMinTiersByPosition, isPlayerTopTier } from '../utils/tierUtils';

const DraggablePositionSection = ({ 
  title, 
  players, 
  icon: Icon, 
  color,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isDragging,
  dragIndex,
  index,
  allPositions = {} // Add this to get all positions data for tier calculation
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Calculate minimum tiers for top-tier highlighting
  const minTiers = calculateMinTiersByPosition(allPositions);

  const getColorClasses = (color) => {
    const colorMap = {
      red: 'border-red-300 bg-red-50',
      green: 'border-green-300 bg-green-50',
      blue: 'border-blue-300 bg-blue-50',
      yellow: 'border-yellow-300 bg-yellow-50',
      purple: 'border-purple-300 bg-purple-50',
      gray: 'border-gray-300 bg-gray-50'
    };
    return colorMap[color] || 'border-gray-300 bg-gray-50';
  };

  const getHeaderColorClasses = (color) => {
    const colorMap = {
      red: 'bg-red-100/50 border-red-200',
      green: 'bg-green-100/50 border-green-200',
      blue: 'bg-blue-100/50 border-blue-200',
      yellow: 'bg-yellow-100/50 border-yellow-200',
      purple: 'bg-purple-100/50 border-purple-200',
      gray: 'bg-gray-100/50 border-gray-200'
    };
    return colorMap[color] || 'bg-gray-100/50 border-gray-200';
  };

  const getIconColor = (color) => {
    const colorMap = {
      red: 'text-red-600',
      green: 'text-green-600',
      blue: 'text-blue-600',
      yellow: 'text-yellow-600',
      purple: 'text-purple-600',
      gray: 'text-gray-600'
    };
    return colorMap[color] || 'text-gray-600';
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      className={clsx(
        'rounded-lg shadow-sm border-2 transition-all duration-200',
        getColorClasses(color),
        isDragging && dragIndex === index ? 'opacity-50 scale-95' : 'hover:shadow-md',
        'cursor-move'
      )}
    >
      {/* Header */}
      <div className={clsx("p-3 border-b", getHeaderColorClasses(color))}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GripVertical className="w-4 h-4 text-gray-400" />
            <Icon className={clsx('w-4 h-4', getIconColor(color))} />
            <div>
              <h3 className="text-base font-semibold text-gray-900">{title}</h3>
              <p className="text-xs text-gray-600">
                {players.length} player{players.length !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-md hover:bg-white/50 transition-colors"
            title={isCollapsed ? 'Expand section' : 'Collapse section'}
          >
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-3">
          {players.length > 0 ? (
            <div className="space-y-2">
              {players.map((player, playerIndex) => (
                <div key={`${player.name}-${player.position}`} className="animate-slide-up">
                  <PlayerCard 
                    player={player} 
                    rank={playerIndex + 1}
                    isTopTier={isPlayerTopTier(player, minTiers)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Icon className={clsx('w-6 h-6 mx-auto mb-2', getIconColor(color))} />
              <p className="text-sm">No players available</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DraggablePositionSection;
