"""
Updated Sleeper API Service with Standardized Error Handling

This module handles all interactions with the Sleeper Fantasy Football API
with integrated error handling and proper exception management.
"""

import requests
import time
from .error_middleware import handle_service_errors


class SleeperAPI:
    """Helper class for Sleeper API calls with error handling"""
    
    BASE_URL = "https://api.sleeper.app/v1"
    _players_cache = None
    _players_cache_time = None
    CACHE_DURATION = 3600  # 1 hour cache for player data
    
    @staticmethod
    @handle_service_errors("SleeperAPI")
    def get_user(username):
        """Get user info by username with error handling"""
        if not username or not isinstance(username, str):
            raise ValueError("Username must be a non-empty string")
        
        try:
            response = requests.get(
                f"{SleeperAPI.BASE_URL}/user/{username}",
                timeout=10
            )
            
            if response.status_code == 404:
                return None  # User not found is not an error, return None
            
            response.raise_for_status()  # Raise for other HTTP errors
            return response.json()
            
        except requests.exceptions.Timeout:
            raise TimeoutError(f"Timeout while fetching user {username}")
        except requests.exceptions.ConnectionError:
            raise ConnectionError("Unable to connect to Sleeper API")
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:
                raise ConnectionError("Rate limited by Sleeper API")
            raise ConnectionError(f"Sleeper API error: {e.response.status_code}")
    
    @staticmethod
    @handle_service_errors("SleeperAPI")
    def get_user_leagues(user_id, season="2025"):
        """Get all leagues for a user in a given season with error handling"""
        if not user_id:
            raise ValueError("User ID is required")
        
        if not season or not season.isdigit():
            raise ValueError("Season must be a valid year")
        
        try:
            response = requests.get(
                f"{SleeperAPI.BASE_URL}/user/{user_id}/leagues/nfl/{season}",
                timeout=15
            )
            
            if response.status_code == 404:
                return []  # No leagues found is not an error
            
            response.raise_for_status()
            return response.json() or []
            
        except requests.exceptions.Timeout:
            raise TimeoutError(f"Timeout while fetching leagues for user {user_id}")
        except requests.exceptions.ConnectionError:
            raise ConnectionError("Unable to connect to Sleeper API")
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:
                raise ConnectionError("Rate limited by Sleeper API")
            raise ConnectionError(f"Sleeper API error: {e.response.status_code}")
    
    @staticmethod
    @handle_service_errors("SleeperAPI")
    def get_league_drafts(league_id):
        """Get all drafts for a league with error handling"""
        if not league_id:
            raise ValueError("League ID is required")
        
        try:
            response = requests.get(
                f"{SleeperAPI.BASE_URL}/league/{league_id}/drafts",
                timeout=10
            )
            
            if response.status_code == 404:
                return []  # No drafts found is not an error
            
            response.raise_for_status()
            return response.json() or []
            
        except requests.exceptions.Timeout:
            raise TimeoutError(f"Timeout while fetching drafts for league {league_id}")
        except requests.exceptions.ConnectionError:
            raise ConnectionError("Unable to connect to Sleeper API")
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:
                raise ConnectionError("Rate limited by Sleeper API")
            raise ConnectionError(f"Sleeper API error: {e.response.status_code}")
    
    @staticmethod
    @handle_service_errors("SleeperAPI")
    def get_draft_info(draft_id):
        """Get draft information with error handling"""
        if not draft_id:
            raise ValueError("Draft ID is required")
        
        try:
            response = requests.get(
                f"{SleeperAPI.BASE_URL}/draft/{draft_id}",
                timeout=10
            )
            
            if response.status_code == 404:
                return None  # Draft not found is not an error, return None
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.Timeout:
            raise TimeoutError(f"Timeout while fetching draft {draft_id}")
        except requests.exceptions.ConnectionError:
            raise ConnectionError("Unable to connect to Sleeper API")
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:
                raise ConnectionError("Rate limited by Sleeper API")
            raise ConnectionError(f"Sleeper API error: {e.response.status_code}")
    
    @staticmethod
    @handle_service_errors("SleeperAPI")
    def get_league_info(league_id):
        """Get league information with error handling"""
        if not league_id:
            raise ValueError("League ID is required")
        
        try:
            response = requests.get(
                f"{SleeperAPI.BASE_URL}/league/{league_id}",
                timeout=10
            )
            
            if response.status_code == 404:
                return None  # League not found is not an error, return None
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.Timeout:
            raise TimeoutError(f"Timeout while fetching league {league_id}")
        except requests.exceptions.ConnectionError:
            raise ConnectionError("Unable to connect to Sleeper API")
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:
                raise ConnectionError("Rate limited by Sleeper API")
            raise ConnectionError(f"Sleeper API error: {e.response.status_code}")
    
    @staticmethod
    @handle_service_errors("SleeperAPI")
    def detect_league_format(league_info):
        """Detect scoring format and league type from Sleeper league settings"""
        if not league_info or not isinstance(league_info, dict):
            print("⚠️ No league info provided, using default format")
            return 'half_ppr', 'superflex'  # Safe default
        
        try:
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
                print(f"⚠️ Unusual PPR value: {rec_points}, defaulting to half_ppr")
                scoring_format = 'half_ppr'
            
            # Detect league type (standard vs superflex)
            roster_positions = league_info.get('roster_positions', [])
            qb_count = roster_positions.count('QB')
            has_superflex = 'SUPER_FLEX' in roster_positions
            
            if qb_count > 1 or has_superflex:
                league_type = 'superflex'
            else:
                league_type = 'standard'
            
            print(f"🏈 Detected league format: {scoring_format} {league_type}")
            print(f"   📊 Scoring: rec={rec_points} -> {scoring_format}")
            print(f"   🏟️  Roster: QB={qb_count}, SUPER_FLEX={has_superflex} -> {league_type}")
            
            return scoring_format, league_type
            
        except Exception as e:
            print(f"⚠️ Error in format detection: {e}, using default")
            return 'half_ppr', 'superflex'
    
    @staticmethod
    @handle_service_errors("SleeperAPI")
    def get_league_rosters(league_id):
        """Get all rosters for a league with error handling"""
        if not league_id:
            raise ValueError("League ID is required")
        
        try:
            response = requests.get(
                f"{SleeperAPI.BASE_URL}/league/{league_id}/rosters",
                timeout=10
            )
            
            if response.status_code == 404:
                return []  # No rosters found is not an error
            
            response.raise_for_status()
            return response.json() or []
            
        except requests.exceptions.Timeout:
            raise TimeoutError(f"Timeout while fetching rosters for league {league_id}")
        except requests.exceptions.ConnectionError:
            raise ConnectionError("Unable to connect to Sleeper API")
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:
                raise ConnectionError("Rate limited by Sleeper API")
            raise ConnectionError(f"Sleeper API error: {e.response.status_code}")
    
    @staticmethod
    @handle_service_errors("SleeperAPI")
    def get_league_users(league_id):
        """Get all users in a league with error handling"""
        if not league_id:
            raise ValueError("League ID is required")
        
        try:
            response = requests.get(
                f"{SleeperAPI.BASE_URL}/league/{league_id}/users",
                timeout=10
            )
            
            if response.status_code == 404:
                return []  # No users found is not an error
            
            response.raise_for_status()
            return response.json() or []
            
        except requests.exceptions.Timeout:
            raise TimeoutError(f"Timeout while fetching users for league {league_id}")
        except requests.exceptions.ConnectionError:
            raise ConnectionError("Unable to connect to Sleeper API")
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:
                raise ConnectionError("Rate limited by Sleeper API")
            raise ConnectionError(f"Sleeper API error: {e.response.status_code}")
    
    @staticmethod
    @handle_service_errors("SleeperAPI")
    def get_all_players():
        """Get all NFL players with caching and error handling"""
        current_time = time.time()
        
        # Return cached data if still valid
        if (SleeperAPI._players_cache and SleeperAPI._players_cache_time and 
            current_time - SleeperAPI._players_cache_time < SleeperAPI.CACHE_DURATION):
            return SleeperAPI._players_cache
        
        try:
            response = requests.get(
                f"{SleeperAPI.BASE_URL}/players/nfl",
                timeout=30  # Longer timeout for large player data
            )
            
            response.raise_for_status()
            players_data = response.json()
            
            if not players_data:
                raise ValueError("Empty player data received from Sleeper API")
            
            SleeperAPI._players_cache = players_data
            SleeperAPI._players_cache_time = current_time
            
            print(f"📊 Updated player cache with {len(players_data)} players")
            return players_data
            
        except requests.exceptions.Timeout:
            raise TimeoutError("Timeout while fetching player data")
        except requests.exceptions.ConnectionError:
            raise ConnectionError("Unable to connect to Sleeper API")
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:
                raise ConnectionError("Rate limited by Sleeper API")
            raise ConnectionError(f"Sleeper API error: {e.response.status_code}")
    
    @staticmethod
    @handle_service_errors("SleeperAPI")
    def is_dynasty_or_keeper_league(league_info):
        """Determine if a league is dynasty or keeper with error handling"""
        if not league_info or not isinstance(league_info, dict):
            print("⚠️ No league info provided for dynasty/keeper detection")
            return False
        
        try:
            settings = league_info.get('settings', {})
            league_id = league_info.get('league_id')
            
            print(f"🔍 DEBUG: Checking dynasty/keeper for league {league_id}")
            
            # Check for dynasty indicators
            league_type = settings.get('type', 0)
            if league_type == 2:  # Dynasty league type
                print(f"🏰 Dynasty league detected: type={league_type}")
                return True
            
            # Check for taxi squad (dynasty feature)
            taxi_slots = settings.get('taxi_slots', 0)
            if taxi_slots > 0:
                print(f"🚕 Dynasty league detected: taxi_slots={taxi_slots}")
                return True
            
            # Check for actual keepers
            max_keepers = settings.get('max_keepers', 0)
            prev_league = league_info.get('previous_league_id')
            
            if max_keepers > 0 and league_id:
                try:
                    rosters = SleeperAPI.get_league_rosters(league_id)
                    actual_keepers = sum(len(roster.get('keepers', [])) for roster in rosters)
                    
                    if actual_keepers > 0:
                        print(f"🔒 Keeper league detected: {actual_keepers} actual keepers found")
                        return True
                    elif max_keepers > 1:
                        print(f"🔒 Keeper league assumed: max_keepers={max_keepers}")
                        return True
                        
                except Exception as e:
                    print(f"⚠️ Error checking keepers: {e}")
                    if max_keepers > 1:
                        return True
            
            # Check draft metadata
            draft_id = league_info.get('draft_id')
            if draft_id:
                try:
                    draft_info = SleeperAPI.get_draft_info(draft_id)
                    if (draft_info and 
                        draft_info.get('metadata', {}).get('scoring_type', '').startswith('dynasty')):
                        print(f"🏰 Dynasty league detected: draft metadata indicates dynasty")
                        return True
                except Exception as e:
                    print(f"⚠️ Error checking draft metadata: {e}")
            
            print(f"🏈 Redraft league detected: no dynasty/keeper indicators found")
            return False
            
        except Exception as e:
            print(f"⚠️ Error in dynasty/keeper detection: {e}")
            return False  # Default to redraft on error
