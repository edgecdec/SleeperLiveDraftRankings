import React from 'react';
import { Clock, Shield, Cross } from 'lucide-react';

const RosterLegend = ({ rosterSettings }) => {
  if (!rosterSettings) return null;

  return (
    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400">
        <div>
          <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">Roster Structure</div>
          <div className="space-y-1">
            {Object.entries(rosterSettings.starter_counts).map(([position, count]) => (
              <div key={position} className="flex justify-between">
                <span>{position}:</span>
                <span>{count}</span>
              </div>
            ))}
            <div className="flex justify-between">
              <span>Bench:</span>
              <span>{rosterSettings.bench_slots || 0}</span>
            </div>
            {rosterSettings.taxi_slots > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Shield className="w-3 h-3 text-blue-500" />
                  <span>Taxi:</span>
                </div>
                <span>{rosterSettings.taxi_slots}</span>
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">Status Legend</div>
          <div className="space-y-1">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-green-500" />
              <span>Drafted today</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3 text-blue-500" />
              <span>Taxi squad</span>
            </div>
            <div className="flex items-center space-x-1">
              <Cross className="w-3 h-3 text-red-500" />
              <span>Injured Reserve</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-sm"></div>
              <span>Empty slot</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RosterLegend;
