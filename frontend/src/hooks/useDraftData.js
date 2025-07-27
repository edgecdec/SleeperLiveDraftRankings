import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useDraftData = (initialDraftId = null) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentDraftId, setCurrentDraftId] = useState(initialDraftId);

  const fetchDraftData = useCallback(async (draftId = currentDraftId) => {
    if (!draftId) {
      setLoading(false);
      return;
    }

    try {
      // Save current scroll position before fetching
      const scrollPosition = window.scrollY;
      
      setError(null);
      const params = draftId ? { draft_id: draftId } : {};
      const response = await axios.get('/api/draft/status', { params });
      setData(response.data);
      setLastUpdated(new Date());
      setLoading(false);
      
      // Restore scroll position after a brief delay to allow DOM updates
      setTimeout(() => {
        window.scrollTo(0, scrollPosition);
      }, 10);
      
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch draft data');
      setLoading(false);
    }
  }, [currentDraftId]);

  const refreshData = useCallback(async (draftId = currentDraftId) => {
    if (!draftId) return;

    // Save current scroll position
    const scrollPosition = window.scrollY;
    setRefreshing(true);

    try {
      setError(null);
      const params = draftId ? { draft_id: draftId } : {};
      const response = await axios.get('/api/draft/refresh', { params });
      setData(response.data);
      setLastUpdated(new Date());
      
      // Restore scroll position after DOM updates
      setTimeout(() => {
        window.scrollTo(0, scrollPosition);
        setRefreshing(false);
      }, 10);
      
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to refresh draft data');
      setRefreshing(false);
    }
  }, [currentDraftId]);

  const setDraftId = useCallback(async (draftId) => {
    setCurrentDraftId(draftId);
    setLoading(true);
    setData(null);
    
    // Set the draft ID on the backend
    try {
      await axios.post('/api/draft/set', { draft_id: draftId });
    } catch (err) {
      console.warn('Failed to set draft ID on backend:', err);
    }
    
    // Fetch data for the new draft
    await fetchDraftData(draftId);
  }, [fetchDraftData]);

  // Initial fetch
  useEffect(() => {
    if (currentDraftId) {
      fetchDraftData();
    } else {
      setLoading(false);
    }
  }, [fetchDraftData, currentDraftId]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!currentDraftId) return;

    const interval = setInterval(() => {
      if (!loading) {
        // Use refreshData instead of fetchDraftData for auto-refresh
        // This preserves scroll position
        refreshData();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [refreshData, loading, currentDraftId]);

  return {
    data,
    loading,
    refreshing,
    error,
    lastUpdated,
    currentDraftId,
    setDraftId,
    refreshData,
    refetch: fetchDraftData
  };
};

export default useDraftData;
