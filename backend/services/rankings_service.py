"""
Rankings Service

This module handles all rankings-related functionality including:
- Format detection (manual override vs auto-detection)
- Rankings file loading and caching
- Data format conversion between list and dictionary formats
"""

import os
import sys

# Add the parent directory to the path so we can import existing modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from Rankings.ParseRankings import parseCSV
from Rankings.Constants import RANKINGS_OUTPUT_DIRECTORY
from .sleeper_api import SleeperAPI


class RankingsService:
    """Service class for managing rankings data and format detection"""
    
    def __init__(self, draft_api_instance, rankings_manager):
        self.draft_api = draft_api_instance
        self.rankings_manager = rankings_manager
    
    def get_effective_format(self, league_info=None):
        """
        Determine the effective rankings format to use.
        Returns: (scoring_format, league_type, is_manual, source, custom_id)
        """
        # First check if there's a simple file selection
        if os.path.exists('current_rankings_selection.json'):
            try:
                with open('current_rankings_selection.json', 'r') as f:
                    import json
                    selection = json.load(f)
                
                filename = selection.get('filename')
                display_name = selection.get('display_name', filename)
                
                if filename:
                    print(f"🎯 Using simple file selection: {filename} ({display_name})")
                    return 'simple_file', filename, True, "simple_file", filename
            except Exception as e:
                print(f"⚠️ Error reading simple file selection: {e}")
        
        # Fall back to existing logic
        if self.draft_api.manual_rankings_override:
            scoring_format, league_type_or_custom_id = self.draft_api.manual_rankings_override
            
            # Check if this is a custom rankings selection
            if scoring_format == 'custom':
                print(f"🎯 Using custom rankings: {league_type_or_custom_id}")
                return 'custom', 'custom', True, "custom", league_type_or_custom_id
            else:
                print(f"🎯 Using manual rankings override: {scoring_format} {league_type_or_custom_id}")
                return scoring_format, league_type_or_custom_id, True, "manual", None
        else:
            if not league_info:
                raise ValueError("league_info is required for auto-detection when no manual override is set")
            scoring_format, league_type = SleeperAPI.detect_league_format(league_info)
            print(f"🤖 Auto-detected league format: {scoring_format} {league_type}")
            return scoring_format, league_type, False, "auto", None
    
    def load_rankings_data(self, scoring_format, league_type, custom_id=None):
        """
        Load rankings data for the specified format.
        Returns: (rankings_list, rankings_dict, rankings_filename)
        """
        # Handle simple file selection
        if scoring_format == 'simple_file' and league_type:
            filename = league_type  # In this case, league_type contains the filename
            try:
                print(f"📁 Loading simple file selection: {filename}")
                
                # Try to find the file in the custom rankings directory
                custom_file_path = os.path.join("backend/rankings/Custom/", filename)
                
                if os.path.exists(custom_file_path):
                    print(f"📁 Found custom file: {custom_file_path}")
                    rankings_list = parseCSV(custom_file_path)
                    rankings_dict = self._convert_to_dict_format(rankings_list)
                    
                    # Debug logging for first few players
                    print(f"🔍 RankingsService Simple File Debug: Loaded {len(rankings_list)} players")
                    for i, player in enumerate(rankings_list[:3]):
                        print(f"   Player {i+1}: {player.name}")
                        print(f"     Has value attr: {hasattr(player, 'value')}")
                        print(f"     Value: {getattr(player, 'value', 'NOT_SET')}")
                        print(f"     Value type: {type(getattr(player, 'value', None))}")
                    
                    print(f"✅ Loaded {len(rankings_list)} players from simple file selection")
                    return rankings_list, rankings_dict, filename
                else:
                    print(f"⚠️ Simple file not found: {custom_file_path}")
                    return [], {}, filename
                    
            except Exception as e:
                print(f"⚠️ Error loading simple file: {e}")
                import traceback
                traceback.print_exc()
                return [], {}, filename
        
        if custom_id:
            # Handle custom rankings - use direct approach
            try:
                print(f"📁 Loading custom rankings with ID: {custom_id}")
                
                # Get the custom rankings metadata first
                custom_rankings = self.rankings_manager.get_custom_rankings_list()
                custom_ranking = next((r for r in custom_rankings if r['id'] == custom_id), None)
                
                if not custom_ranking:
                    print(f"⚠️ Custom rankings not found: {custom_id}")
                    return [], {}, f"custom_{custom_id}"
                
                if not custom_ranking['exists']:
                    print(f"⚠️ Custom rankings file missing: {custom_id}")
                    return [], {}, f"custom_{custom_id}"
                
                # Get the actual file path using the same approach as RankingsManager
                custom_file_path = os.path.join(
                    "backend/rankings/Custom/",  # Same as CUSTOM_RANKINGS_DIRECTORY
                    custom_ranking['filename']
                )
                
                print(f"📁 Using custom rankings file: {custom_file_path}")
                
                if not os.path.exists(custom_file_path):
                    print(f"⚠️ Custom rankings file not found at: {custom_file_path}")
                    return [], {}, custom_ranking['filename']
                
                # Parse the CSV file directly
                rankings_list = parseCSV(custom_file_path)
                rankings_dict = self._convert_to_dict_format(rankings_list)
                
                # Debug logging for first few players
                print(f"🔍 RankingsService Custom Debug: Loaded {len(rankings_list)} players")
                for i, player in enumerate(rankings_list[:3]):
                    print(f"   Player {i+1}: {player.name}")
                    print(f"     Has value attr: {hasattr(player, 'value')}")
                    print(f"     Value: {getattr(player, 'value', 'NOT_SET')}")
                    print(f"     Value type: {type(getattr(player, 'value', None))}")
                
                print(f"✅ Loaded {len(rankings_list)} players from custom rankings: {custom_ranking['display_name']}")
                return rankings_list, rankings_dict, custom_ranking['filename']
                
            except Exception as e:
                print(f"⚠️ Error loading custom rankings: {e}")
                import traceback
                traceback.print_exc()
                return [], {}, f"custom_{custom_id}"
        
        # Handle FantasyPros rankings (existing logic)
        rankings_filename = self.rankings_manager.get_rankings_filename(scoring_format, league_type)
        
        # Get the absolute path to the backend directory
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        # Try multiple possible locations for the rankings file
        possible_paths = [
            # New structure: backend/rankings/
            os.path.join(backend_dir, 'rankings', rankings_filename),
            # Legacy structure: backend/PopulatedFromSites/
            os.path.join(backend_dir, 'PopulatedFromSites', rankings_filename),
            # From Constants.py (should now point to backend/rankings/)
            os.path.join(RANKINGS_OUTPUT_DIRECTORY, rankings_filename),
            # Relative paths for backward compatibility
            os.path.join('..', 'Rankings', RANKINGS_OUTPUT_DIRECTORY, rankings_filename),
            os.path.join('..', RANKINGS_OUTPUT_DIRECTORY, rankings_filename)
        ]
        
        rankings_file = None
        for path in possible_paths:
            if os.path.exists(path):
                rankings_file = path
                print(f"📁 Found rankings file at: {path}")
                break
        
        if not rankings_file:
            print(f"⚠️ Rankings file not found: {rankings_filename}")
            print(f"   Searched paths:")
            for path in possible_paths:
                print(f"   - {path}")
            return [], {}, rankings_filename
        
        try:
            print(f"📊 Using rankings file: {rankings_filename}")
            rankings_list = parseCSV(rankings_file)
            rankings_dict = self._convert_to_dict_format(rankings_list)
            return rankings_list, rankings_dict, rankings_filename
        except Exception as e:
            print(f"Error loading rankings: {e}")
            return [], {}, rankings_filename
    
    def _convert_to_dict_format(self, rankings_list):
        """Convert rankings list to dictionary format for player lookups"""
        rankings_dict = {}
        for player in rankings_list:
            rankings_dict[player.name.lower().strip()] = {
                'rank': player.rank,
                'tier': getattr(player, 'tier', 1),
                'original_name': player.name
            }
        return rankings_dict
    
    def get_current_rankings(self, league_info=None):
        """
        Main entry point for getting current rankings data.
        Returns complete rankings information with both formats.
        """
        # Get effective format
        scoring_format, league_type, is_manual, source, custom_id = self.get_effective_format(league_info)
        
        # Load rankings data
        rankings_list, rankings_dict, rankings_filename = self.load_rankings_data(scoring_format, league_type, custom_id)
        
        result = {
            'rankings_list': rankings_list,      # For main draft endpoint
            'rankings_dict': rankings_dict,      # For My Roster endpoint
            'scoring_format': scoring_format,
            'league_type': league_type,
            'is_manual': is_manual,
            'source': source,
            'rankings_filename': rankings_filename
        }
        
        # Add custom rankings metadata if applicable
        if custom_id:
            custom_rankings = self.rankings_manager.get_custom_rankings_list()
            custom_ranking = next((r for r in custom_rankings if r['id'] == custom_id), None)
            if custom_ranking:
                result['custom_metadata'] = {
                    'id': custom_id,
                    'display_name': custom_ranking['display_name'],
                    'description': custom_ranking['description'],
                    'player_count': custom_ranking['player_count'],
                    'upload_time': custom_ranking['upload_time']
                }
        
        return result
