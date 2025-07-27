import { useParams, useSearchParams } from 'react-router-dom';

/**
 * Custom hook to extract and manage URL parameters
 * Supports both path parameters and search parameters
 */
export const useUrlParams = () => {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Extract path parameters
  const platform = params.platform || 'sleeper';
  const username = params.username;
  const leagueId = params.leagueId;
  const draftId = params.draftId;
  
  // Extract search parameters
  const season = searchParams.get('season') || '2025';
  const user = searchParams.get('user');
  
  // Helper function to update search parameters
  const updateSearchParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    
    setSearchParams(newParams);
  };
  
  // Helper function to generate URLs
  const generateUrl = (type, params = {}) => {
    const baseParams = { platform, username, leagueId, draftId, season, user };
    const mergedParams = { ...baseParams, ...params };
    
    switch (type) {
      case 'home':
        return '/';
        
      case 'user':
        const userUrl = `/user/${mergedParams.username || username}`;
        return mergedParams.season !== '2025' ? `${userUrl}?season=${mergedParams.season}` : userUrl;
        
      case 'league':
        const leagueUrl = `/${mergedParams.platform}/league/${mergedParams.leagueId}`;
        const leagueQuery = [];
        if (mergedParams.user) leagueQuery.push(`user=${mergedParams.user}`);
        if (mergedParams.season !== '2025') leagueQuery.push(`season=${mergedParams.season}`);
        return leagueQuery.length > 0 ? `${leagueUrl}?${leagueQuery.join('&')}` : leagueUrl;
        
      case 'draft':
        const draftUrl = `/${mergedParams.platform}/league/${mergedParams.leagueId}/draft/${mergedParams.draftId}`;
        const draftQuery = [];
        if (mergedParams.user) draftQuery.push(`user=${mergedParams.user}`);
        if (mergedParams.season !== '2025') draftQuery.push(`season=${mergedParams.season}`);
        return draftQuery.length > 0 ? `${draftUrl}?${draftQuery.join('&')}` : draftUrl;
        
      default:
        return '/';
    }
  };
  
  return {
    // Path parameters
    platform,
    username,
    leagueId,
    draftId,
    
    // Search parameters
    season,
    user,
    
    // Helper functions
    updateSearchParams,
    generateUrl,
    
    // Raw access
    params,
    searchParams
  };
};

export default useUrlParams;
