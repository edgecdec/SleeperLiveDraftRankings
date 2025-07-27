"""
League Service

This module handles league-related functionality including:
- League information retrieval from draft IDs or league IDs
- League context management
- Unified interface for league data access
"""

from .sleeper_api import SleeperAPI


class LeagueService:
    """Service class for managing league information and context"""
    
    @staticmethod
    def get_league_info_from_draft(draft_id):
        """Get league information from a draft ID"""
        try:
            draft_info = SleeperAPI.get_draft_info(draft_id)
            if not draft_info:
                return None
            
            league_id = draft_info.get('league_id')
            if not league_id:
                return None
                
            return SleeperAPI.get_league_info(league_id)
        except Exception as e:
            print(f"Error getting league info from draft {draft_id}: {e}")
            return None
    
    @staticmethod
    def get_league_info_direct(league_id):
        """Get league information directly from league ID"""
        try:
            return SleeperAPI.get_league_info(league_id)
        except Exception as e:
            print(f"Error getting league info for {league_id}: {e}")
            return None
    
    @staticmethod
    def get_league_context(draft_id=None, league_id=None):
        """
        Get league context from either draft_id or league_id.
        Returns league_info or None if not found.
        """
        if draft_id:
            return LeagueService.get_league_info_from_draft(draft_id)
        elif league_id:
            return LeagueService.get_league_info_direct(league_id)
        else:
            raise ValueError("Either draft_id or league_id must be provided")
