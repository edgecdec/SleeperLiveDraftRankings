import React, { useState } from 'react';
import UserSetup from './components/UserSetup';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import DraftView from './components/DraftView';
import useDraftData from './hooks/useDraftData';
import { ThemeProvider } from './contexts/ThemeContext';

const App = () => {
  const [currentDraft, setCurrentDraft] = useState(null);
  const [username, setUsername] = useState('');
  const [userLeagues, setUserLeagues] = useState([]);
  
  const { data, loading, refreshing, error, lastUpdated, setDraftId, refreshData } = useDraftData(
    currentDraft?.draftId
  );

  const handleDraftSelected = (draftInfo) => {
    setCurrentDraft(draftInfo);
    setUsername(draftInfo.username);
    setUserLeagues(draftInfo.leagues || []);
    setDraftId(draftInfo.draftId);
  };

  const handleDraftChange = async (draftInfo) => {
    console.log('App: handleDraftChange called with:', draftInfo);
    console.log('App: Previous currentDraft:', currentDraft);
    
    setCurrentDraft(prev => {
      const newDraft = { ...prev, ...draftInfo };
      console.log('App: New currentDraft:', newDraft);
      return newDraft;
    });
    setDraftId(draftInfo.draftId);
    
    // Update the backend's current draft ID
    if (draftInfo.draftId) {
      try {
        console.log('App: Setting backend draft ID to:', draftInfo.draftId);
        const response = await fetch('/api/draft/set', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ draft_id: draftInfo.draftId }),
        });
        
        if (!response.ok) {
          console.error('Failed to set backend draft ID');
        } else {
          console.log('App: Successfully set backend draft ID');
        }
      } catch (error) {
        console.error('Error setting backend draft ID:', error);
      }
    }
  };

  const handleBackToSetup = () => {
    setCurrentDraft(null);
    setUsername('');
    setUserLeagues([]);
  };

  // Show user setup if no draft is selected
  if (!currentDraft) {
    return <UserSetup onDraftSelected={handleDraftSelected} />;
  }

  // Loading state
  if (loading && !data) {
    return (
      <LoadingState
        currentDraft={currentDraft}
        userLeagues={userLeagues}
        onDraftChange={handleDraftChange}
        onBackToSetup={handleBackToSetup}
        username={username}
      />
    );
  }

  // Error state
  if (error && !data) {
    return (
      <ErrorState
        error={error}
        onRetry={refreshData}
        currentDraft={currentDraft}
        userLeagues={userLeagues}
        onDraftChange={handleDraftChange}
        onBackToSetup={handleBackToSetup}
        username={username}
      />
    );
  }

  // Main draft view
  return (
    <DraftView
      data={data}
      loading={loading}
      refreshing={refreshing}
      error={error}
      lastUpdated={lastUpdated}
      onRefresh={refreshData}
      currentDraft={currentDraft}
      userLeagues={userLeagues}
      onDraftChange={handleDraftChange}
      onBackToSetup={handleBackToSetup}
      username={username}
    />
  );
};

// Wrap the entire App with ThemeProvider
const AppWithTheme = () => (
  <ThemeProvider>
    <App />
  </ThemeProvider>
);

export default AppWithTheme;
