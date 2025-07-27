from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.utils import secure_filename
import sys
import os
import time
import shutil
import requests
from datetime import datetime

# Add the parent directory to the path so we can import existing modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from Rankings.ParseRankings import parseCSV
from Rankings.RankingsUtil import getPlayersDrafted, printTopXPlayersForPositions
from Rankings.Constants import POS_QB, POS_RB, POS_WR, POS_TE, POS_K, RANKINGS_OUTPUT_DIRECTORY
from Rankings.PlayerRankings import Player
from Rankings.RankingsManager import RankingsManager
from EditMe import DRAFT_ID, FILE_NAME

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize rankings manager
rankings_manager = RankingsManager()

# Auto-initialize rankings on startup
def initialize_default_rankings():
    """Initialize default rankings if none exist"""
    try:
        # Check if main rankings file exists
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        main_rankings_path = os.path.join(base_dir, FILE_NAME)
        
        print(f"🔍 Checking for rankings file: {main_rankings_path}")
        
        if not os.path.exists(main_rankings_path):
            print("📊 No main rankings file found, looking for existing rankings...")
            
            # Look for any existing FantasyPros file to copy as default
            rankings_dir = os.path.join(base_dir, 'Rankings', 'PopulatedFromSites')
            
            if os.path.exists(rankings_dir):
                # Priority order for default rankings
                default_files = [
                    'FantasyPros_Rankings_half_ppr_superflex_v2.csv',
                    'FantasyPros_Rankings_ppr_superflex_v2.csv', 
                    'FantasyPros_Rankings_half_ppr_standard_v2.csv',
                    'FantasyPros_Rankings.csv'
                ]
                
                for filename in default_files:
                    source_path = os.path.join(rankings_dir, filename)
                    if os.path.exists(source_path):
                        shutil.copy2(source_path, main_rankings_path)
                        print(f"✅ Initialized rankings with {filename}")
                        return
                        
                print("⚠️  No suitable FantasyPros rankings files found")
            else:
                print(f"⚠️  Rankings directory not found: {rankings_dir}")
        else:
            print(f"✅ Main rankings file exists: {FILE_NAME}")
            
    except Exception as e:
        print(f"⚠️  Error initializing rankings: {e}")

# Initialize on startup
try:
    initialize_default_rankings()
except Exception as e:
    print(f"⚠️  Failed to initialize rankings: {e}")

class SleeperAPI:
    """Helper class for Sleeper API calls"""
    
    BASE_URL = "https://api.sleeper.app/v1"
    _players_cache = None
    _players_cache_time = None
    CACHE_DURATION = 3600  # 1 hour cache for player data
    
    @staticmethod
    def get_user(username):
        """Get user info by username"""
        try:
            response = requests.get(f"{SleeperAPI.BASE_URL}/user/{username}")
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            print(f"Error getting user: {e}")
            return None
    
    @staticmethod
    def get_user_leagues(user_id, season="2025"):
        """Get all leagues for a user in a given season"""
        try:
            response = requests.get(f"{SleeperAPI.BASE_URL}/user/{user_id}/leagues/nfl/{season}")
            if response.status_code == 200:
                return response.json()
            return []
        except Exception as e:
            print(f"Error getting user leagues: {e}")
            return []
    
    @staticmethod
    def get_league_drafts(league_id):
        """Get all drafts for a league"""
        try:
            response = requests.get(f"{SleeperAPI.BASE_URL}/league/{league_id}/drafts")
            if response.status_code == 200:
                return response.json()
            return []
        except Exception as e:
            print(f"Error getting league drafts: {e}")
            return []
    
    @staticmethod
    def get_draft_info(draft_id):
        """Get draft information"""
        try:
            response = requests.get(f"{SleeperAPI.BASE_URL}/draft/{draft_id}")
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            print(f"Error getting draft info: {e}")
            return None
    
    @staticmethod
    def get_league_info(league_id):
        """Get league information"""
        try:
            response = requests.get(f"{SleeperAPI.BASE_URL}/league/{league_id}")
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            print(f"Error getting league info: {e}")
            return None
    
    @staticmethod
    def detect_league_format(league_info):
        """Detect scoring format and league type from Sleeper league settings"""
        if not league_info:
            return 'half_ppr', 'superflex'  # Default fallback
        
        # Detect scoring format
        scoring_settings = league_info.get('scoring_settings', {})
        rec_points = scoring_settings.get('rec', 0)
        
        if rec_points == 0:
            scoring_format = 'standard'
        elif rec_points == 0.5:
            scoring_format = 'half_ppr'
        elif rec_points == 1.0:
            scoring_format = 'ppr'
        else:
            scoring_format = 'half_ppr'  # Default for unusual values
        
        # Detect league type (superflex vs standard)
        roster_positions = league_info.get('roster_positions', [])
        qb_count = roster_positions.count('QB')
        has_superflex = 'SUPER_FLEX' in roster_positions
        
        # If more than 1 QB or has SUPER_FLEX position, it's superflex
        if qb_count > 1 or has_superflex:
            league_type = 'superflex'
        else:
            league_type = 'standard'
        
        print(f"🏈 Detected league format: {scoring_format} {league_type}")
        print(f"   📊 Scoring: rec={rec_points} -> {scoring_format}")
        print(f"   🏟️  Roster: QB={qb_count}, SUPER_FLEX={has_superflex} -> {league_type}")
        
        return scoring_format, league_type
    
    @staticmethod
    def get_league_rosters(league_id):
        """Get all rosters for a league"""
        try:
            response = requests.get(f"{SleeperAPI.BASE_URL}/league/{league_id}/rosters")
            if response.status_code == 200:
                return response.json()
            return []
        except Exception as e:
            print(f"Error getting league rosters: {e}")
            return []
    
    @staticmethod
    def get_league_users(league_id):
        """Get all users in a league"""
        try:
            response = requests.get(f"{SleeperAPI.BASE_URL}/league/{league_id}/users")
            if response.status_code == 200:
                return response.json()
            return []
        except Exception as e:
            print(f"Error getting league users: {e}")
            return []
    
    @staticmethod
    def get_all_players():
        """Get all NFL players with caching"""
        current_time = time.time()
        
        # Return cached data if still valid
        if (SleeperAPI._players_cache and SleeperAPI._players_cache_time and 
            current_time - SleeperAPI._players_cache_time < SleeperAPI.CACHE_DURATION):
            return SleeperAPI._players_cache
        
        try:
            response = requests.get(f"{SleeperAPI.BASE_URL}/players/nfl")
            if response.status_code == 200:
                SleeperAPI._players_cache = response.json()
                SleeperAPI._players_cache_time = current_time
                return SleeperAPI._players_cache
            return {}
        except Exception as e:
            print(f"Error getting all players: {e}")
            return {}
    
    @staticmethod
    def is_dynasty_or_keeper_league(league_info):
        """Determine if a league is dynasty or keeper based on league settings"""
        if not league_info:
            return False
        
        settings = league_info.get('settings', {})
        
        # Check for dynasty indicators
        league_type = settings.get('type', 0)
        if league_type == 2:  # Dynasty league type
            return True
        
        # Check for keeper indicators
        max_keepers = settings.get('max_keepers', 0)
        if max_keepers > 0:
            return True
        
        # Check for taxi squad (dynasty feature)
        taxi_slots = settings.get('taxi_slots', 0)
        if taxi_slots > 0:
            return True
        
        # Check if there's a previous league ID (continuation)
        if league_info.get('previous_league_id'):
            return True
        
        # Check draft metadata for dynasty scoring
        draft_id = league_info.get('draft_id')
        if draft_id:
            draft_info = SleeperAPI.get_draft_info(draft_id)
            if draft_info and draft_info.get('metadata', {}).get('scoring_type', '').startswith('dynasty'):
                return True
        
        return False

class DraftAPI:
    def __init__(self):
        self.last_update = None
        self.cached_data = None
        self.cache_duration = 30  # 30 seconds cache
        self.current_draft_id = DRAFT_ID  # Default from EditMe.py
    
    def set_draft_id(self, draft_id):
        """Set the current draft ID and clear cache"""
        self.current_draft_id = draft_id
        self.cached_data = None
        self.last_update = None
    
    def get_draft_data(self, draft_id=None):
        """Get current draft data with caching"""
        if draft_id:
            self.set_draft_id(draft_id)
        
        current_time = time.time()
        
        # Return cached data if still valid
        if (self.cached_data and self.last_update and 
            current_time - self.last_update < self.cache_duration and
            self.cached_data.get('draft_id') == self.current_draft_id):
            return self.cached_data
        
        try:
            # Get draft info to determine league settings
            draft_info = SleeperAPI.get_draft_info(self.current_draft_id)
            if not draft_info:
                return {'error': 'Draft not found'}
            
            league_id = draft_info.get('league_id')
            league_info = SleeperAPI.get_league_info(league_id) if league_id else None
            
            # Detect appropriate rankings format based on league settings
            scoring_format, league_type = SleeperAPI.detect_league_format(league_info)
            
            # Get the appropriate rankings file
            rankings_filename = rankings_manager.get_rankings_filename(scoring_format, league_type)
            
            # Try multiple possible locations for the rankings file
            possible_paths = [
                os.path.join(RANKINGS_OUTPUT_DIRECTORY, rankings_filename),  # backend/PopulatedFromSites/
                os.path.join('..', 'Rankings', RANKINGS_OUTPUT_DIRECTORY, rankings_filename),  # Rankings/PopulatedFromSites/
                os.path.join('..', RANKINGS_OUTPUT_DIRECTORY, rankings_filename)  # PopulatedFromSites/
            ]
            
            rankings_file = None
            for path in possible_paths:
                if os.path.exists(path):
                    rankings_file = path
                    break
            
            # Fallback to Rankings.csv if specific format not found
            if not rankings_file:
                parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                rankings_file = os.path.join(parent_dir, FILE_NAME)
                print(f"⚠️  Specific rankings not found, falling back to: {rankings_file}")
            
            if not os.path.exists(rankings_file):
                return {'error': f'Rankings file not found: {rankings_file}'}
            
            print(f"📊 Using rankings file: {os.path.basename(rankings_file)}")
            player_rankings = parseCSV(rankings_file)
            
            # Check if this is a dynasty/keeper league
            is_dynasty_keeper = SleeperAPI.is_dynasty_or_keeper_league(league_info)
            rostered_players = set()
            
            if is_dynasty_keeper and league_id:
                # Get all rostered players to exclude from rankings
                rosters = SleeperAPI.get_league_rosters(league_id)
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
                'draft_info': draft_info
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
    
    def _get_player_ranking(self, player_name, rankings_data):
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

# Initialize the API
draft_api = DraftAPI()

@app.route('/api/user/<username>')
def get_user_info(username):
    """Get user information by username"""
    user_info = SleeperAPI.get_user(username)
    if user_info:
        return jsonify(user_info)
    else:
        return jsonify({'error': 'User not found'}), 404

@app.route('/api/user/<username>/leagues')
def get_user_leagues(username):
    """Get all leagues for a user"""
    season = request.args.get('season', '2025')
    
    # First get user info
    user_info = SleeperAPI.get_user(username)
    if not user_info:
        return jsonify({'error': 'User not found'}), 404
    
    # Get user leagues
    leagues = SleeperAPI.get_user_leagues(user_info['user_id'], season)
    
    # Enhance league data with draft information
    enhanced_leagues = []
    for league in leagues:
        drafts = SleeperAPI.get_league_drafts(league['league_id'])
        league['drafts'] = drafts
        enhanced_leagues.append(league)
    
    return jsonify({
        'user': user_info,
        'leagues': enhanced_leagues,
        'season': season
    })

@app.route('/api/league/<league_id>/drafts')
def get_league_drafts(league_id):
    """Get all drafts for a league"""
    drafts = SleeperAPI.get_league_drafts(league_id)
    return jsonify(drafts)

@app.route('/api/draft/<draft_id>/info')
def get_draft_info(draft_id):
    """Get draft information"""
    draft_info = SleeperAPI.get_draft_info(draft_id)
    if draft_info:
        return jsonify(draft_info)
    else:
        return jsonify({'error': 'Draft not found'}), 404

@app.route('/api/draft/status')
def get_draft_status():
    """Get current draft status and available players"""
    draft_id = request.args.get('draft_id')
    return jsonify(draft_api.get_draft_data(draft_id))

@app.route('/api/draft/refresh')
def refresh_draft_data():
    """Force refresh of draft data"""
    draft_id = request.args.get('draft_id')
    draft_api.cached_data = None
    draft_api.last_update = None
    return jsonify(draft_api.get_draft_data(draft_id))

@app.route('/api/league/<league_id>/my-roster')
def get_my_roster(league_id):
    """Get the current user's roster for a league with starter/bench breakdown"""
    username = request.args.get('username')
    draft_id = request.args.get('draft_id')  # Optional: to include current draft picks
    
    if not username:
        return jsonify({'error': 'username parameter is required'}), 400
    
    try:
        # Get league info for roster settings
        league_response = requests.get(f"{SleeperAPI.BASE_URL}/league/{league_id}")
        league_response.raise_for_status()
        league_info = league_response.json()
        roster_positions = league_info.get('roster_positions', [])
        
        # Count starter positions
        starter_counts = {}
        bench_slots = 0
        for pos in roster_positions:
            if pos == 'BN':
                bench_slots += 1
            else:
                # Handle FLEX positions
                if pos == 'FLEX':
                    pos = 'FLEX'  # Keep as FLEX for now
                elif pos == 'SUPER_FLEX':
                    pos = 'SUPER_FLEX'
                starter_counts[pos] = starter_counts.get(pos, 0) + 1
        
        # Get league users to find user_id
        users = SleeperAPI.get_league_users(league_id)
        user_id = None
        for user in users:
            # Check both username and display_name
            user_username = user.get('username', '').lower() if user.get('username') else ''
            user_display = user.get('display_name', '').lower() if user.get('display_name') else ''
            username_lower = username.lower()
            
            if user_username == username_lower or user_display == username_lower:
                user_id = user.get('user_id')
                break
        
        if not user_id:
            return jsonify({'error': f'User {username} not found in league'}), 404
        
        # Get league rosters to find user's roster
        rosters = SleeperAPI.get_league_rosters(league_id)
        user_roster = None
        for roster in rosters:
            if roster.get('owner_id') == user_id:
                user_roster = roster
                break
        
        if not user_roster:
            return jsonify({'error': f'Roster not found for user {username}'}), 404
        
        # Get all players data
        all_players = SleeperAPI.get_all_players()
        
        # Get rankings data to determine starter priority
        rankings_data = {}
        try:
            # Get league info to determine appropriate rankings format
            league_info = SleeperAPI.get_league_info(league_id)
            scoring_format, league_type = SleeperAPI.detect_league_format(league_info)
            
            # Get the appropriate rankings file
            rankings_filename = rankings_manager.get_rankings_filename(scoring_format, league_type)
            
            # Try multiple possible locations for the rankings file
            possible_paths = [
                os.path.join(RANKINGS_OUTPUT_DIRECTORY, rankings_filename),  # backend/PopulatedFromSites/
                os.path.join('..', 'Rankings', RANKINGS_OUTPUT_DIRECTORY, rankings_filename),  # Rankings/PopulatedFromSites/
                os.path.join('..', RANKINGS_OUTPUT_DIRECTORY, rankings_filename)  # PopulatedFromSites/
            ]
            
            rankings_file = None
            for path in possible_paths:
                if os.path.exists(path):
                    rankings_file = path
                    break
            
            # Fallback to Rankings.csv if specific format not found
            if not rankings_file:
                parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                rankings_file = os.path.join(parent_dir, FILE_NAME)
            
            player_rankings = parseCSV(rankings_file)
            for player in player_rankings:
                # Create a key that matches our player matching logic
                rankings_data[player.name.lower().strip()] = {
                    'rank': player.rank,
                    'tier': getattr(player, 'tier', 1),
                    'original_name': player.name
                }
        except Exception as e:
            print(f"Error loading rankings: {e}")
        
        # Create a temporary DraftAPI instance for name matching
        temp_draft_api = DraftAPI()
        
        # Get current draft picks if draft_id provided
        drafted_players = []
        if draft_id:
            try:
                draft_picks_response = requests.get(f"{SleeperAPI.BASE_URL}/draft/{draft_id}/picks")
                if draft_picks_response.status_code == 200:
                    picks = draft_picks_response.json()
                    # Filter picks for this user
                    for pick in picks:
                        if pick.get('picked_by') == user_id and pick.get('player_id'):
                            player_data = all_players.get(pick['player_id'], {})
                            if player_data:
                                player_name = player_data.get('full_name', 'Unknown')
                                rank_info = temp_draft_api._get_player_ranking(player_name, rankings_data)
                                
                                drafted_players.append({
                                    'player_id': pick['player_id'],
                                    'name': player_name,
                                    'position': player_data.get('position', 'Unknown'),
                                    'team': player_data.get('team', 'FA'),
                                    'status': 'drafted',
                                    'pick_no': pick.get('pick_no'),
                                    'round': pick.get('round'),
                                    'rank': rank_info['rank'],
                                    'tier': rank_info['tier']
                                })
            except Exception as e:
                print(f"Error fetching draft picks: {e}")
        
        # Process existing roster players
        roster_players = []
        player_ids = user_roster.get('players', [])
        taxi_player_ids = set(user_roster.get('taxi', []))
        reserve_player_ids = set(user_roster.get('reserve', []))
        
        for player_id in player_ids:
            player_data = all_players.get(player_id, {})
            if player_data:
                player_name = player_data.get('full_name', 'Unknown')
                rank_info = temp_draft_api._get_player_ranking(player_name, rankings_data)
                
                # Determine status based on which arrays the player appears in
                if player_id in reserve_player_ids:
                    status = 'reserve'
                elif player_id in taxi_player_ids:
                    status = 'taxi'
                else:
                    status = 'rostered'
                
                roster_players.append({
                    'player_id': player_id,
                    'name': player_name,
                    'position': player_data.get('position', 'Unknown'),
                    'team': player_data.get('team', 'FA'),
                    'status': status,
                    'rank': rank_info['rank'],
                    'tier': rank_info['tier']
                })
        
        # Combine rostered and drafted players
        all_players_list = roster_players + drafted_players
        
        # Group by position
        positions = {}
        for player in all_players_list:
            pos = player['position']
            if pos not in positions:
                positions[pos] = []
            positions[pos].append(player)
        
        # Sort players within each position by rank (lower rank = better)
        for pos in positions:
            positions[pos].sort(key=lambda x: x['rank'] if x['rank'] != 999 else 9999)
        
        # Calculate position counts
        position_counts = {}
        for pos, players in positions.items():
            position_counts[pos] = len(players)
        
        return jsonify({
            'username': username,
            'league_id': league_id,
            'roster_id': user_roster.get('roster_id'),
            'total_players': len(all_players_list),
            'positions': positions,
            'position_counts': position_counts,
            'roster_settings': {
                'starter_counts': starter_counts,
                'bench_slots': bench_slots,
                'taxi_slots': len(taxi_player_ids),
                'reserve_slots': len(reserve_player_ids)
            },
            'drafted_this_draft': len(drafted_players)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/draft/set', methods=['POST'])
def set_current_draft():
    """Set the current draft ID"""
    data = request.get_json()
    draft_id = data.get('draft_id')
    
    if not draft_id:
        return jsonify({'error': 'draft_id is required'}), 400
    
    draft_api.set_draft_id(draft_id)
    return jsonify({'success': True, 'draft_id': draft_id})

# Main Draft API Endpoint
@app.route('/api/draft/<draft_id>')
def get_draft_data(draft_id):
    """Get comprehensive draft data including rankings and available players"""
    try:
        # Set the draft ID
        draft_api.set_draft_id(draft_id)
        
        # Get the draft data (this will load rankings automatically)
        draft_data = draft_api.get_draft_data()
        
        if 'error' in draft_data:
            return jsonify(draft_data), 400
            
        return jsonify(draft_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/draft')
def get_current_draft_data():
    """Get current draft data"""
    try:
        if not draft_api.current_draft_id:
            return jsonify({'error': 'No active draft set'}), 400
            
        draft_data = draft_api.get_draft_data()
        return jsonify(draft_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Rankings Management API Endpoints
@app.route('/api/rankings/status')
def get_rankings_status():
    """Get current rankings status and metadata"""
    try:
        status = rankings_manager.get_update_status()
        return jsonify(status)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/rankings/formats')
def get_available_formats():
    """Get available ranking formats"""
    try:
        formats = rankings_manager.get_available_formats()
        return jsonify(formats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/rankings/custom')
def get_custom_rankings():
    """Get list of custom uploaded rankings"""
    try:
        custom = rankings_manager.get_custom_rankings_list()
        return jsonify(custom)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/rankings/current')
def get_current_rankings():
    """Get currently active rankings"""
    try:
        # Get current rankings based on active format
        rankings = rankings_manager.get_rankings()
        if rankings is not None:
            # Convert DataFrame to list of dictionaries
            rankings_list = rankings.to_dict('records')
            return jsonify(rankings_list)
        else:
            return jsonify([])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/rankings/current-format', methods=['GET'])
def get_current_rankings_format():
    """Get the current rankings format being used based on league settings"""
    try:
        draft_id = request.args.get('draft_id', draft_api.current_draft_id)
        
        # Get draft and league info
        draft_info = SleeperAPI.get_draft_info(draft_id)
        if not draft_info:
            return jsonify({'error': 'Draft not found'}), 404
        
        league_id = draft_info.get('league_id')
        league_info = SleeperAPI.get_league_info(league_id) if league_id else None
        
        # Detect format
        scoring_format, league_type = SleeperAPI.detect_league_format(league_info)
        
        # Get filename
        rankings_filename = rankings_manager.get_rankings_filename(scoring_format, league_type)
        
        # Try multiple possible locations for the rankings file
        possible_paths = [
            os.path.join(RANKINGS_OUTPUT_DIRECTORY, rankings_filename),  # backend/PopulatedFromSites/
            os.path.join('..', 'Rankings', RANKINGS_OUTPUT_DIRECTORY, rankings_filename),  # Rankings/PopulatedFromSites/
            os.path.join('..', RANKINGS_OUTPUT_DIRECTORY, rankings_filename)  # PopulatedFromSites/
        ]
        
        rankings_file = None
        for path in possible_paths:
            if os.path.exists(path):
                rankings_file = path
                break
        
        file_exists = rankings_file is not None
        
        return jsonify({
            'scoring_format': scoring_format,
            'league_type': league_type,
            'filename': rankings_filename,
            'file_exists': file_exists,
            'file_path': rankings_file if file_exists else None,
            'league_name': league_info.get('name') if league_info else 'Unknown'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/rankings/update', methods=['POST'])
def update_rankings():
    """Update FantasyPros rankings for all formats"""
    try:
        # Check if update is already in progress
        if rankings_manager.update_in_progress:
            # Reset the flag if it's been stuck for more than 10 minutes
            if hasattr(rankings_manager, 'last_update_start'):
                time_since_start = time.time() - rankings_manager.last_update_start
                if time_since_start > 600:  # 10 minutes
                    print("⚠️  Resetting stuck update flag...")
                    rankings_manager.update_in_progress = False
                else:
                    return jsonify({
                        'success': False, 
                        'message': 'Rankings update already in progress',
                        'in_progress': True
                    })
            else:
                # No timestamp, assume it's stuck and reset
                rankings_manager.update_in_progress = False
        
        # Mark start time
        rankings_manager.last_update_start = time.time()
        
        # Start async update
        result = rankings_manager.update_all_rankings(background=True)
        return jsonify({'success': result, 'message': 'Rankings update started'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/rankings/update/<scoring>/<format_type>', methods=['POST'])
def update_specific_rankings(scoring, format_type):
    """Update specific ranking format"""
    try:
        # For now, just trigger a full update
        result = rankings_manager.update_all_rankings(background=True)
        return jsonify({'success': result, 'message': f'Update started for {scoring} {format_type}'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/rankings/select', methods=['POST'])
def select_rankings():
    """Select which rankings to use"""
    try:
        data = request.get_json()
        ranking_type = data.get('type')  # 'fantasypros' or 'custom'
        ranking_id = data.get('id')      # format key or custom file ID
        
        if ranking_type == 'fantasypros':
            # Parse format key (e.g., "half_ppr_superflex")
            parts = ranking_id.split('_')
            if len(parts) >= 2:
                scoring = '_'.join(parts[:-1])  # e.g., "half_ppr"
                format_type = parts[-1]         # e.g., "superflex"
                
                # Get rankings for this format
                rankings = rankings_manager.get_rankings(scoring, format_type)
                if rankings is not None:
                    # Copy to main rankings file
                    filename = rankings_manager.get_rankings_filename(scoring, format_type)
                    source_path = os.path.join(RANKINGS_OUTPUT_DIRECTORY, filename)
                    dest_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), FILE_NAME)
                    
                    if os.path.exists(source_path):
                        shutil.copy2(source_path, dest_path)
                        return jsonify({'success': True, 'message': f'Selected {scoring} {format_type} rankings'})
                    else:
                        return jsonify({'error': f'Rankings file not found: {filename}'}), 404
                else:
                    return jsonify({'error': f'Could not load {scoring} {format_type} rankings'}), 404
            else:
                return jsonify({'error': 'Invalid format key'}), 400
                
        elif ranking_type == 'custom':
            # Load custom rankings
            rankings = rankings_manager._load_custom_rankings(ranking_id)
            if rankings is not None:
                # Save to main rankings file
                dest_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), FILE_NAME)
                rankings.to_csv(dest_path, index=False)
                return jsonify({'success': True, 'message': f'Selected custom rankings: {ranking_id}'})
            else:
                return jsonify({'error': f'Could not load custom rankings: {ranking_id}'}), 404
        else:
            return jsonify({'error': 'Invalid ranking type'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/rankings/upload', methods=['POST'])
def upload_custom_rankings():
    """Upload custom rankings CSV file"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
            
        if not file.filename.endswith('.csv'):
            return jsonify({'error': 'File must be a CSV'}), 400
            
        # Get metadata
        name = request.form.get('name', file.filename)
        description = request.form.get('description', '')
        
        # Save file temporarily
        temp_path = os.path.join('/tmp', secure_filename(file.filename))
        file.save(temp_path)
        
        # Upload using rankings manager
        result = rankings_manager.upload_custom_rankings(temp_path, name, description)
        
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/rankings/delete/<ranking_id>', methods=['DELETE'])
def delete_custom_rankings(ranking_id):
    """Delete custom rankings"""
    try:
        result = rankings_manager.delete_custom_rankings(ranking_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/settings')
def get_settings():
    """Get current draft settings"""
    return jsonify({
        'draft_id': draft_api.current_draft_id,
        'file_name': FILE_NAME,
        'refresh_interval': 30
    })

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

# Initialize draft API after class definition
draft_api = DraftAPI()

if __name__ == '__main__':
    print("🚀 Starting Fantasy Football Draft API...")
    print(f"📊 Default Draft ID: {DRAFT_ID}")
    print(f"📁 Rankings File: {FILE_NAME}")
    print("🌐 API will be available at http://localhost:5001")
    
    app.run(debug=True, host='0.0.0.0', port=5001)
