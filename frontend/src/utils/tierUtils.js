/**
 * Utility functions for handling player tiers and top-tier detection
 */

/**
 * Calculate the minimum tier for each position from the available players
 */
export const calculateMinTiersByPosition = (positions) => {
  const minTiers = {};
  
  Object.keys(positions).forEach(posName => {
    const players = positions[posName] || [];
    if (players.length > 0) {
      const tiers = players
        .map(player => player.tier || 999)
        .filter(tier => tier !== 999);
      
      minTiers[posName] = tiers.length > 0 ? Math.min(...tiers) : 999;
    } else {
      minTiers[posName] = 999;
    }
  });
  
  return minTiers;
};

/**
 * Check if a player is in the top tier for their position
 */
export const isPlayerTopTier = (player, minTiers) => {
  if (!player || !player.tier || !player.position || !minTiers) {
    return false;
  }
  
  const playerTier = player.tier;
  const playerPosition = player.position;
  const minTierForPosition = minTiers[playerPosition];
  
  return playerTier === minTierForPosition && playerTier !== 999;
};