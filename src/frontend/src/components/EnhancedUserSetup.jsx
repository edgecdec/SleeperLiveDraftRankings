import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  User, 
  Trophy, 
  Calendar, 
  Users, 
  Zap, 
  AlertCircle, 
  Crown, 
  RefreshCw, 
  Upload, 
  Target, 
  Settings 
} from 'lucide-react';
import useUserLeagues from '../hooks/useUserLeagues';
import useUrlParams from '../hooks/useUrlParams';


const EnhancedUserSetup = () => {
  const navigate = useNavigate();
  const { username: urlUsername, season: urlSeason } = useUrlParams();
  
  const [username, setUsername] = useState(urlUsername || '');
  const [selectedSeason, setSelectedSeason] = useState(urlSeason || '2025');
  const [activeTab, setActiveTab] = useState('leagues'); // 'leagues', 'mock-draft'
  const [mockDraftId, setMockDraftId] = useState('');
  const [mockDraftLoading, setMockDraftLoading] = useState(false);
  const [mockDraftError, setMockDraftError] = useState('');
  
  const { user, leagues, loading, error, fetchUserLeagues } = useUserLeagues();

  // Auto-fetch leagues if username is in URL
  useEffect(() => {
    if (urlUsername && urlUsername.trim()) {
      console.log('UserSetup: Auto-searching for user from URL:', urlUsername);
      setUsername(urlUsername);
      fetchUserLeagues(urlUsername, urlSeason || '2025');
    }
  }, [urlUsername, urlSeason, fetchUserLeagues]);

  // Auto-search when season changes (if we already have a username)
  useEffect(() => {
    if (username && username.trim() && selectedSeason) {
      console.log('UserSetup: Auto-searching due to season change:', { username, selectedSeason });
      fetchUserLeagues(username.trim(), selectedSeason);
    }
  }, [selectedSeason, fetchUserLeagues]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (username.trim()) {
      // Update URL and fetch leagues
      const userUrl = selectedSeason !== '2025' 
        ? `/user/${username.trim()}?season=${selectedSeason}`
        : `/user/${username.trim()}`;
      
      navigate(userUrl);
      fetchUserLeagues(username.trim(), selectedSeason);
    }
  };

  const handleDraftSelect = (league, draft) => {
    // Navigate to draft view with full URL context
    const draftUrl = `/sleeper/league/${league.league_id}/draft/${draft.draft_id}?user=${username}`;
    navigate(draftUrl);
  };

  const handleMockDraftConnect = async (e) => {
    e.preventDefault();
    
    if (!mockDraftId.trim()) {
      setMockDraftError('Please enter a mock draft ID');
      return;
    }

    if (!mockDraftId.match(/^\d+$/)) {
      setMockDraftError('Draft ID must be numeric');
      return;
    }

    setMockDraftLoading(true);
    setMockDraftError('');

    try {
      // Configure the mock draft in the backend
      const configResponse = await fetch('/api/mock-draft/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          draft_id: mockDraftId.trim(),
          description: `Mock Draft ${mockDraftId.trim()}`,
          auto_refresh: true,
          refresh_interval: 30,
          validate_draft: true
        }),
      });

      const configResult = await configResponse.json();

      if (configResponse.ok && configResult.success) {
        // Navigate to the mock draft view
        const mockDraftUrl = `/sleeper/league/mock/draft/${mockDraftId.trim()}?user=${username || 'mock-user'}`;
        navigate(mockDraftUrl);
      } else {
        setMockDraftError(configResult.message || 'Failed to connect to mock draft');
      }
    } catch (error) {
      console.error('Mock draft connection error:', error);
      setMockDraftError('Network error while connecting to mock draft');
    } finally {
      setMockDraftLoading(false);
    }
  };

  const handleSeasonChange = (newSeason) => {
    setSelectedSeason(newSeason);
    
    // Update URL if we have a username
    if (username && username.trim()) {
      const userUrl = newSeason !== '2025' 
        ? `/user/${username.trim()}?season=${newSeason}`
        : `/user/${username.trim()}`;
      navigate(userUrl, { replace: true });
    }
  };

  const getDraftStatusColor = (status) => {
    switch (status) {
      case 'complete': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'drafting': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'pre_draft': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getDraftStatusIcon = (status) => {
    switch (status) {
      case 'complete': return '✅';
      case 'drafting': return '🔴';
      case 'pre_draft': return '⏳';
      default: return '❓';
    }
  };

  const getDraftStatusPriority = (status) => {
    switch (status) {
      case 'drafting': return 1;
      case 'pre_draft': return 2;
      case 'complete': return 3;
      default: return 4;
    }
  };

  const getLeagueCardClasses = (league) => {
    const hasActiveDraft = league.drafts && league.drafts.some(draft => draft.status === 'drafting');
    const baseClasses = 'card transition-all duration-300';
    
    if (hasActiveDraft) {
      return `${baseClasses} border-2 border-red-500 draft-active`;
    }
    
    return baseClasses;
  };

  const sortLeaguesByDraftStatus = (leagues) => {
    return [...leagues].sort((a, b) => {
      const getLeaguePriority = (league) => {
        if (!league.drafts || league.drafts.length === 0) return 4;
        
        const priorities = league.drafts.map(draft => getDraftStatusPriority(draft.status));
        return Math.min(...priorities);
      };
      
      const priorityA = getLeaguePriority(a);
      const priorityB = getLeaguePriority(b);
      
      return priorityA - priorityB;
    });
  };

  const isDynastyOrKeeperLeague = (league) => {
    const settings = league.settings || {};
    
    if (settings.type === 2) return true;
    if (settings.taxi_slots > 0) return true;
    if (settings.max_keepers > 1) return true;
    
    if (league.previous_league_id) {
      if (settings.max_keepers > 1 || settings.taxi_slots > 0 || settings.type === 2) {
        return true;
      }
    }
    
    if (league.drafts && league.drafts.length > 0) {
      const draft = league.drafts[0];
      if (draft.metadata && draft.metadata.scoring_type && 
          draft.metadata.scoring_type.includes('dynasty')) {
        return true;
      }
    }
    
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Trophy className="w-12 h-12 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Fantasy Draft Assistant</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Manage your drafts, upload custom rankings, and connect to mock drafts</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('leagues')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'leagues'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>My Leagues</span>
            </button>
            <button
              onClick={() => setActiveTab('mock-draft')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'mock-draft'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Mock Draft</span>
            </button>

          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* My Leagues Tab */}
          {activeTab === 'leagues' && (
            <div className="space-y-6">
              {/* Search Form */}
              <div className="card">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sleeper Username
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input
                          type="text"
                          id="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Enter your Sleeper username"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="season" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Season
                      </label>
                      <select
                        id="season"
                        value={selectedSeason}
                        onChange={(e) => handleSeasonChange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        disabled={loading}
                      >
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                      </select>
                    </div>
                    
                    <div className="pt-7">
                      <button
                        type="submit"
                        disabled={loading || !username.trim()}
                        className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        <Search className="w-4 h-4" />
                        <span>{loading ? 'Searching...' : 'Search'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-400 dark:text-red-500 mr-2" />
                    <p className="text-red-700 dark:text-red-300">{error}</p>
                  </div>
                </div>
              )}

              {/* User Info */}
              {user && (
                <div className="card">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                      {user.avatar ? (
                        <img 
                          src={`https://sleepercdn.com/avatars/thumbs/${user.avatar}`} 
                          alt={user.display_name}
                          className="w-16 h-16 rounded-full"
                        />
                      ) : (
                        <User className="w-8 h-8 text-primary-600" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{user.display_name}</h2>
                      <p className="text-gray-600 dark:text-gray-300">@{user.username}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{leagues.length} leagues found for {selectedSeason}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Leagues List */}
              {leagues.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select a League & Draft</h3>
                  
                  {sortLeaguesByDraftStatus(leagues).map((league) => (
                    <div key={league.league_id} className={getLeagueCardClasses(league)}>
                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">{league.name}</h4>
                            {isDynastyOrKeeperLeague(league) ? (
                              <div className="flex items-center space-x-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-xs font-medium">
                                <Crown className="w-3 h-3" />
                                <span>Dynasty/Keeper</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">
                                <RefreshCw className="w-3 h-3" />
                                <span>Redraft</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                            <Users className="w-4 h-4" />
                            <span>{league.total_rosters} teams</span>
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                          {league.settings?.type || 'Standard'} • Season {league.season}
                        </p>
                      </div>

                      {/* Drafts */}
                      {league.drafts && league.drafts.length > 0 ? (
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Available Drafts:</h5>
                          {league.drafts.map((draft) => (
                            <div
                              key={draft.draft_id}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-lg">{getDraftStatusIcon(draft.status)}</span>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {draft.type === 'snake' ? 'Snake Draft' : draft.type}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDraftStatusColor(draft.status)}`}>
                                      {draft.status.replace('_', ' ')}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {draft.start_time ? 
                                      new Date(draft.start_time).toLocaleString() : 
                                      'Start time TBD'
                                    }
                                  </p>
                                </div>
                              </div>
                              
                              <button
                                onClick={() => handleDraftSelect(league, draft)}
                                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200"
                              >
                                <Zap className="w-4 h-4" />
                                <span>Select Draft</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                          <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                          <p>No drafts found for this league</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {user && leagues.length === 0 && (
                <div className="card text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Leagues Found</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    No leagues found for {user.display_name} in the {selectedSeason} season.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Try selecting a different season or check your Sleeper account.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Mock Draft Tab */}
          {activeTab === 'mock-draft' && (
            <div className="max-w-2xl mx-auto">
              <div className="card">
                <div className="text-center mb-6">
                  <Target className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Connect to Mock Draft</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Enter a Sleeper mock draft ID to connect and track the draft in real-time
                  </p>
                </div>

                <form onSubmit={handleMockDraftConnect} className="space-y-6">
                  <div>
                    <label htmlFor="mockDraftId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mock Draft ID
                    </label>
                    <input
                      type="text"
                      id="mockDraftId"
                      value={mockDraftId}
                      onChange={(e) => {
                        setMockDraftId(e.target.value);
                        setMockDraftError('');
                      }}
                      placeholder="e.g., 123456789"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-lg"
                      disabled={mockDraftLoading}
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Find this in your Sleeper mock draft URL: sleeper.app/draft/nfl/<strong>123456789</strong>
                    </p>
                  </div>

                  {mockDraftError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-400 dark:text-red-500 mr-2" />
                        <p className="text-red-700 dark:text-red-300">{mockDraftError}</p>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={mockDraftLoading || !mockDraftId.trim()}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 text-lg font-medium"
                  >
                    {mockDraftLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <Target className="w-5 h-5" />
                        <span>Connect to Mock Draft</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">How to find your Mock Draft ID:</h3>
                  <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                    <li>Go to your Sleeper mock draft</li>
                    <li>Look at the URL in your browser</li>
                    <li>Copy the numbers at the end of the URL</li>
                    <li>Paste them in the field above</li>
                  </ol>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    <strong>Note:</strong> This only works with Sleeper mock drafts, not live league drafts.
                  </p>
                </div>
              </div>
            </div>
          )}


        </div>
      </div>
    </div>
  );
};

export default EnhancedUserSetup;