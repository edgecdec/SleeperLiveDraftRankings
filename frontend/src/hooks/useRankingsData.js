import { useState, useCallback } from 'react';

/**
 * Custom hook for managing rankings data and API calls
 * Handles fetching and updating all rankings-related data
 */
export const useRankingsData = (currentDraft) => {
  // State management
  const [rankingsStatus, setRankingsStatus] = useState(null);
  const [availableFormats, setAvailableFormats] = useState(null);
  const [currentFormat, setCurrentFormat] = useState(null);
  const [customRankings, setCustomRankings] = useState([]);
  const [currentRankings, setCurrentRankings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updateInProgress, setUpdateInProgress] = useState(false);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchRankingsStatus(),
        fetchAvailableFormats(),
        fetchCurrentFormat(),
        fetchCustomRankings(),
        fetchCurrentRankings()
      ]);
    } catch (error) {
      console.error('Error fetching rankings data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchRankingsStatus, fetchAvailableFormats, fetchCurrentFormat, fetchCustomRankings, fetchCurrentRankings]);

  // Individual fetch functions
  const fetchRankingsStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/rankings/status');
      const data = await response.json();
      setRankingsStatus(data);
      setUpdateInProgress(data.update_in_progress);
    } catch (error) {
      console.error('Error fetching rankings status:', error);
    }
  }, []);

  const fetchAvailableFormats = useCallback(async () => {
    try {
      const response = await fetch('/api/rankings/formats');
      const data = await response.json();
      setAvailableFormats(data);
    } catch (error) {
      console.error('Error fetching available formats:', error);
    }
  }, []);

  const fetchCurrentFormat = useCallback(async () => {
    try {
      const draftId = currentDraft?.draft_id;
      const url = draftId ? `/api/rankings/current-format?draft_id=${draftId}` : '/api/rankings/current-format';
      const response = await fetch(url);
      const data = await response.json();
      setCurrentFormat(data);
    } catch (error) {
      console.error('Error fetching current format:', error);
    }
  }, [currentDraft]);

  const fetchCustomRankings = useCallback(async () => {
    console.log('Fetching custom rankings...');
    try {
      const response = await fetch('/api/rankings/custom');
      const data = await response.json();
      console.log('Custom rankings response:', data);
      // Ensure data is an array
      const rankings = Array.isArray(data) ? data : [];
      console.log('Setting custom rankings:', rankings);
      setCustomRankings(rankings);
    } catch (error) {
      console.error('Error fetching custom rankings:', error);
      // Set to empty array on error
      setCustomRankings([]);
    }
  }, []);

  const fetchCurrentRankings = useCallback(async () => {
    try {
      const response = await fetch('/api/rankings/current');
      const data = await response.json();
      // Ensure data is an array
      setCurrentRankings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching current rankings:', error);
      // Set to empty array on error
      setCurrentRankings([]);
    }
  }, []);

  // Update rankings
  const handleUpdateRankings = useCallback(async () => {
    setUpdateInProgress(true);
    try {
      const response = await fetch('/api/rankings/update', {
        method: 'POST',
      });
      const result = await response.json();
      
      if (response.ok) {
        if (result.success) {
          // Update started successfully
          // Wait a bit for the update to process, then refresh data
          setTimeout(async () => {
            await fetchAllData();
          }, 5000); // Wait 5 seconds then refresh
        } else if (result.in_progress) {
          // Update already in progress
          window.alert('Rankings update is already in progress. Please wait...');
          // Still refresh data after a delay in case it completes
          setTimeout(async () => {
            await fetchAllData();
          }, 10000); // Wait 10 seconds then refresh
        } else {
          window.alert(`Error: ${result.message || 'Unknown error'}`);
        }
      } else {
        window.alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating rankings:', error);
      window.alert('Failed to update rankings');
    } finally {
      setUpdateInProgress(false);
    }
  }, [fetchAllData]);

  return {
    // State
    rankingsStatus,
    availableFormats,
    currentFormat,
    customRankings,
    currentRankings,
    loading,
    updateInProgress,
    
    // Actions
    fetchAllData,
    fetchRankingsStatus,
    fetchAvailableFormats,
    fetchCurrentFormat,
    fetchCustomRankings,
    fetchCurrentRankings,
    handleUpdateRankings,
    
    // Setters (for components that need direct state updates)
    setCustomRankings,
    setCurrentFormat
  };
};