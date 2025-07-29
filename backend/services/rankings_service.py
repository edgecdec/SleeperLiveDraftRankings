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
        Returns: (scoring_format, league_type, is_manual, source)
        """
        if self.draft_api.manual_rankings_override:
            scoring_format, league_type = self.draft_api.manual_rankings_override
            print(f"🎯 Using manual rankings override: {scoring_format} {league_type}")
            return scoring_format, league_type, True, "manual"
        else:
            if not league_info:
                raise ValueError("league_info is required for auto-detection when no manual override is set")
            scoring_format, league_type = SleeperAPI.detect_league_format(league_info)
            print(f"🤖 Auto-detected league format: {scoring_format} {league_type}")
            return scoring_format, league_type, False, "auto"
    
    def load_rankings_data(self, scoring_format, league_type):
        """
        Load rankings data for the specified format.
        Returns: (rankings_list, rankings_dict, rankings_filename)
        """
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
        scoring_format, league_type, is_manual, source = self.get_effective_format(league_info)
        
        # Load rankings data
        rankings_list, rankings_dict, rankings_filename = self.load_rankings_data(scoring_format, league_type)
        
        return {
            'rankings_list': rankings_list,      # For main draft endpoint
            'rankings_dict': rankings_dict,      # For My Roster endpoint
            'scoring_format': scoring_format,
            'league_type': league_type,
            'is_manual': is_manual,
            'source': source,
            'rankings_filename': rankings_filename
        }
