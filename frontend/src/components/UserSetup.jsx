import React, { useState } from 'react';
import { Search, User, Trophy, Calendar, Users, Zap, AlertCircle } from 'lucide-react';
import useUserLeagues from '../hooks/useUserLeagues';

const UserSetup = ({ onDraftSelected }) => {
  const [username, setUsername] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('2025');
  const { user, leagues, loading, error, fetchUserLeagues } = useUserLeagues();

  const handleSearch = (e) => {
    e.preventDefault();
    if (username.trim()) {
      fetchUserLeagues(username.trim(), selectedSeason);
    }
  };

  const handleDraftSelect = (league, draft) => {
    onDraftSelected({
      draftId: draft.draft_id,
      leagueId: league.league_id,
      leagueName: league.name,
      draftType: draft.type,
      status: draft.status,
      username: username,
      user: user,
      leagues: leagues
    });
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Trophy className="w-12 h-12 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Fantasy Draft Assistant</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Enter your Sleeper username to view your leagues and drafts</p>
        </div>

        {/* Search Form */}
        <div className="card mb-8">
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
                  onChange={(e) => setSelectedSeason(e.target.value)}
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
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 dark:text-red-500 mr-2" />
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* User Info */}
        {user && (
          <div className="card mb-6">
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
            
            {leagues.map((league) => (
              <div key={league.league_id} className="card">
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">{league.name}</h4>
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
    </div>
  );
};

export default UserSetup;
