import React, { useState, useEffect } from 'react';
import { Users, ChevronDown, ChevronUp, User, Shield, Star, Clock, Cross } from 'lucide-react';
import clsx from 'clsx';
import { getPositionConfig } from '../constants/positions';

const MyRoster = ({ leagueId, username, draftId, isVisible = true, lastUpdated, isSidebar = false, data }) => {
  console.log('MyRoster: Component rendered with props:', { leagueId, username, draftId, isVisible, isSidebar });
  
  const [rosterData, setRosterData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedPositions, setExpandedPositions] = useState({});
  const [lastRankingsVersion, setLastRankingsVersion] = useState(null);

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
    setExpandedPositions({});
  }, [leagueId]);

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
      
      // Auto-expand positions with players - add defensive check
      const newExpanded = {};
      if (data.positions && typeof data.positions === 'object') {
        Object.keys(data.positions).forEach(pos => {
          newExpanded[pos] = true;
        });
      }
      setExpandedPositions(newExpanded);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePosition = (position) => {
    setExpandedPositions(prev => ({
      ...prev,
      [position]: !prev[position]
    }));
  };

  const getPositionOrder = () => {
    return ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'drafted':
        return <Clock className="w-3 h-3 text-green-500" title="Drafted This Draft" />;
      case 'taxi':
        return <Shield className="w-3 h-3 text-blue-500" title="Taxi Squad" />;
      case 'reserve':
        return <Cross className="w-3 h-3 text-red-500" title="Injured Reserve (IR)" />;
      case 'rostered':
        return null; // No icon for regular rostered players
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'drafted':
        return 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'taxi':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'reserve':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'rostered':
        return 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
      default:
        return 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const getStarterInfo = (position) => {
    if (!rosterData?.roster_settings?.starter_counts) return null;
    
    const starterCount = rosterData.roster_settings.starter_counts[position] || 0;
    const flexCount = rosterData.roster_settings.starter_counts['FLEX'] || 0;
    const superFlexCount = rosterData.roster_settings.starter_counts['SUPER_FLEX'] || 0;
    
    let info = '';
    if (starterCount > 0) {
      info += `${starterCount} starter${starterCount > 1 ? 's' : ''}`;
    }
    
    // Add FLEX eligibility info
    if (['RB', 'WR', 'TE'].includes(position) && flexCount > 0) {
      info += info ? `, +${flexCount} FLEX` : `${flexCount} FLEX`;
    }
    
    // Add SUPER_FLEX eligibility info  
    if (['QB', 'RB', 'WR', 'TE'].includes(position) && superFlexCount > 0) {
      info += info ? `, +${superFlexCount} SF` : `${superFlexCount} SF`;
    }
    
    return info || null;
  };

  const getPositionColor = (position) => {
    // Use consistent colors from constants, but with darker text variants for roster
    const config = getPositionConfig(position);
    const colorMap = {
      'red': 'text-red-700 dark:text-red-400',
      'green': 'text-green-700 dark:text-green-400', 
      'blue': 'text-blue-700 dark:text-blue-400',
      'yellow': 'text-yellow-700 dark:text-yellow-400',
      'purple': 'text-purple-700 dark:text-purple-400',
      'gray': 'text-gray-700 dark:text-gray-300'
    };
    return colorMap[config.color] || 'text-gray-700 dark:text-gray-300';
  };

  const getAllStartersAndBench = () => {
    if (!rosterData?.roster_settings?.starter_counts) {
      return { starters: [], bench: [], emptyStarters: [], emptyBench: [] };
    }

    const starterCounts = rosterData.roster_settings.starter_counts;
    const benchSlots = rosterData.roster_settings?.bench_slots || 0;
    const allPlayers = [];
    const seenPlayerIds = new Set(); // Frontend safeguard against duplicates
    
    // Collect all players with their position and rank, deduplicating by player_id
    if (rosterData.positions) {
      Object.entries(rosterData.positions).forEach(([position, players]) => {
        players.forEach(player => {
          // Skip if we've already seen this player_id
          if (!seenPlayerIds.has(player.player_id)) {
            allPlayers.push({
              ...player,
              originalPosition: position
            });
            seenPlayerIds.add(player.player_id);
          } else {
            console.log(`MyRoster Frontend: Skipped duplicate player ${player.name} (${player.player_id})`);
          }
        });
      });
    }

    console.log('MyRoster: Total players collected:', allPlayers.length);
    console.log('MyRoster: Player IDs:', allPlayers.map(p => p.player_id));

    // Sort all players by rank (lower = better)
    allPlayers.sort((a, b) => {
      const rankA = a.rank === 999 ? 9999 : a.rank;
      const rankB = b.rank === 999 ? 9999 : b.rank;
      return rankA - rankB;
    });

    const starters = [];
    const bench = [];
    const emptyStarters = [];
    const emptyBench = [];
    const usedPlayers = new Set();

    // Fill dedicated position starters first (QB, RB, WR, TE, K, DEF)
    ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'].forEach(position => {
      const needed = starterCounts[position] || 0;
      const positionPlayers = allPlayers.filter(p => 
        p.originalPosition === position && !usedPlayers.has(p.player_id)
      );
      
      // Add filled positions
      for (let i = 0; i < needed && i < positionPlayers.length; i++) {
        const player = positionPlayers[i];
        starters.push({
          ...player,
          starterType: position,
          slotNumber: i + 1
        });
        usedPlayers.add(player.player_id);
        console.log(`MyRoster: Added ${player.name} to starters as ${position}`);
      }

      // Add empty positions for unfilled slots
      for (let i = positionPlayers.length; i < needed; i++) {
        emptyStarters.push({
          starterType: position,
          slotNumber: i + 1,
          isEmpty: true
        });
        console.log(`MyRoster: Added empty ${position} slot ${i + 1}`);
      }
    });

    // Fill FLEX positions (RB, WR, TE eligible)
    const flexNeeded = starterCounts['FLEX'] || 0;
    const flexEligible = allPlayers.filter(p => 
      ['RB', 'WR', 'TE'].includes(p.originalPosition) && !usedPlayers.has(p.player_id)
    );
    
    // Add filled FLEX positions
    for (let i = 0; i < flexNeeded && i < flexEligible.length; i++) {
      const player = flexEligible[i];
      starters.push({
        ...player,
        starterType: 'FLEX',
        slotNumber: i + 1
      });
      usedPlayers.add(player.player_id);
      console.log(`MyRoster: Added ${player.name} to starters as FLEX`);
    }

    // Add empty FLEX positions
    for (let i = flexEligible.length; i < flexNeeded; i++) {
      emptyStarters.push({
        starterType: 'FLEX',
        slotNumber: i + 1,
        isEmpty: true
      });
      console.log(`MyRoster: Added empty FLEX slot ${i + 1}`);
    }

    // Fill REC_FLEX positions (WR, TE eligible - Guillotine League)
    const recFlexNeeded = starterCounts['REC_FLEX'] || 0;
    const recFlexEligible = allPlayers.filter(p => 
      ['WR', 'TE'].includes(p.originalPosition) && !usedPlayers.has(p.player_id)
    );
    
    // Add filled REC_FLEX positions
    for (let i = 0; i < recFlexNeeded && i < recFlexEligible.length; i++) {
      const player = recFlexEligible[i];
      starters.push({
        ...player,
        starterType: 'REC_FLEX',
        slotNumber: i + 1
      });
      usedPlayers.add(player.player_id);
      console.log(`MyRoster: Added ${player.name} to starters as REC_FLEX`);
    }

    // Add empty REC_FLEX positions
    for (let i = recFlexEligible.length; i < recFlexNeeded; i++) {
      emptyStarters.push({
        starterType: 'REC_FLEX',
        slotNumber: i + 1,
        isEmpty: true
      });
      console.log(`MyRoster: Added empty REC_FLEX slot ${i + 1}`);
    }

    // Fill SUPER_FLEX positions (QB, RB, WR, TE eligible)
    const superFlexNeeded = starterCounts['SUPER_FLEX'] || 0;
    const superFlexEligible = allPlayers.filter(p => 
      ['QB', 'RB', 'WR', 'TE'].includes(p.originalPosition) && !usedPlayers.has(p.player_id)
    );
    
    // Add filled SUPER_FLEX positions
    for (let i = 0; i < superFlexNeeded && i < superFlexEligible.length; i++) {
      const player = superFlexEligible[i];
      starters.push({
        ...player,
        starterType: 'SUPER_FLEX',
        slotNumber: i + 1
      });
      usedPlayers.add(player.player_id);
      console.log(`MyRoster: Added ${player.name} to starters as SUPER_FLEX`);
    }

    // Add empty SUPER_FLEX positions
    for (let i = superFlexEligible.length; i < superFlexNeeded; i++) {
      emptyStarters.push({
        starterType: 'SUPER_FLEX',
        slotNumber: i + 1,
        isEmpty: true
      });
      console.log(`MyRoster: Added empty SUPER_FLEX slot ${i + 1}`);
    }

    // All remaining players go to bench
    allPlayers.forEach(player => {
      if (!usedPlayers.has(player.player_id)) {
        bench.push(player);
        console.log(`MyRoster: Added ${player.name} to bench`);
      }
    });

    // Add empty bench slots
    const currentBenchCount = bench.length;
    for (let i = currentBenchCount; i < benchSlots; i++) {
      emptyBench.push({
        isEmpty: true,
        slotNumber: i + 1
      });
      console.log(`MyRoster: Added empty bench slot ${i + 1}`);
    }

    console.log('MyRoster: Final counts - Starters:', starters.length, 'Empty Starters:', emptyStarters.length, 'Bench:', bench.length, 'Empty Bench:', emptyBench.length);
    console.log('MyRoster: Used players:', Array.from(usedPlayers));

    return { starters, bench, emptyStarters, emptyBench };
  };

  const getStarterTypeDisplay = (starterType, slotNumber) => {
    const displays = {
      'QB': `QB${slotNumber > 1 ? slotNumber : ''}`,
      'RB': `RB${slotNumber > 1 ? slotNumber : ''}`,
      'WR': `WR${slotNumber > 1 ? slotNumber : ''}`,
      'TE': `TE${slotNumber > 1 ? slotNumber : ''}`,
      'K': `K${slotNumber > 1 ? slotNumber : ''}`,
      'DEF': `DEF${slotNumber > 1 ? slotNumber : ''}`,
      'FLEX': `FLEX${slotNumber > 1 ? slotNumber : ''}`,
      'REC_FLEX': `R-FLEX${slotNumber > 1 ? slotNumber : ''}`,
      'SUPER_FLEX': `SF${slotNumber > 1 ? slotNumber : ''}`
    };
    return displays[starterType] || starterType;
  };

  const getStarterTypeColor = (starterType) => {
    const colors = {
      'QB': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      'RB': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'WR': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'TE': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      'K': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      'DEF': 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
      'FLEX': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
      'REC_FLEX': 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
      'SUPER_FLEX': 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300'
    };
    return colors[starterType] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  if (!isVisible) return null;

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Roster</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-300">Loading roster...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Roster</h3>
        </div>
        <div className="text-red-600 dark:text-red-400 text-center py-4">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!rosterData) return null;

  const { starters, bench, emptyStarters, emptyBench } = getAllStartersAndBench();
  const totalPlayers = starters.length + bench.length;
  const totalSlots = starters.length + emptyStarters.length + bench.length + emptyBench.length;

  // Show empty state only if no roster settings are available
  if (!rosterData.roster_settings) {
    return (
      <div className={clsx(
        "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700",
        isSidebar ? "p-3" : "p-4"
      )}>
        <div className="flex items-center space-x-2 mb-4">
          <Users className="w-5 h-5 text-blue-600" />
          <h3 className={clsx("font-semibold text-gray-900 dark:text-white", isSidebar ? "text-base" : "text-lg")}>
            My Roster
          </h3>
        </div>
        <div className="text-center py-8">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Roster Not Available</h4>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Roster information is not available for this league.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(
      "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700",
      isSidebar ? "p-3" : "p-4"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-blue-600" />
          <h3 className={clsx("font-semibold text-gray-900 dark:text-white", isSidebar ? "text-base" : "text-lg")}>
            My Roster
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({totalPlayers}/{totalSlots} filled)
          </span>
          {rosterData.drafted_this_draft > 0 && (
            <span className="text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
              +{rosterData.drafted_this_draft} drafted
            </span>
          )}
        </div>
        {!isSidebar && (
          <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300">
            <User className="w-4 h-4" />
            <span>{rosterData.username}</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Starters Section */}
        {(starters.length > 0 || emptyStarters.length > 0) && (
          <div className="border border-green-200 dark:border-green-800 rounded-lg">
            <div className="px-3 py-2 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800 flex items-center justify-between">
              <span className="font-medium text-green-800 dark:text-green-300 uppercase tracking-wide text-sm">
                Starting Lineup ({starters.length}/{starters.length + emptyStarters.length})
              </span>
            </div>
            <div className="bg-white dark:bg-gray-800">
              {/* Filled starter positions */}
              {starters.map((player, index) => (
                <div
                  key={`starter-${player.player_id}-${player.starterType}-${index}`}
                  className={clsx(
                    "px-3 py-2 flex items-center justify-between border-l-4 border-green-400",
                    index !== starters.length + emptyStarters.length - 1 && "border-b border-gray-200 dark:border-gray-700",
                    getStatusColor(player.status)
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <span className={clsx(
                      "text-xs font-medium px-2 py-1 rounded uppercase tracking-wide",
                      getStarterTypeColor(player.starterType)
                    )}>
                      {getStarterTypeDisplay(player.starterType, player.slotNumber)}
                    </span>
                    {getStatusIcon(player.status)}
                    <span className={clsx("font-medium", getPositionColor(player.originalPosition))}>
                      {player.name}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {player.team !== 'FA' ? player.team : 'Free Agent'}
                    </span>
                    {player.rank && player.rank !== 999 && (
                      <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-1 rounded">
                        #{player.rank}
                      </span>
                    )}
                    {player.pick_no && (
                      <span className="text-xs text-green-600 dark:text-green-400">
                        Pick #{player.pick_no}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Empty starter positions */}
              {emptyStarters.map((emptySlot, index) => (
                <div
                  key={`empty-starter-${emptySlot.starterType}-${emptySlot.slotNumber}`}
                  className={clsx(
                    "px-3 py-2 flex items-center justify-between border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50",
                    starters.length + index !== starters.length + emptyStarters.length - 1 && "border-b border-gray-200 dark:border-gray-700"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <span className={clsx(
                      "text-xs font-medium px-2 py-1 rounded uppercase tracking-wide",
                      "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                    )}>
                      {getStarterTypeDisplay(emptySlot.starterType, emptySlot.slotNumber)}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 italic">
                      Empty - Need to draft
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bench Section */}
        {(bench.length > 0 || emptyBench.length > 0) && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
              <span className="font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide text-sm">
                Bench ({bench.length}/{bench.length + emptyBench.length})
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800">
              {/* Filled bench positions */}
              {bench.map((player, index) => (
                <div
                  key={`bench-${player.player_id}-${index}`}
                  className={clsx(
                    "px-3 py-2 flex items-center justify-between",
                    index !== bench.length + emptyBench.length - 1 && "border-b border-gray-200 dark:border-gray-700",
                    getStatusColor(player.status)
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <span className={clsx(
                      "text-xs font-medium px-2 py-1 rounded uppercase tracking-wide bg-gray-100 dark:bg-gray-700",
                      getPositionColor(player.originalPosition)
                    )}>
                      {player.originalPosition}
                    </span>
                    {getStatusIcon(player.status)}
                    <span className={clsx("font-medium", getPositionColor(player.originalPosition))}>
                      {player.name}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {player.team !== 'FA' ? player.team : 'Free Agent'}
                    </span>
                    {player.rank && player.rank !== 999 && (
                      <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-1 rounded">
                        #{player.rank}
                      </span>
                    )}
                    {player.pick_no && (
                      <span className="text-xs text-green-600 dark:text-green-400">
                        Pick #{player.pick_no}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Empty bench positions */}
              {emptyBench.map((emptySlot, index) => (
                <div
                  key={`empty-bench-${emptySlot.slotNumber}`}
                  className={clsx(
                    "px-3 py-2 flex items-center justify-between bg-gray-100 dark:bg-gray-700/50",
                    bench.length + index !== bench.length + emptyBench.length - 1 && "border-b border-gray-200 dark:border-gray-700"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium px-2 py-1 rounded uppercase tracking-wide bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                      BENCH
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 italic">
                      Empty bench slot
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {rosterData.roster_settings && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div>
              <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">Roster Structure</div>
              <div className="space-y-1">
                {Object.entries(rosterData.roster_settings.starter_counts).map(([position, count]) => (
                  <div key={position} className="flex justify-between">
                    <span>{position}:</span>
                    <span>{count}</span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span>Bench:</span>
                  <span>{rosterData.roster_settings.bench_slots || 0}</span>
                </div>
                {rosterData.roster_settings.taxi_slots > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Shield className="w-3 h-3 text-blue-500" />
                      <span>Taxi:</span>
                    </div>
                    <span>{rosterData.roster_settings.taxi_slots}</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">Status Legend</div>
              <div className="space-y-1">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-green-500" />
                  <span>Drafted today</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Shield className="w-3 h-3 text-blue-500" />
                  <span>Taxi squad</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Cross className="w-3 h-3 text-red-500" />
                  <span>Injured Reserve</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-sm"></div>
                  <span>Empty slot</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRoster;
