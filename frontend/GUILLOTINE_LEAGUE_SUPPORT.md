# Guillotine League Support

## New Position Added: REC_FLEX

### What is REC_FLEX?
- **REC_FLEX** (Receiver Flex) is a new position type found in Guillotine leagues
- **Eligibility**: WR and TE players only (no RB like regular FLEX)
- **Purpose**: Provides additional flexibility for receiver-heavy lineups

### Guillotine League Roster Structure
Based on edgecdec's Guillotine League (ID: 1255160696174284800):

- **QB**: 3 slots
- **RB**: 3 slots  
- **WR**: 4 slots
- **TE**: 1 slot
- **FLEX**: 3 slots (RB/WR/TE eligible)
- **REC_FLEX**: 1 slot (WR/TE eligible) ← **NEW**
- **K**: 3 slots
- **DEF**: 3 slots
- **BN**: 6 bench slots

**Total**: 27 roster spots (21 starters + 6 bench)

## Code Changes Made

### 1. Updated `getAllStartersAndBench()` Function
- Added REC_FLEX position handling between FLEX and SUPER_FLEX
- **Player Eligibility**: `['WR', 'TE']` only
- **Processing Order**: Dedicated positions → FLEX → REC_FLEX → SUPER_FLEX → Bench

### 2. Updated `getStarterTypeDisplay()` Function
- Added `'REC_FLEX': 'R-FLEX${slotNumber > 1 ? slotNumber : ''}'`
- Shows as "R-FLEX" in the UI (shorter than "REC_FLEX")

### 3. Updated `getStarterTypeColor()` Function
- Added cyan color scheme for REC_FLEX: 
  - Light mode: `bg-cyan-100 text-cyan-700`
  - Dark mode: `bg-cyan-900/30 text-cyan-300`

### 4. Enhanced K and DEF Position Display
- Fixed K and DEF to show slot numbers when multiple (K1, K2, K3, etc.)
- Supports Guillotine league's 3 K and 3 DEF slots

## Position Processing Priority

1. **Dedicated Positions**: QB, RB, WR, TE, K, DEF
2. **FLEX**: RB/WR/TE eligible
3. **REC_FLEX**: WR/TE eligible ← **NEW**
4. **SUPER_FLEX**: QB/RB/WR/TE eligible
5. **Bench**: All remaining players

## Visual Design

- **REC_FLEX Badge**: Cyan color to distinguish from regular FLEX (indigo)
- **Empty Slots**: Shows "Empty - Need to draft" for unfilled REC_FLEX positions
- **Dark Mode**: Full support with appropriate color variants

## Testing

The MyRoster component now properly handles:
- ✅ REC_FLEX position allocation
- ✅ WR/TE eligibility for REC_FLEX
- ✅ Multiple K and DEF slots
- ✅ Empty REC_FLEX slot display
- ✅ Proper player deduplication across all flex positions
- ✅ Dark mode styling for new position

## Backward Compatibility

- All existing league types continue to work unchanged
- REC_FLEX logic only activates when `starterCounts['REC_FLEX'] > 0`
- No impact on standard, superflex, or dynasty leagues
