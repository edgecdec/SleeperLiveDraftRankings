"""
Draft Routes

This module contains all draft-related API endpoints.
"""

from flask import Blueprint, jsonify, request
from services.sleeper_api import SleeperAPI

# Create blueprint for draft routes
draft_bp = Blueprint('draft', __name__)

# Global draft service will be injected
draft_service = None


def init_draft_routes(draft_service_instance):
    """Initialize draft routes with draft service instance"""
    global draft_service
    draft_service = draft_service_instance


@draft_bp.route('/api/draft/<draft_id>/info')
def get_draft_info(draft_id):
    """Get draft information"""
    draft_info = SleeperAPI.get_draft_info(draft_id)
    if draft_info:
        return jsonify(draft_info)
    else:
        return jsonify({'error': 'Draft not found'}), 404


@draft_bp.route('/api/draft/status')
def get_draft_status():
    """Get current draft status and available players"""
    draft_id = request.args.get('draft_id')
    return jsonify(draft_service.get_draft_data(draft_id))


@draft_bp.route('/api/draft/refresh')
def refresh_draft_data():
    """Force refresh of draft data"""
    draft_id = request.args.get('draft_id')
    draft_service.cached_data = None
    draft_service.last_update = None
    return jsonify(draft_service.get_draft_data(draft_id))


@draft_bp.route('/api/draft/set', methods=['POST'])
def set_current_draft():
    """Set the current draft ID"""
    data = request.get_json()
    draft_id = data.get('draft_id')
    
    if not draft_id:
        return jsonify({'error': 'draft_id is required'}), 400
    
    draft_service.set_draft_id(draft_id)
    return jsonify({'success': True, 'draft_id': draft_id})


@draft_bp.route('/api/draft/<draft_id>')
def get_draft_data(draft_id):
    """Get comprehensive draft data including rankings and available players"""
    try:
        # Set the draft ID
        draft_service.set_draft_id(draft_id)
        
        # Get the draft data (this will load rankings automatically)
        draft_data = draft_service.get_draft_data()
        
        if 'error' in draft_data:
            return jsonify(draft_data), 400
            
        return jsonify(draft_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@draft_bp.route('/api/draft')
def get_current_draft_data():
    """Get current draft data"""
    try:
        if not draft_service.current_draft_id:
            return jsonify({'error': 'No active draft set'}), 400
            
        draft_data = draft_service.get_draft_data()
        return jsonify(draft_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
