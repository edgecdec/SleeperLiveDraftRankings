/**
 * API Hook with Toast Integration
 * 
 * This hook provides automatic error handling and toast notifications for API calls.
 * It integrates with the backend error service to display standardized error messages.
 */

import { useState, useCallback } from 'react';
import toastService from '../services/toastService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

/**
 * Custom hook for API calls with automatic toast error handling
 * @param {Object} options - Configuration options
 * @returns {Object} - API call functions and state
 */
export const useApiWithToast = (options = {}) => {
  const {
    showSuccessToast = false,
    successMessage = 'Operation completed successfully',
    showLoadingToast = false,
    loadingMessage = 'Loading...'
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Make an API call with automatic error handling
   * @param {string} endpoint - API endpoint (relative to base URL)
   * @param {Object} options - Fetch options
   * @param {Function} retryCallback - Optional retry callback
   * @returns {Promise} - API response or throws error
   */
  const apiCall = useCallback(async (endpoint, fetchOptions = {}, retryCallback = null) => {
    setLoading(true);
    setError(null);

    let loadingToastId = null;
    if (showLoadingToast) {
      loadingToastId = toastService.showLoading(loadingMessage);
    }

    try {
      const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
      
      const defaultOptions = {
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': generateRequestId(),
          ...fetchOptions.headers
        }
      };

      const response = await fetch(url, {
        ...defaultOptions,
        ...fetchOptions
      });

      const data = await response.json();

      // Handle error responses
      if (!response.ok || data.error) {
        const errorData = data.error ? data : { error: { message: data.message || 'Unknown error' } };
        
        // Show error toast
        toastService.handleApiError(errorData, retryCallback);
        
        // Update loading toast to error
        if (loadingToastId) {
          toastService.updateToError(loadingToastId, errorData.error?.message || 'Request failed');
        }
        
        setError(errorData);
        throw new Error(errorData.error?.message || 'API request failed');
      }

      // Handle success
      if (showSuccessToast) {
        if (loadingToastId) {
          toastService.updateToSuccess(loadingToastId, successMessage);
        } else {
          toastService.showSuccess(successMessage);
        }
      } else if (loadingToastId) {
        toastService.updateToSuccess(loadingToastId, 'Request completed');
      }

      return data;

    } catch (err) {
      // Handle network errors or other exceptions
      if (!err.message.includes('API request failed')) {
        const networkError = {
          error: {
            id: generateErrorId(),
            type: 'network_error',
            message: 'Network error - please check your connection',
            toast: {
              show: true,
              title: 'Connection Error',
              message: 'Unable to connect to the server',
              type: 'error',
              duration: 8000,
              actions: [
                { label: 'Retry', action: 'retry', style: 'primary' },
                { label: 'Dismiss', action: 'dismiss', style: 'secondary' }
              ]
            },
            suggestions: [
              'Check your internet connection',
              'Try refreshing the page',
              'Contact support if the issue persists'
            ]
          }
        };

        toastService.handleApiError(networkError, retryCallback);
        
        if (loadingToastId) {
          toastService.updateToError(loadingToastId, 'Connection failed');
        }
      }

      setError(err);
      throw err;

    } finally {
      setLoading(false);
    }
  }, [showSuccessToast, successMessage, showLoadingToast, loadingMessage]);

  /**
   * GET request with error handling
   */
  const get = useCallback((endpoint, options = {}) => {
    const retryCallback = () => get(endpoint, options);
    return apiCall(endpoint, { method: 'GET', ...options }, retryCallback);
  }, [apiCall]);

  /**
   * POST request with error handling
   */
  const post = useCallback((endpoint, data = null, options = {}) => {
    const retryCallback = () => post(endpoint, data, options);
    const fetchOptions = {
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
      ...options
    };
    return apiCall(endpoint, fetchOptions, retryCallback);
  }, [apiCall]);

  /**
   * PUT request with error handling
   */
  const put = useCallback((endpoint, data = null, options = {}) => {
    const retryCallback = () => put(endpoint, data, options);
    const fetchOptions = {
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
      ...options
    };
    return apiCall(endpoint, fetchOptions, retryCallback);
  }, [apiCall]);

  /**
   * DELETE request with error handling
   */
  const del = useCallback((endpoint, options = {}) => {
    const retryCallback = () => del(endpoint, options);
    return apiCall(endpoint, { method: 'DELETE', ...options }, retryCallback);
  }, [apiCall]);

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: del,
    apiCall
  };
};

/**
 * Specialized hook for draft-related API calls
 */
export const useDraftApi = () => {
  const api = useApiWithToast({
    showLoadingToast: true,
    loadingMessage: 'Loading draft data...'
  });

  const getDraftData = useCallback((draftId) => {
    return api.get(`/api/draft/${draftId}`);
  }, [api]);

  const setCurrentDraft = useCallback((draftId) => {
    return api.post('/api/draft/set', { draft_id: draftId }, {
      showSuccessToast: true,
      successMessage: 'Draft selected successfully'
    });
  }, [api]);

  const refreshDraftData = useCallback((draftId) => {
    return api.get(`/api/draft/refresh?draft_id=${draftId}`);
  }, [api]);

  const getCurrentFormat = useCallback((draftId) => {
    return api.get(`/api/rankings/current-format?draft_id=${draftId}`);
  }, [api]);

  const selectRankings = useCallback((type, id) => {
    return api.post('/api/rankings/select', { type, id }, {
      showSuccessToast: true,
      successMessage: 'Rankings format updated'
    });
  }, [api]);

  return {
    ...api,
    getDraftData,
    setCurrentDraft,
    refreshDraftData,
    getCurrentFormat,
    selectRankings
  };
};

/**
 * Specialized hook for user/league API calls
 */
export const useUserApi = () => {
  const api = useApiWithToast({
    showLoadingToast: true,
    loadingMessage: 'Loading user data...'
  });

  const getUserInfo = useCallback((username) => {
    return api.get(`/api/user/${username}`);
  }, [api]);

  const getUserLeagues = useCallback((username, season = '2025') => {
    return api.get(`/api/user/${username}/leagues?season=${season}`);
  }, [api]);

  const getLeagueDrafts = useCallback((leagueId) => {
    return api.get(`/api/league/${leagueId}/drafts`);
  }, [api]);

  const getMyRoster = useCallback((leagueId, username, draftId = null) => {
    const params = new URLSearchParams({ username });
    if (draftId) params.append('draft_id', draftId);
    return api.get(`/api/league/${leagueId}/my-roster?${params}`);
  }, [api]);

  return {
    ...api,
    getUserInfo,
    getUserLeagues,
    getLeagueDrafts,
    getMyRoster
  };
};

// Utility functions
function generateRequestId() {
  return `req_${Math.random().toString(36).substr(2, 8)}`;
}

function generateErrorId() {
  return `err_${Math.random().toString(36).substr(2, 8)}`;
}

export default useApiWithToast;
