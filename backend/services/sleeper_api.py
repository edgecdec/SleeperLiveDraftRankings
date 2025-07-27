"""
Sleeper API Service

This module handles all interactions with the Sleeper Fantasy Football API.
Provides methods for retrieving user data, league information, draft data, and player information.
"""

import requests
import time


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
        """Determine if a league is dynasty or keeper based on league settings and actual usage"""
        if not league_info:
            return False
        
        settings = league_info.get('settings', {})
        league_id = league_info.get('league_id')
        
        print(f"🔍 DEBUG: Checking dynasty/keeper for league {league_id}")
        print(f"🔍 DEBUG: League settings: {settings}")
        
        # Check for dynasty indicators
        league_type = settings.get('type', 0)
        print(f"🔍 DEBUG: League type = {league_type}")
        if league_type == 2:  # Dynasty league type
            print(f"🏰 Dynasty league detected: type={league_type}")
            return True
        
        # Check for taxi squad (dynasty feature)
        taxi_slots = settings.get('taxi_slots', 0)
        print(f"🔍 DEBUG: Taxi slots = {taxi_slots}")
        if taxi_slots > 0:
            print(f"🚕 Dynasty league detected: taxi_slots={taxi_slots}")
            return True
        
        # Check if there's a previous league ID (continuation)
        # Only consider this dynasty/keeper if it also has other indicators
        prev_league = league_info.get('previous_league_id')
        max_keepers = settings.get('max_keepers', 0)
        print(f"🔍 DEBUG: Previous league ID = {prev_league}")
        print(f"🔍 DEBUG: Max keepers = {max_keepers}")
        if prev_league:
            # Having a previous league ID alone doesn't guarantee dynasty/keeper
            # Check if there are actual keepers or other dynasty indicators
            if max_keepers > 1 or taxi_slots > 0 or league_type == 2:
                print(f"🔗 Dynasty/Keeper league detected: has previous_league_id with other indicators")
                return True
            else:
                print(f"📝 Previous league found but no keeper/dynasty indicators - likely annual redraft continuation")
        
        # Check for ACTUAL keepers being used (not just max_keepers setting)
        if max_keepers > 0 and league_id:
            # Check if any rosters actually have keepers
            try:
                rosters = SleeperAPI.get_league_rosters(league_id)
                actual_keepers = 0
                for roster in rosters:
                    keepers = roster.get('keepers', [])
                    if keepers and len(keepers) > 0:
                        actual_keepers += len(keepers)
                
                print(f"🔍 DEBUG: Actual keepers found = {actual_keepers}")
                if actual_keepers > 0:
                    print(f"🔒 Keeper league detected: {actual_keepers} actual keepers found")
                    return True
                else:
                    print(f"📝 Not a keeper league: max_keepers={max_keepers} but 0 actual keepers")
                    
            except Exception as e:
                print(f"⚠️ Error checking keepers: {e}")
                # Fallback: if we can't check actual keepers and max_keepers > 1, assume it's a keeper league
                if max_keepers > 1:
                    print(f"🔒 Keeper league assumed: max_keepers={max_keepers} (couldn't verify actual keepers)")
                    return True
        
        # Check draft metadata for dynasty scoring
        draft_id = league_info.get('draft_id')
        print(f"🔍 DEBUG: Draft ID = {draft_id}")
        if draft_id:
            try:
                draft_info = SleeperAPI.get_draft_info(draft_id)
                if draft_info and draft_info.get('metadata', {}).get('scoring_type', '').startswith('dynasty'):
                    print(f"🏰 Dynasty league detected: draft metadata indicates dynasty")
                    return True
            except Exception as e:
                print(f"⚠️ Error checking draft metadata: {e}")
        
        print(f"🏈 Redraft league detected: no dynasty/keeper indicators found")
        return False
