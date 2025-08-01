"""
Updated User Routes with Standardized Error Handling

This module contains all user and league-related API endpoints with
integrated error handling and toast notification support.
"""

from flask import Blueprint, jsonify, request
from services.sleeper_api import SleeperAPI
from services.league_service import LeagueService
from services.error_middleware import (
    handle_api_errors, validate_required_params, generate_request_context,
    validate_sleeper_id, validate_username
)
from services.error_service import (
    validation_error, not_found_error, external_api_error, 
    business_logic_error, internal_error
)

# Create blueprint for user routes
user_bp = Blueprint('user', __name__)


@user_bp.route('/api/user/<username>')
@handle_api_errors
def get_user_info(username):
    """Get user information by username with error handling"""
    context = generate_request_context()
    
    # Validate username format
    if not validate_username(username):
        return jsonify(validation_error(
            field="username",
            message="Invalid username format",
            value=username,
            context=context
        )), 400
    
    try:
        user_info = SleeperAPI.get_user(username)
        
        if not user_info:
            return jsonify(not_found_error(
                resource="User",
                resource_id=username,
                context=context
            )), 404
        
        return jsonify(user_info)
        
    except ConnectionError as e:
        return jsonify(external_api_error(
            service="Sleeper",
            message="Unable to fetch user information from Sleeper",
            context=context
        )), 503
    except Exception as e:
        return jsonify(internal_error(
            message="Failed to retrieve user information",
            exception=e,
            context=context
        )), 500


@user_bp.route('/api/user/<username>/leagues')
@handle_api_errors
def get_user_leagues(username):
    """Get all leagues for a user with error handling"""
    context = generate_request_context()
    season = request.args.get('season', '2025')
    
    # Validate username
    if not validate_username(username):
        return jsonify(validation_error(
            field="username",
            message="Invalid username format",
            value=username,
            context=context
        )), 400
    
    # Validate season format
    if not season.isdigit() or len(season) != 4:
        return jsonify(validation_error(
            field="season",
            message="Season must be a 4-digit year",
            value=season,
            context=context
        )), 400
    
    try:
        # First get user info
        user_info = SleeperAPI.get_user(username)
        if not user_info:
            return jsonify(not_found_error(
                resource="User",
                resource_id=username,
                context=context
            )), 404
        
        # Get user leagues
        leagues = SleeperAPI.get_user_leagues(user_info['user_id'], season)
        
        if not leagues:
            return jsonify(business_logic_error(
                message=f"No leagues found for {username} in {season}",
                details=f"User {username} has no leagues in the {season} season",
                context=context,
                suggestions=[
                    "Try a different season year",
                    "Check if the user has joined any leagues",
                    "Verify the username is correct"
                ]
            )), 404
        
        # Enhance league data with draft information
        enhanced_leagues = []
        for league in leagues:
            try:
                drafts = SleeperAPI.get_league_drafts(league['league_id'])
                league['drafts'] = drafts
                enhanced_leagues.append(league)
            except Exception as e:
                # Log error but continue with other leagues
                print(f"⚠️ Failed to get drafts for league {league['league_id']}: {e}")
                league['drafts'] = []
                league['draft_error'] = "Failed to load drafts"
                enhanced_leagues.append(league)
        
        return jsonify({
            'user': user_info,
            'leagues': enhanced_leagues,
            'season': season,
            'total_leagues': len(enhanced_leagues)
        })
        
    except ConnectionError as e:
        return jsonify(external_api_error(
            service="Sleeper",
            message="Unable to connect to Sleeper API",
            context=context
        )), 503
    except Exception as e:
        return jsonify(internal_error(
            message="Failed to retrieve user leagues",
            exception=e,
            context=context
        )), 500


@user_bp.route('/api/league/<league_id>/drafts')
@handle_api_errors
def get_league_drafts(league_id):
    """Get all drafts for a league with error handling"""
    context = generate_request_context()
    
    # Validate league ID format
    if not validate_sleeper_id(league_id, 'league'):
        return jsonify(validation_error(
            field="league_id",
            message="Invalid league ID format",
            value=league_id,
            context=context
        )), 400
    
    try:
        drafts = SleeperAPI.get_league_drafts(league_id)
        
        if not drafts:
            return jsonify(business_logic_error(
                message="No drafts found for this league",
                details=f"League {league_id} has no drafts available",
                context=context,
                suggestions=[
                    "Check if the league ID is correct",
                    "Verify the league exists in Sleeper",
                    "Check if drafts have been created for this league"
                ]
            )), 404
        
        # Enhance draft data with additional information
        enhanced_drafts = []
        for draft in drafts:
            try:
                # Add draft status information
                draft_status = draft.get('status', 'unknown')
                draft['status_display'] = {
                    'pre_draft': 'Not Started',
                    'drafting': 'In Progress', 
                    'complete': 'Completed',
                    'paused': 'Paused'
                }.get(draft_status, draft_status.title())
                
                # Add timing information
                if draft.get('start_time'):
                    from datetime import datetime
                    start_time = datetime.fromtimestamp(draft['start_time'] / 1000)
                    draft['start_time_formatted'] = start_time.isoformat()
                
                enhanced_drafts.append(draft)
                
            except Exception as e:
                print(f"⚠️ Error enhancing draft {draft.get('draft_id')}: {e}")
                enhanced_drafts.append(draft)
        
        return jsonify({
            'drafts': enhanced_drafts,
            'total_drafts': len(enhanced_drafts),
            'league_id': league_id
        })
        
    except ConnectionError as e:
        return jsonify(external_api_error(
            service="Sleeper",
            message="Unable to fetch league drafts from Sleeper",
            context=context
        )), 503
    except Exception as e:
        return jsonify(internal_error(
            message="Failed to retrieve league drafts",
            exception=e,
            context=context
        )), 500


@user_bp.route('/api/league/<league_id>/my-roster')
@validate_required_params('username')
@handle_api_errors
def get_my_roster(league_id):
    """Get the current user's roster for a league with error handling"""
    context = generate_request_context()
    username = request.args.get('username')
    draft_id = request.args.get('draft_id')  # Optional
    
    # Validate league ID
    if not validate_sleeper_id(league_id, 'league'):
        return jsonify(validation_error(
            field="league_id",
            message="Invalid league ID format",
            value=league_id,
            context=context
        )), 400
    
    # Validate username
    if not validate_username(username):
        return jsonify(validation_error(
            field="username",
            message="Invalid username format",
            value=username,
            context=context
        )), 400
    
    # Validate draft ID if provided
    if draft_id and not validate_sleeper_id(draft_id, 'draft'):
        return jsonify(validation_error(
            field="draft_id",
            message="Invalid draft ID format",
            value=draft_id,
            context=context
        )), 400
    
    try:
        # Get league info for roster settings
        league_info = SleeperAPI.get_league_info(league_id)
        if not league_info:
            return jsonify(not_found_error(
                resource="League",
                resource_id=league_id,
                context=context
            )), 404
        
        # Get league users to find user_id
        users = SleeperAPI.get_league_users(league_id)
        user_id = None
        
        for user in users:
            user_username = user.get('username', '').lower() if user.get('username') else ''
            user_display = user.get('display_name', '').lower() if user.get('display_name') else ''
            username_lower = username.lower()
            
            if user_username == username_lower or user_display == username_lower:
                user_id = user.get('user_id')
                break
        
        if not user_id:
            return jsonify(not_found_error(
                resource="User",
                resource_id=f"{username} in league {league_id}",
                context=context
            )), 404
        
        # Get league rosters to find user's roster
        rosters = SleeperAPI.get_league_rosters(league_id)
        user_roster = None
        
        for roster in rosters:
            if roster.get('owner_id') == user_id:
                user_roster = roster
                break
        
        if not user_roster:
            return jsonify(business_logic_error(
                message=f"No roster found for user {username}",
                details=f"User {username} does not have a roster in this league",
                context=context,
                suggestions=[
                    "Check if the user is in this league",
                    "Verify the username is correct",
                    "Check if the league has started"
                ]
            )), 404
        
        # Process roster data and return enhanced response
        roster_positions = league_info.get('roster_positions', [])
        
        # Count starter positions
        starter_counts = {}
        bench_slots = 0
        for pos in roster_positions:
            if pos == 'BN':
                bench_slots += 1
            else:
                starter_counts[pos] = starter_counts.get(pos, 0) + 1
        
        # Process roster players into positions format expected by frontend
        positions_data = {}
        total_players = 0
        
        # Check if league uses DEF or DST in roster positions
        uses_def_position = 'DEF' in roster_positions
        defense_position = 'DEF' if uses_def_position else 'DST'
        
        if user_roster.get('players'):
            # Get all players data from Sleeper
            all_players = SleeperAPI.get_all_players()
            
            # Get current rankings using the proper service integration
            rankings_dict = {}
            try:
                # Access the global rankings service that's already initialized in app.py
                # This ensures we use the same format detection as the main draft endpoint
                from app import rankings_service
                
                # Get current rankings with proper format detection
                rankings_result = rankings_service.get_current_rankings(league_info)
                rankings_dict = rankings_result.get('rankings_dict', {})
                
                print(f"✅ Loaded rankings via service: {len(rankings_dict)} players")
                print(f"📊 Using format: {rankings_result.get('scoring_format')} {rankings_result.get('league_type')}")
                
            except Exception as e:
                print(f"Warning: Could not load rankings for roster: {e}")
                rankings_dict = {}
            
            # Organize roster players by position
            for player_id in user_roster['players']:
                if player_id in all_players:
                    player = all_players[player_id]
                    position = player.get('position', 'UNKNOWN')
                    
                    # Handle DST/DEF position mapping - use league's preferred format
                    if position == 'DEF':
                        position = defense_position  # Use DEF if league uses DEF, otherwise DST
                    
                    # Get player name with special handling for DST/DEF
                    if player.get('position') == 'DEF':
                        # For DST, construct name from first_name + last_name (e.g., "Cincinnati Bengals")
                        first_name = player.get('first_name', '')
                        last_name = player.get('last_name', '')
                        if first_name and last_name:
                            player_name = f"{first_name} {last_name}"
                        else:
                            team = player.get('team', player_id)
                            player_name = f"{team} Defense"
                    else:
                        player_name = player.get('full_name', 'Unknown Player')
                    
                    # Look up ranking information
                    rank_info = None
                    if rankings_dict:
                        # Try to find player in rankings
                        name_key = player_name.lower().strip()
                        if name_key in rankings_dict:
                            rank_info = rankings_dict[name_key]
                        else:
                            # Try variations for DST names
                            if position == defense_position:  # Check against the position we're actually using
                                team = player.get('team', '')
                                if team:
                                    # Try "Team Defense" format
                                    dst_name = f"{team} Defense".lower()
                                    if dst_name in rankings_dict:
                                        rank_info = rankings_dict[dst_name]
                                    else:
                                        # Try team name variations
                                        for key in rankings_dict:
                                            if team.lower() in key and 'defense' in key:
                                                rank_info = rankings_dict[key]
                                                break
                            
                            # If still not found, try some common name variations
                            if not rank_info:
                                # Try without suffixes (Jr., Sr., etc.)
                                base_name = player_name.split(' Jr.')[0].split(' Sr.')[0].split(' III')[0].split(' II')[0].split(' IV')[0]
                                base_key = base_name.lower().strip()
                                if base_key in rankings_dict:
                                    rank_info = rankings_dict[base_key]
                                else:
                                    # Try the reverse - add Jr. to the name if not found
                                    jr_name = f"{player_name} Jr.".lower().strip()
                                    if jr_name in rankings_dict:
                                        rank_info = rankings_dict[jr_name]
                    
                    # Create player data structure
                    player_data = {
                        'name': player_name,
                        'position': position,
                        'team': player.get('team', ''),
                        'player_id': player_id,
                        'rank': rank_info.get('rank', 999) if rank_info else 999,
                        'tier': rank_info.get('tier', 10) if rank_info else 10
                    }
                    
                    # Add to positions data
                    if position not in positions_data:
                        positions_data[position] = []
                    positions_data[position].append(player_data)
                    total_players += 1
        
        return jsonify({
            'league_id': league_id,
            'username': username,
            'user_id': user_id,
            'roster_id': user_roster.get('roster_id'),
            'roster': user_roster,
            'positions': positions_data if positions_data else {},  # Ensure positions is never None
            'total_players': total_players,  # Add total players count
            'roster_settings': {
                'starter_counts': starter_counts,
                'bench_slots': bench_slots,
                'total_roster_spots': len(roster_positions)
            },
            'league_info': {
                'name': league_info.get('name'),
                'total_rosters': league_info.get('total_rosters'),
                'scoring_settings': league_info.get('scoring_settings')
            }
        })
        
    except ConnectionError as e:
        return jsonify(external_api_error(
            service="Sleeper",
            message="Unable to connect to Sleeper API",
            context=context
        )), 503
    except Exception as e:
        return jsonify(internal_error(
            message="Failed to retrieve roster information",
            exception=e,
            context=context
        )), 500
