import React from 'react';

const DebugInfo = ({ leagues, currentDraft, username }) => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg max-w-md text-xs">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="space-y-2">
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
          <strong>Leagues Count:</strong> {leagues?.length || 0}
        </div>
        {leagues && leagues.length > 0 && (
          <div>
            <strong>Leagues:</strong>
            <ul className="ml-2 mt-1">
              {leagues.map((league, i) => (
                <li key={league.league_id}>
                  {i + 1}. {league.name} ({league.drafts?.length || 0} drafts)
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugInfo;
