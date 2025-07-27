"""
Draft Service

This module handles all draft-related functionality including:
- Draft data processing and caching
- Manual rankings override management
- Player filtering and ranking logic
- Dynasty/keeper league handling
"""

import os
import json
import time
import sys
from datetime import datetime

# Add the parent directory to the path so we can import existing modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from Rankings.RankingsUtil import getPlayersDrafted
from Rankings.Constants import POS_QB, POS_RB, POS_WR, POS_TE, POS_K
from .sleeper_api import SleeperAPI
from .league_service import LeagueService


class DraftService:
    """Service class for managing draft data and rankings"""
    
    def __init__(self, rankings_service, default_draft_id=None):
        """Initialize DraftService with default settings"""
        self.last_update = None
        self.cached_data = None
        self.cache_duration = 30  # 30 seconds cache
        self.current_draft_id = default_draft_id  # Will be set via API
        self.manual_rankings_override = None  # Store manual ranking selection
        self.override_file = 'manual_rankings_override.json'  # Persistence file
        self.rankings_service = rankings_service
        
        # Load manual override from file if it exists
        self._load_manual_override()
        
        print(f"📊 Default Draft ID: {self.current_draft_id}")
        if self.manual_rankings_override:
            print(f"🎯 Loaded manual override: {self.manual_rankings_override}")
    
    def _load_manual_override(self):
        """Load manual override from file"""
        try:
            if os.path.exists(self.override_file):
                with open(self.override_file, 'r') as f:
                    data = json.load(f)
                    # Handle both None/null and list data
                    if data and isinstance(data, list) and len(data) == 2:
                        self.manual_rankings_override = tuple(data)
                        print(f"🔄 Loaded manual override: {self.manual_rankings_override}")
                    else:
                        self.manual_rankings_override = None
        except Exception as e:
            print(f"⚠️  Error loading manual override: {e}")
            self.manual_rankings_override = None
    
    def _save_manual_override(self):
        """Save manual override to file"""
        try:
            with open(self.override_file, 'w') as f:
                json.dump(list(self.manual_rankings_override) if self.manual_rankings_override else None, f)
        except Exception as e:
            print(f"⚠️  Error saving manual override: {e}")
    
    def set_draft_id(self, draft_id):
        """Set the current draft ID and clear cache"""
        # Don't clear manual override when switching drafts - it should persist
        # Manual override is a user preference, not draft-specific
        self.current_draft_id = draft_id
        self.cached_data = None
        self.last_update = None
    
    def set_manual_rankings(self, scoring_format, league_type):
        """Set manual rankings override"""
        self.manual_rankings_override = (scoring_format, league_type)
        self._save_manual_override()
        # Clear cache to force refresh with new rankings
        self.cached_data = None
        self.last_update = None
        print(f"🎯 Set manual rankings override: {scoring_format} {league_type}")
    
    def clear_manual_rankings(self):
        """Clear manual rankings override (return to auto-detection)"""
        self.manual_rankings_override = None
        self._save_manual_override()
        # Clear cache to force refresh with auto-detected rankings
        self.cached_data = None
        self.last_update = None
        print(f"🤖 Cleared manual rankings override, returning to auto-detection")
    
    def get_draft_data(self, draft_id=None):
        """Get current draft data with caching"""
        if draft_id:
            self.set_draft_id(draft_id)
        
        print(f"🔍 DEBUG: get_draft_data called with draft_id={draft_id}, current_draft_id={self.current_draft_id}")
        
        current_time = time.time()
        
        # Return cached data if still valid
        if (self.cached_data and self.last_update and 
            current_time - self.last_update < self.cache_duration and
            self.cached_data.get('draft_id') == self.current_draft_id):
            print(f"🔍 DEBUG: Returning cached data for draft {self.current_draft_id}")
            return self.cached_data
        
        try:
            # Get league context using helper service
            print(f"🔍 DEBUG: Getting league context for draft {self.current_draft_id}")
            
            league_info = LeagueService.get_league_context(draft_id=self.current_draft_id)
            if not league_info:
                return {'error': 'League information not found'}
            
            # Get current rankings using rankings service
            rankings_result = self.rankings_service.get_current_rankings(league_info)
            player_rankings = rankings_result['rankings_list']
            
            # Check if this is a dynasty/keeper league
            is_dynasty_keeper = SleeperAPI.is_dynasty_or_keeper_league(league_info)
            rostered_players = set()
            
            if is_dynasty_keeper and league_info.get('league_id'):
                # Get all rostered players to exclude from rankings
                rosters = SleeperAPI.get_league_rosters(league_info.get('league_id'))
                all_players = SleeperAPI.get_all_players()
                
                # Collect all rostered player IDs
                for roster in rosters:
                    if roster.get('players'):
                        rostered_players.update(roster['players'])
                
                print(f"Dynasty/Keeper league detected: {len(rostered_players)} players already rostered")
            
            # Get drafted players (from current draft)
            players_drafted = getPlayersDrafted(self.current_draft_id)
            
            # Filter out drafted players and rostered players (for dynasty/keeper)
            available_players = []
            filtered_count = 0
            
            for player in player_rankings:
                is_drafted = False
                is_rostered = False
                
                # Check if drafted in current draft
                for drafted in players_drafted:
                    if drafted.pos.upper() == player.pos.upper():
                        # Use smart name matching for drafted players too
                        if (drafted.name.lower() == player.name.lower() or 
                            self._names_match(drafted.name, player.name)):
                            is_drafted = True
                            break
                
                # Check if already rostered (dynasty/keeper only)
                if is_dynasty_keeper and not is_drafted:
                    is_rostered = self._is_player_rostered(player, rostered_players, SleeperAPI.get_all_players())
                
                if not is_drafted and not is_rostered:
                    available_players.append(player)
                elif is_rostered:
                    filtered_count += 1
            
            # Organize by position
            positions_data = {
                'QB': self._get_top_players_by_position([POS_QB], available_players, 5),
                'RB': self._get_top_players_by_position([POS_RB], available_players, 5),
                'WR': self._get_top_players_by_position([POS_WR], available_players, 5),
                'TE': self._get_top_players_by_position([POS_TE], available_players, 5),
                'K': self._get_top_players_by_position([POS_K], available_players, 5),
                'FLEX': self._get_top_players_by_position([POS_RB, POS_WR, POS_TE], available_players, 10),
                'ALL': self._get_top_players_by_position([POS_QB, POS_RB, POS_WR, POS_TE, POS_K], available_players, 10)
            }
            
            # Convert available_players to dictionaries for JSON serialization
            available_players_dict = []
            for player in available_players:
                available_players_dict.append({
                    'name': player.name,
                    'position': player.pos,
                    'team': player.team,
                    'rank': player.rank,
                    'tier': getattr(player, 'tier', 1)
                })
            
            self.cached_data = {
                'positions': positions_data,
                'available_players': available_players_dict,  # Use converted dictionaries
                'total_available': len(available_players),
                'total_drafted': len(players_drafted),
                'total_rostered': len(rostered_players) if is_dynasty_keeper else 0,
                'filtered_count': filtered_count,
                'is_dynasty_keeper': is_dynasty_keeper,
                'league_name': league_info.get('name') if league_info else 'Unknown',
                'last_updated': datetime.now().isoformat(),
                'draft_id': self.current_draft_id,
                'draft_info': SleeperAPI.get_draft_info(self.current_draft_id)  # Get draft info for completeness
            }
            
            self.last_update = current_time
            return self.cached_data
            
        except Exception as e:
            return {'error': str(e)}
    
    def _is_player_rostered(self, player, rostered_player_ids, all_players_data):
        """Check if a player from our rankings is already rostered in the league"""
        if not rostered_player_ids or not all_players_data:
            return False
        
        # Get player info (keep original case for name matching function)
        player_name = player.name.strip()
        player_pos = player.pos.strip().upper()
        
        for player_id in rostered_player_ids:
            sleeper_player = all_players_data.get(player_id, {})
            if not sleeper_player:
                continue
            
            sleeper_name = sleeper_player.get('full_name', '').strip()
            sleeper_pos = sleeper_player.get('position', '').strip().upper()
            
            # Only check players with matching positions
            if sleeper_pos != player_pos:
                continue
            
            # Direct name match (case insensitive)
            if player_name.lower() == sleeper_name.lower():
                return True
            
            # Try name variations (handles suffixes, etc.)
            if self._names_match(player_name, sleeper_name):
                return True
        
        return False
    
    def get_player_ranking(self, player_name, rankings_data):
        """Get ranking information for a player"""
        # Try exact match first
        name_key = player_name.lower().strip()
        if name_key in rankings_data:
            return rankings_data[name_key]
        
        # Try name variations
        name_variations = self._get_nickname_variations(name_key)
        for variation in name_variations:
            if variation in rankings_data:
                return rankings_data[variation]
        
        # Try partial matching for names with suffixes
        normalized_name = self._normalize_name(player_name)
        for ranking_name, ranking_info in rankings_data.items():
            if self._names_match(player_name, ranking_info['original_name']):
                return ranking_info
        
        # Default if not found
        return {'rank': 999, 'tier': 10}

    def _get_nickname_variations(self, name):
        """Get common nickname variations for a player name"""
        # Common nickname mappings in fantasy football
        nickname_map = {
            # Format: "official_name": ["nickname1", "nickname2"]
            "marquise brown": ["hollywood brown", "hollywood"],
            "hollywood brown": ["marquise brown"],
            "calvin ridley": ["calvin ridley jr"],
            "calvin ridley jr": ["calvin ridley"],
            "dj moore": ["d.j. moore", "dj moore"],
            "d.j. moore": ["dj moore"],
            "aj brown": ["a.j. brown"],
            "a.j. brown": ["aj brown"],
            "cj stroud": ["c.j. stroud"],
            "c.j. stroud": ["cj stroud"],
            # Add more as needed
        }
        
        name_lower = name.lower().strip()
        variations = [name_lower]  # Always include the original
        
        # Add mapped variations
        if name_lower in nickname_map:
            variations.extend(nickname_map[name_lower])
        
        return variations
    
    def _names_match(self, name1, name2):
        """Check if two names are likely the same player"""
        if name1 == name2:
            return True
        
        # Normalize names for comparison
        name1_norm = self._normalize_name(name1)
        name2_norm = self._normalize_name(name2)
        
        if name1_norm == name2_norm:
            return True
        
        # Check nickname variations
        name1_variations = self._get_nickname_variations(name1_norm)
        name2_variations = self._get_nickname_variations(name2_norm)
        
        # Check if any variation of name1 matches any variation of name2
        for var1 in name1_variations:
            for var2 in name2_variations:
                if var1 == var2:
                    return True
        
        # Split names and check various combinations
        parts1 = name1_norm.split()
        parts2 = name2_norm.split()
        
        if len(parts1) >= 2 and len(parts2) >= 2:
            # Check first and last name match (ignoring suffixes)
            if parts1[0] == parts2[0] and parts1[-1] == parts2[-1]:
                return True
            
            # Check if one name is a subset of the other (handles suffixes like Jr., II, Sr.)
            if len(parts1) >= 2 and len(parts2) >= 2:
                # Remove common suffixes and compare
                clean_parts1 = [p for p in parts1 if p not in ['jr', 'sr', '2', '3', '4']]
                clean_parts2 = [p for p in parts2 if p not in ['jr', 'sr', '2', '3', '4']]
                
                if len(clean_parts1) >= 2 and len(clean_parts2) >= 2:
                    if clean_parts1[0] == clean_parts2[0] and clean_parts1[-1] == clean_parts2[-1]:
                        return True
        
        return False
    
    def _normalize_name(self, name):
        """Normalize a name for comparison"""
        # Convert to lowercase and remove extra spaces
        normalized = ' '.join(name.lower().strip().split())
        
        # Handle common variations
        replacements = {
            'jr.': 'jr',
            'sr.': 'sr',
            'iii': '3',
            'ii': '2',
            'iv': '4'
        }
        
        for old, new in replacements.items():
            normalized = normalized.replace(old, new)
        
        return normalized
    
    def _get_top_players_by_position(self, positions, player_rankings, count=5):
        """Get top players for specific positions"""
        players = []
        pos_count = 0
        i = 0
        
        while pos_count < count and i < len(player_rankings):
            if player_rankings[i].pos in positions:
                player = player_rankings[i]
                players.append({
                    'name': player.name,
                    'position': player.pos,
                    'team': player.team,
                    'rank': player.rank,  # Original absolute rank from CSV
                    'target_rank': pos_count + 1,  # Position among remaining players in this section
                    'tier': getattr(player, 'tier', 1)
                })
                pos_count += 1
            i += 1
        
        return players
