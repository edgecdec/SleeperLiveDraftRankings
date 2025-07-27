import React from 'react';
import PlayerCard from './PlayerCard';
import { Users, TrendingUp } from 'lucide-react';

const PositionSection = ({ title, players, icon: Icon = Users, color = 'blue' }) => {
  const getColorClasses = (color) => {
    const colors = {
      red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
      green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
      blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
      yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300',
      purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
      gray: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
    };
    return colors[color] || colors.blue;
  };

  if (!players || players.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        </div>
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No players available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getColorClasses(color)}`}>
          {players.length} available
        </div>
      </div>
      
      <div className="space-y-3">
        {players.map((player, index) => (
          <div key={`${player.name}-${player.position}`} className="animate-slide-up">
            <PlayerCard 
              player={player} 
              rank={index + 1}
              showRank={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PositionSection;
