import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import DraftHeader from './DraftHeader';
import RosterSidebar from './RosterSidebar';
import ConnectionStatus from './ConnectionStatus';
import DraggablePositionGrid from './DraggablePositionGrid';
import DraftFooter from './DraftFooter';
import DebugInfo from './DebugInfo';

const DraftView = ({
  data,
  loading,
  refreshing,
  error,
  lastUpdated,
  onRefresh,
  currentDraft,
  userLeagues,
  onDraftChange,
  onBackToSetup,
  username
}) => {
  // Initialize roster sidebar state from localStorage
  const [isRosterOpen, setIsRosterOpen] = useState(() => {
    const saved = localStorage.getItem('rosterSidebarOpen');
    return saved !== null ? JSON.parse(saved) : false;
  });
  
  const positions = data?.positions || {};

  // Save roster sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('rosterSidebarOpen', JSON.stringify(isRosterOpen));
  }, [isRosterOpen]);

  // Debug current draft changes
  console.log('DraftView: currentDraft changed:', currentDraft);
  console.log('DraftView: isRosterOpen state:', isRosterOpen);

  // Handle roster toggle with smooth UX
  const handleRosterToggle = () => {
    setIsRosterOpen(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DraftHeader 
        data={data}
        lastUpdated={lastUpdated}
        onRefresh={onRefresh}
        loading={loading}
        refreshing={refreshing}
        currentDraft={currentDraft}
        leagues={userLeagues}
        onDraftChange={onDraftChange}
        onBackToSetup={onBackToSetup}
        username={username}
      />

      {/* Roster Sidebar */}
      <RosterSidebar
        isOpen={isRosterOpen}
        onToggle={handleRosterToggle}
        leagueId={currentDraft?.leagueId}
        draftId={currentDraft?.draftId}
        username={username}
        lastUpdated={lastUpdated}
      />

      {/* Roster Toggle Button in Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-2">
            <button
              onClick={handleRosterToggle}
              className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>{isRosterOpen ? 'Hide' : 'Show'} My Roster</span>
            </button>
          </div>
        </div>
      </div>

      {/* Connection status indicator */}
      <ConnectionStatus error={error} onRetry={onRefresh} />

      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300 ${isRosterOpen ? 'lg:ml-80 xl:ml-96' : ''}`}>
        {/* Draggable Position sections */}
        <DraggablePositionGrid positions={positions} />

        {/* Draft info footer */}
        <DraftFooter data={data} currentDraft={currentDraft} />
      </main>
      
      {/* Debug Info */}
      <DebugInfo 
        leagues={userLeagues}
        currentDraft={currentDraft}
        username={username}
      />
    </div>
  );
};

export default DraftView;
