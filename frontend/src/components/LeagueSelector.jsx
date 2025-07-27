import React, { useState } from 'react';
import { ChevronDown, Trophy, Users, Calendar, Zap, Crown } from 'lucide-react';

const LeagueSelector = ({ currentDraft, leagues, onDraftChange, onBackToSetup }) => {
  const [isOpen, setIsOpen] = useState(false);

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

  const isDynastyOrKeeperLeague = (league) => {
    // Check league settings for dynasty/keeper indicators
    const settings = league.settings || {};
    
    // Dynasty league type
    if (settings.type === 2) return true;
    
    // Has keepers
    if (settings.max_keepers > 0) return true;
    
    // Has taxi squad (dynasty feature)
    if (settings.taxi_slots > 0) return true;
    
    // Has previous league ID (continuation)
    if (league.previous_league_id) return true;
    
    // Check draft metadata for dynasty scoring
    if (league.drafts && league.drafts.length > 0) {
      const draft = league.drafts[0];
      if (draft.metadata && draft.metadata.scoring_type && 
          draft.metadata.scoring_type.includes('dynasty')) {
        return true;
      }
    }
    
    return false;
  };

  const handleDraftSelect = (league, draft) => {
    console.log('LeagueSelector: Selecting draft for league:', league.league_id, 'draft:', draft.draft_id);
    onDraftChange({
      draftId: draft.draft_id,
      leagueId: league.league_id,  // ← This was missing!
      leagueName: league.name,
      draftType: draft.type,
      status: draft.status
    });
    setIsOpen(false);
  };

  if (!currentDraft) {
    return null;
  }

  return (
    <div className="relative">
      {/* Current Draft Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
      >
        <Trophy className="w-4 h-4 text-primary-600" />
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {currentDraft.leagueName}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {currentDraft.draftType === 'snake' ? 'Snake Draft' : currentDraft.draftType}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-20 max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Switch League/Draft</h3>
                <button
                  onClick={() => {
                    onBackToSetup();
                    setIsOpen(false);
                  }}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  Change User
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {leagues.map((league) => (
                <div key={league.league_id} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{league.name}</h4>
                        {isDynastyOrKeeperLeague(league) && (
                          <div className="flex items-center space-x-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-xs font-medium">
                            <Crown className="w-3 h-3" />
                            <span>Dynasty/Keeper</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                        <Users className="w-3 h-3" />
                        <span>{league.total_rosters}</span>
                      </div>
                    </div>

                    {/* Drafts for this league */}
                    {league.drafts && league.drafts.length > 0 ? (
                      <div className="space-y-1">
                        {league.drafts.map((draft) => (
                          <button
                            key={draft.draft_id}
                            onClick={() => handleDraftSelect(league, draft)}
                            className={`w-full flex items-center justify-between p-2 rounded text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                              currentDraft.draftId === draft.draft_id ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">{getDraftStatusIcon(draft.status)}</span>
                              <div>
                                <div className="text-xs font-medium text-gray-900 dark:text-white">
                                  {draft.type === 'snake' ? 'Snake Draft' : draft.type}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {draft.start_time ? 
                                    new Date(draft.start_time).toLocaleDateString() : 
                                    'TBD'
                                  }
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDraftStatusColor(draft.status)}`}>
                                {draft.status.replace('_', ' ')}
                              </span>
                              {currentDraft.draftId === draft.draft_id && (
                                <Zap className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 dark:text-gray-400 italic">No drafts available</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {leagues.length === 0 && (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p className="text-sm">No leagues available</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default LeagueSelector;
