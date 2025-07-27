"""
User Routes

This module contains all user and league-related API endpoints.
"""

from flask import Blueprint, jsonify, request
from services.sleeper_api import SleeperAPI

# Create blueprint for user routes
user_bp = Blueprint('user', __name__)


@user_bp.route('/api/user/<username>')
def get_user_info(username):
    """Get user information by username"""
    user_info = SleeperAPI.get_user(username)
    if user_info:
        return jsonify(user_info)
    else:
        return jsonify({'error': 'User not found'}), 404


@user_bp.route('/api/user/<username>/leagues')
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


@user_bp.route('/api/league/<league_id>/drafts')
def get_league_drafts(league_id):
    """Get all drafts for a league"""
    drafts = SleeperAPI.get_league_drafts(league_id)
    return jsonify(drafts)
