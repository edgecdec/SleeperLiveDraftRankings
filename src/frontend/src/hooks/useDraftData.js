import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

// Use the same API base URL configuration as other hooks
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const useDraftData = (initialDraftId = null) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentDraftId, setCurrentDraftId] = useState(initialDraftId);
  
  // Get URL parameters to detect if this is a mock draft
  const { leagueId } = useParams();
  const isMockDraft = leagueId === 'mock';

  const fetchDraftData = useCallback(async (draftId = currentDraftId) => {
    if (!draftId) {
      setLoading(false);
      return;
    }

    try {
      // Save current scroll position before fetching
      const scrollPosition = window.scrollY;
      
      setError(null);
      
      let response;
      if (isMockDraft) {
        // For mock drafts, use the mock draft status endpoint
        response = await axios.get(`${API_BASE_URL}/api/mock-draft/status`);
      } else {
        // For regular drafts, use the regular draft status endpoint
        const params = draftId ? { draft_id: draftId } : {};
        response = await axios.get(`${API_BASE_URL}/api/draft/status`, { params });
      }
      
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
  }, [currentDraftId, isMockDraft]);

  const refreshData = useCallback(async (draftId = currentDraftId) => {
    if (!draftId) return;

    // Save current scroll position
    const scrollPosition = window.scrollY;
    setRefreshing(true);

    try {
      setError(null);
      
      let response;
      if (isMockDraft) {
        // For mock drafts, use the mock draft status endpoint
        response = await axios.get(`${API_BASE_URL}/api/mock-draft/status`);
      } else {
        // For regular drafts, use the regular draft refresh endpoint
        const params = draftId ? { draft_id: draftId } : {};
        response = await axios.get(`${API_BASE_URL}/api/draft/refresh`, { params });
      }
      
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
  }, [currentDraftId, isMockDraft]);

  const setDraftId = useCallback(async (draftId) => {
    setCurrentDraftId(draftId);
    setLoading(true);
    setData(null);
    
    // Set the draft ID on the backend
    try {
      if (isMockDraft) {
        // For mock drafts, ensure the mock draft configuration is set
        await axios.post(`${API_BASE_URL}/api/mock-draft/config`, {
          draft_id: draftId,
          description: `Mock Draft ${draftId}`,
          auto_refresh: true,
          refresh_interval: 30,
          validate_draft: false // Skip validation for existing mock drafts
        });
      } else {
        // For regular drafts, use the regular draft set endpoint
        await axios.post(`${API_BASE_URL}/api/draft/set`, { draft_id: draftId });
      }
    } catch (err) {
      console.warn('Failed to set draft ID on backend:', err);
    }
    
    // Fetch data for the new draft
    await fetchDraftData(draftId);
  }, [fetchDraftData, isMockDraft]);

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
    isMockDraft,
    setDraftId,
    refreshData,
    refetch: fetchDraftData
  };
};

export default useDraftData;