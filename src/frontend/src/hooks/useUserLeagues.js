import { useState, useCallback } from 'react';
import axios from 'axios';

// Use the same API base URL configuration as other hooks
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const useUserLeagues = () => {
  const [user, setUser] = useState(null);
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserLeagues = useCallback(async (username, season = '2025') => {
    if (!username || username.trim() === '') {
      setError('Username is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use absolute URL with API_BASE_URL
      const response = await axios.get(`${API_BASE_URL}/api/user/${username}/leagues?season=${season}`);
      setUser(response.data.user);
      setLeagues(response.data.leagues);
      setError(null);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('User not found. Please check the username.');
      } else {
        setError(err.response?.data?.error || 'Failed to fetch user leagues');
      }
      setUser(null);
      setLeagues([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setUser(null);
    setLeagues([]);
    setError(null);
  }, []);

  return {
    user,
    leagues,
    loading,
    error,
    fetchUserLeagues,
    clearData
  };
};

export default useUserLeagues;
