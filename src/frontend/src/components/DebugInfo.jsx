import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Bug, X } from 'lucide-react';

const DebugInfo = ({ leagues, currentDraft, username }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white rounded-lg shadow-lg max-w-md text-xs z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-600">
        <div className="flex items-center space-x-2">
          <Bug className="w-4 h-4 text-orange-400" />
          <h3 className="font-bold text-sm">Debug Info</h3>
        </div>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="p-1 hover:bg-gray-700 rounded transition-colors duration-200"
          title={isMinimized ? 'Expand' : 'Minimize'}
        >
          {isMinimized ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="p-3 space-y-2">
          <div>
            <strong>Username:</strong> {username || 'None'}
          </div>
          <div>
            <strong>Current Draft:</strong> {currentDraft?.draftId || 'None'}
          </div>
          <div>
            <strong>League Name:</strong> {currentDraft?.leagueName || 'None'}
          </div>
          <div>
            <strong>League ID:</strong> {currentDraft?.leagueId || 'None'}
          </div>
          <div>
            <strong>Draft Status:</strong> {currentDraft?.status || 'None'}
          </div>
          <div>
            <strong>Draft Type:</strong> {currentDraft?.draftType || 'None'}
          </div>
          <div>
            <strong>Leagues Count:</strong> {leagues?.length || 0}
          </div>
          {leagues && leagues.length > 0 && (
            <div>
              <strong>Leagues:</strong>
              <ul className="ml-2 mt-1 max-h-32 overflow-y-auto">
                {leagues.map((league, i) => (
                  <li key={league.league_id} className="py-0.5">
                    {i + 1}. {league.name} ({league.drafts?.length || 0} drafts)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DebugInfo;
