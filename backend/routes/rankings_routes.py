"""
Rankings Routes

This module contains all rankings-related API endpoints.
"""

import os
from flask import Blueprint, jsonify, request
from services.league_service import LeagueService
from Rankings.Constants import RANKINGS_OUTPUT_DIRECTORY

# Create blueprint for rankings routes
rankings_bp = Blueprint('rankings', __name__)

# Global services will be injected
draft_service = None
rankings_service = None
rankings_manager = None


def init_rankings_routes(draft_service_instance, rankings_service_instance, rankings_manager_instance):
    """Initialize rankings routes with service instances"""
    global draft_service, rankings_service, rankings_manager
    draft_service = draft_service_instance
    rankings_service = rankings_service_instance
    rankings_manager = rankings_manager_instance


@rankings_bp.route('/api/rankings/status')
def get_rankings_status():
    """Get current rankings status and metadata"""
    try:
        status = rankings_manager.get_update_status()
        return jsonify(status)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@rankings_bp.route('/api/rankings/formats')
def get_available_formats():
    """Get available ranking formats"""
    try:
        formats = rankings_manager.get_available_formats()
        return jsonify(formats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@rankings_bp.route('/api/rankings/current-format', methods=['GET'])
def get_current_rankings_format():
    """Get the current rankings format being used based on league settings"""
    try:
        draft_id = request.args.get('draft_id', draft_service.current_draft_id)
        
        # Get league context using helper service
        league_info = LeagueService.get_league_context(draft_id=draft_id)
        if not league_info:
            return jsonify({'error': 'League information not found'}), 404
        
        # Get current format using clean helper service
        rankings_result = rankings_service.get_current_rankings(league_info)
        
        return jsonify({
            'success': True,
            'scoring_format': rankings_result['scoring_format'],
            'league_type': rankings_result['league_type'],
            'is_manual': rankings_result['is_manual'],
            'source': rankings_result['source'],
            'rankings_filename': rankings_result['rankings_filename']
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@rankings_bp.route('/api/rankings/select', methods=['POST'])
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
                
                # Set manual override in DraftService
                draft_service.set_manual_rankings(scoring, format_type)
                
                # Verify the rankings file exists
                filename = rankings_manager.get_rankings_filename(scoring, format_type)
                
                # Try multiple possible locations for the rankings file
                possible_paths = [
                    os.path.join(RANKINGS_OUTPUT_DIRECTORY, filename),
                    os.path.join('..', 'Rankings', RANKINGS_OUTPUT_DIRECTORY, filename),
                    os.path.join('..', RANKINGS_OUTPUT_DIRECTORY, filename)
                ]
                
                rankings_file = None
                for path in possible_paths:
                    if os.path.exists(path):
                        rankings_file = path
                        break
                
                if rankings_file:
                    return jsonify({
                        'success': True, 
                        'message': f'Selected {scoring} {format_type} rankings',
                        'format': f'{scoring}_{format_type}',
                        'file': filename
                    })
                else:
                    return jsonify({'error': f'Rankings file not found: {filename}'}), 404
            else:
                return jsonify({'error': 'Invalid format key'}), 400
                
        elif ranking_type == 'custom':
            # Handle custom rankings (if implemented)
            return jsonify({'error': 'Custom rankings not yet implemented'}), 501
        elif ranking_type == 'auto':
            # Clear manual override to return to auto-detection
            draft_service.clear_manual_rankings()
            return jsonify({
                'success': True,
                'message': 'Switched to automatic league detection',
                'format': 'auto'
            })
        else:
            return jsonify({'error': 'Invalid ranking type'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
