import { Clock, Shield, Cross } from 'lucide-react';
import { getPositionConfig } from '../constants/positions';

export const getStatusIcon = (status) => {
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

export const getStatusColor = (status) => {
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

export const getPositionColor = (position) => {
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

export const getStarterTypeDisplay = (starterType, slotNumber) => {
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

export const getStarterTypeColor = (starterType) => {
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

export const getAllStartersAndBench = (rosterData) => {
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
