import { useState, useEffect } from 'react';

export const useRosterData = (leagueId, username, draftId, isVisible, lastUpdated, data) => {
  const [rosterData, setRosterData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRankingsVersion, setLastRankingsVersion] = useState(null);

  const fetchRosterData = async () => {
    console.log('MyRoster: Fetching roster data for league:', leagueId, 'username:', username);
    
    // Ensure we have the required parameters
    if (!leagueId || !username) {
      console.log('MyRoster: Missing required parameters, skipping fetch');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({ username });
      if (draftId) {
        params.append('draft_id', draftId);
      }
      // Add timestamp to prevent caching
      params.append('_t', Date.now().toString());
      
      const apiUrl = `/api/league/${leagueId}/my-roster?${params}`;
      console.log('MyRoster: Making API call to:', apiUrl);
      console.log('MyRoster: Full URL breakdown - leagueId:', leagueId, 'params:', params.toString());
      
      const response = await fetch(apiUrl, {
        // Add cache-busting headers
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      const data = await response.json();
      
      console.log('MyRoster: Received roster data for league:', leagueId, 'Total players:', data.total_players, 'First QB:', data.positions?.QB?.[0]?.name);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch roster');
      }

      setRosterData(data);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leagueId && username && isVisible) {
      // Clear previous roster data when league changes and show loading
      setRosterData(null);
      setError(null);
      setLoading(true); // Ensure loading state is shown during transition
      fetchRosterData();
    }
  }, [leagueId, username, draftId, isVisible, lastUpdated]);

  // Listen for rankings changes from RankingsManager
  useEffect(() => {
    const handleRankingsChange = () => {
      if (leagueId && username && isVisible) {
        console.log('MyRoster: Rankings changed, refreshing roster data');
        fetchRosterData();
      }
    };

    window.addEventListener('rankingsChanged', handleRankingsChange);
    return () => window.removeEventListener('rankingsChanged', handleRankingsChange);
  }, [leagueId, username, isVisible]);

  // Detect rankings changes from main draft data and refresh immediately
  useEffect(() => {
    if (data && data.rankings_version && lastRankingsVersion && 
        data.rankings_version !== lastRankingsVersion && 
        leagueId && username && isVisible) {
      console.log('MyRoster: Rankings version changed, refreshing roster immediately', {
        old: lastRankingsVersion,
        new: data.rankings_version
      });
      fetchRosterData();
    }
    if (data && data.rankings_version) {
      setLastRankingsVersion(data.rankings_version);
    }
  }, [data?.rankings_version, leagueId, username, isVisible]);

  // Clear data immediately when league changes
  useEffect(() => {
    console.log('MyRoster: League changed to:', leagueId);
    setRosterData(null);
    setError(null);
  }, [leagueId]);

  return {
    rosterData,
    loading,
    error,
    refetch: fetchRosterData
  };
};
