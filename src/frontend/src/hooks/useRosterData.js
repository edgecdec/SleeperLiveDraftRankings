import { useState, useEffect, useCallback, useRef } from 'react';

// Use the same API base URL configuration as other hooks
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const useRosterData = (leagueId, username, draftId, isVisible, lastUpdated, data) => {
  const [rosterData, setRosterData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRankingsVersion, setLastRankingsVersion] = useState(null);
  
  // Use refs to avoid recreating fetchRosterData on every render
  const paramsRef = useRef({ leagueId, username, draftId });
  const lastFetchRef = useRef(0);
  const fetchInProgressRef = useRef(false);
  const FETCH_DEBOUNCE_MS = 1000; // Prevent rapid successive calls
  
  paramsRef.current = { leagueId, username, draftId };

  const fetchRosterData = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchRef.current;
    
    // Prevent overlapping calls
    if (fetchInProgressRef.current) {
      console.log('MyRoster: Fetch already in progress, skipping');
      return;
    }
    
    // Debounce rapid calls
    if (timeSinceLastFetch < FETCH_DEBOUNCE_MS) {
      console.log('MyRoster: Debouncing fetch call, too soon since last fetch');
      return;
    }
    
    fetchInProgressRef.current = true;
    lastFetchRef.current = now;
    const { leagueId: currentLeagueId, username: currentUsername, draftId: currentDraftId } = paramsRef.current;
    
    console.log('MyRoster: Fetching roster data for league:', currentLeagueId, 'username:', currentUsername);
    
    // Ensure we have the required parameters
    if (!currentLeagueId || !currentUsername) {
      console.log('MyRoster: Missing required parameters, skipping fetch');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({ username: currentUsername });
      if (currentDraftId) {
        params.append('draft_id', currentDraftId);
      }
      // Add timestamp to prevent caching
      params.append('_t', Date.now().toString());
      
      const apiUrl = `${API_BASE_URL}/api/league/${currentLeagueId}/my-roster?${params}`;
      console.log('MyRoster: Making API call to:', apiUrl);
      console.log('MyRoster: Full URL breakdown - leagueId:', currentLeagueId, 'params:', params.toString());
      
      const response = await fetch(apiUrl, {
        // Add cache-busting headers
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      const responseData = await response.json();
      
      console.log('MyRoster: Received roster data for league:', currentLeagueId, 'Total players:', responseData.total_players, 'First QB:', responseData.positions?.QB?.[0]?.name);
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to fetch roster');
      }

      setRosterData(responseData);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      fetchInProgressRef.current = false; // Reset the flag
    }
  }, []); // Empty dependency array since we use refs

  useEffect(() => {
    if (leagueId && username && isVisible) {
      // Clear previous roster data when league changes and show loading
      setRosterData(null);
      setError(null);
      setLoading(true); // Ensure loading state is shown during transition
      fetchRosterData();
    }
  }, [leagueId, username, draftId, isVisible, lastUpdated]); // Removed fetchRosterData dependency

  // Listen for rankings changes from RankingsManager
  useEffect(() => {
    const handleRankingsChange = () => {
      if (paramsRef.current.leagueId && paramsRef.current.username && isVisible) {
        console.log('MyRoster: Rankings changed, refreshing roster data');
        fetchRosterData();
      }
    };

    window.addEventListener('rankingsChanged', handleRankingsChange);
    return () => window.removeEventListener('rankingsChanged', handleRankingsChange);
  }, [isVisible]); // Removed fetchRosterData dependency since it's stable

  // Detect rankings changes from main draft data and refresh immediately
  useEffect(() => {
    if (data && data.rankings_version && lastRankingsVersion && 
        data.rankings_version !== lastRankingsVersion && 
        paramsRef.current.leagueId && paramsRef.current.username && isVisible) {
      console.log('MyRoster: Rankings version changed, refreshing roster immediately', {
        old: lastRankingsVersion,
        new: data.rankings_version
      });
      fetchRosterData();
    }
    if (data && data.rankings_version) {
      setLastRankingsVersion(data.rankings_version);
    }
  }, [data?.rankings_version, isVisible, lastRankingsVersion]); // Removed fetchRosterData dependency

  // Clear data immediately when league changes
  useEffect(() => {
    console.log('MyRoster: League changed to:', leagueId);
    setRosterData(null);
    setError(null);
    // Reset fetch tracking when league changes
    lastFetchRef.current = 0;
    fetchInProgressRef.current = false;
  }, [leagueId]);

  return {
    rosterData,
    loading,
    error,
    refetch: fetchRosterData
  };
};
