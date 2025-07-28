import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import DraftHeader from './DraftHeader';
import RosterSidebar from './RosterSidebar';
import ConnectionStatus from './ConnectionStatus';
import DraggablePositionGrid from './DraggablePositionGrid';
import DraftFooter from './DraftFooter';
import DebugInfo from './DebugInfo';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import useDraftData from '../hooks/useDraftData';
import useUserLeagues from '../hooks/useUserLeagues';
import useUrlParams from '../hooks/useUrlParams';
import { useSettings } from '../contexts/SettingsContext';

const DraftView = () => {
  const navigate = useNavigate();
  const { platform, leagueId, draftId, user, season } = useUrlParams();
  
  // Use try-catch to handle cases where SettingsContext might not be available
  let debugModeEnabled = false; // Default to disabled
  try {
    const settings = useSettings();
    debugModeEnabled = settings.debugModeEnabled;
  } catch (e) {
    // Fallback if context is not available
    console.warn('Settings context not available, using default debug mode setting');
  }
  
  // Initialize roster sidebar state from localStorage
  const [isRosterOpen, setIsRosterOpen] = useState(() => {
    const saved = localStorage.getItem('rosterSidebarOpen');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Fetch draft data based on URL parameters
  const { data, loading, refreshing, error, lastUpdated, setDraftId, refreshData } = useDraftData(draftId);
  
  // Fetch user leagues if user is specified
  const { user: userInfo, leagues, fetchUserLeagues } = useUserLeagues();
  
  // ALL useEffect hooks must be at the top before any early returns
  
  // Load user leagues when component mounts if user is specified
  useEffect(() => {
    if (user) {
      fetchUserLeagues(user, season);
    }
  }, [user, season, fetchUserLeagues]);

  // Update draft ID when URL changes
  useEffect(() => {
    if (draftId) {
      setDraftId(draftId);
    }
  }, [draftId, setDraftId]);

  // Save roster sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('rosterSidebarOpen', JSON.stringify(isRosterOpen));
  }, [isRosterOpen]);

  // Debug current draft changes
  useEffect(() => {
    console.log('DraftView: URL parameters changed:', { platform, leagueId, draftId, user, season });
    console.log('DraftView: isRosterOpen state:', isRosterOpen);
  }, [platform, leagueId, draftId, user, season, isRosterOpen]);

  const handleDraftChange = async (draftInfo) => {
    console.log('DraftView: handleDraftChange called with:', draftInfo);
    
    // Navigate to new draft URL
    const newDraftUrl = `/${platform}/league/${draftInfo.leagueId}/draft/${draftInfo.draftId}${user ? `?user=${user}` : ''}`;
    navigate(newDraftUrl);
    
    // Update the backend's current draft ID
    if (draftInfo.draftId) {
      try {
        console.log('DraftView: Setting backend draft ID to:', draftInfo.draftId);
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
          console.log('DraftView: Successfully set backend draft ID');
        }
      } catch (error) {
        console.error('Error setting backend draft ID:', error);
      }
    }
  };

  const handleBackToSetup = () => {
    // Navigate back to user setup, preserving user context if available
    if (user) {
      navigate(`/user/${user}${season !== '2025' ? `?season=${season}` : ''}`);
    } else {
      navigate('/');
    }
  };

  // Handle roster toggle with smooth UX
  const handleRosterToggle = () => {
    setIsRosterOpen(prev => !prev);
  };

  // Create currentDraft object from URL parameters for compatibility
  const currentDraft = {
    draftId,
    leagueId,
    leagueName: data?.league_name || (loading ? 'Loading...' : 'Unknown League'),
    draftType: data?.draft_info?.type || 'snake', // Get actual draft type from API
    status: data?.draft_info?.status || 'unknown',
    username: user,
    user: userInfo,
    leagues: leagues
  };

  // Loading state
  if (loading && !data) {
    return (
      <LoadingState
        currentDraft={currentDraft}
        userLeagues={leagues}
        onDraftChange={handleDraftChange}
        onBackToSetup={handleBackToSetup}
        username={user}
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
        userLeagues={leagues}
        onDraftChange={handleDraftChange}
        onBackToSetup={handleBackToSetup}
        username={user}
      />
    );
  }

  const positions = data?.positions || {};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DraftHeader 
        data={data}
        lastUpdated={lastUpdated}
        onRefresh={refreshData}
        loading={loading}
        refreshing={refreshing}
        currentDraft={currentDraft}
        leagues={leagues}
        onDraftChange={handleDraftChange}
        onBackToSetup={handleBackToSetup}
        username={user}
      />

      {/* Roster Sidebar */}
      <RosterSidebar
        isOpen={isRosterOpen}
        onToggle={handleRosterToggle}
        leagueId={currentDraft?.leagueId}
        draftId={currentDraft?.draftId}
        username={user}
        lastUpdated={lastUpdated}
        data={data}
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
      <ConnectionStatus error={error} onRetry={refreshData} />

      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300 ${isRosterOpen ? 'lg:ml-80 xl:ml-96' : ''}`}>
        {/* Draggable Position sections */}
        <DraggablePositionGrid positions={positions} draftInfo={data?.draft_info} />

        {/* Draft info footer */}
        <DraftFooter data={data} currentDraft={currentDraft} />
      </main>
      
      {/* Debug Info */}
      {debugModeEnabled && (
        <DebugInfo 
          leagues={leagues}
          currentDraft={currentDraft}
          username={user}
        />
      )}
    </div>
  );
};

export default DraftView;
