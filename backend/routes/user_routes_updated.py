"""
Updated User Routes with Standardized Error Handling

This module contains all user and league-related API endpoints with
integrated error handling and toast notification support.
"""

from flask import Blueprint, jsonify, request
from services.sleeper_api import SleeperAPI
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
        
        return jsonify({
            'league_id': league_id,
            'username': username,
            'user_id': user_id,
            'roster_id': user_roster.get('roster_id'),
            'roster': user_roster,
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
