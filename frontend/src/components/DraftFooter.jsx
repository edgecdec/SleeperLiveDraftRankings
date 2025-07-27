import React from 'react';

const DraftFooter = ({ data, currentDraft }) => {
  if (!data) return null;

  return (
    <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
      <p>
        {currentDraft.leagueName} • {currentDraft.draftType} Draft • 
        Draft ID: {data.draft_id} • 
        Last updated: {data.last_updated ? new Date(data.last_updated).toLocaleString() : 'Unknown'} • 
        Auto-refreshes every 30 seconds
      </p>
    </div>
  );
};

export default DraftFooter;
