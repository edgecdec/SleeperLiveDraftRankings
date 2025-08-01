"""
Updated Rankings Routes with Standardized Error Handling

This module contains all rankings-related API endpoints including
upload functionality, with integrated error handling and toast notification support.
"""

import os
from flask import Blueprint, jsonify, request
from services.league_service import LeagueService
from services.error_middleware import (
    handle_api_errors, validate_json_body, generate_request_context,
    validate_sleeper_id, validate_rankings_format
)
from services.error_service import (
    validation_error, not_found_error, external_api_error, 
    business_logic_error, internal_error
)
from Rankings.Constants import RANKINGS_OUTPUT_DIRECTORY

# Upload configuration
ALLOWED_EXTENSIONS = {'csv'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_file_size(file_obj):
    """Validate file size"""
    if hasattr(file_obj, 'content_length') and file_obj.content_length:
        return file_obj.content_length <= MAX_FILE_SIZE
    return True  # Can't check size, allow it

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
@handle_api_errors
def get_rankings_status():
    """Get current rankings status and metadata with error handling"""
    context = generate_request_context()
    
    try:
        status = rankings_manager.get_update_status()
        
        # Enhance status with additional information
        enhanced_status = {
            **status,
            'current_draft_id': draft_service.current_draft_id,
            'manual_override': draft_service.manual_rankings_override,
            'cache_info': {
                'last_update': draft_service.last_update,
                'cache_duration': draft_service.cache_duration
            }
        }
        
        return jsonify(enhanced_status)
        
    except Exception as e:
        return jsonify(internal_error(
            message="Failed to retrieve rankings status",
            exception=e,
            context=context
        )), 500


@rankings_bp.route('/api/rankings/formats')
@handle_api_errors
def get_available_formats():
    """Get available ranking formats with error handling"""
    context = generate_request_context()
    
    try:
        formats = rankings_manager.get_available_formats()
        
        if not formats:
            return jsonify(business_logic_error(
                message="No ranking formats available",
                details="No rankings files found in the system",
                context=context,
                suggestions=[
                    "Check if rankings files exist in the PopulatedFromSites directory",
                    "Run rankings update to download latest rankings",
                    "Contact support if the issue persists"
                ]
            )), 404
        
        # formats is already a properly structured dictionary from RankingsManager
        # No need to enhance or modify it - just return it directly
        return jsonify(formats)
        
    except Exception as e:
        return jsonify(internal_error(
            message="Failed to retrieve available formats",
            exception=e,
            context=context
        )), 500


@rankings_bp.route('/api/rankings/current-format', methods=['GET'])
@handle_api_errors
def get_current_rankings_format():
    """Get the current rankings format with error handling"""
    context = generate_request_context()
    draft_id = request.args.get('draft_id', draft_service.current_draft_id)
    
    if not draft_id:
        return jsonify(business_logic_error(
            message="No draft specified for format detection",
            details="Provide a draft_id parameter or select an active draft",
            context=context,
            suggestions=[
                "Add ?draft_id=YOUR_DRAFT_ID to the URL",
                "Select an active draft first using /api/draft/set",
                "Check your available drafts"
            ]
        )), 400
    
    # Validate draft ID
    if not validate_sleeper_id(draft_id, 'draft'):
        return jsonify(validation_error(
            field="draft_id",
            message="Invalid draft ID format",
            value=draft_id,
            context=context
        )), 400
    
    try:
        # Get league context using helper service
        league_info = LeagueService.get_league_context(draft_id=draft_id)
        if not league_info:
            return jsonify(not_found_error(
                resource="League",
                resource_id=f"league for draft {draft_id}",
                context=context
            )), 404
        
        # Get current format using rankings service
        rankings_result = rankings_service.get_current_rankings(league_info)
        
        # Check if rankings file exists
        filename = rankings_result.get('rankings_filename', '')
        file_paths = [
            os.path.join(RANKINGS_OUTPUT_DIRECTORY, filename),
            os.path.join('..', 'Rankings', RANKINGS_OUTPUT_DIRECTORY, filename),
            os.path.join('..', RANKINGS_OUTPUT_DIRECTORY, filename)
        ]
        
        file_exists = any(os.path.exists(path) for path in file_paths)
        
        if not file_exists:
            return jsonify(business_logic_error(
                message=f"Rankings file not found: {filename}",
                details=f"The required rankings file for {rankings_result['scoring_format']} {rankings_result['league_type']} format is missing",
                context=context,
                suggestions=[
                    "Run rankings update to download the missing file",
                    "Check if the file exists in PopulatedFromSites directory",
                    "Try a different rankings format",
                    "Contact support if the issue persists"
                ]
            )), 404
        
        return jsonify({
            'success': True,
            'scoring_format': rankings_result['scoring_format'],
            'league_type': rankings_result['league_type'],
            'is_manual': rankings_result['is_manual'],
            'source': rankings_result['source'],
            'rankings_filename': rankings_result['rankings_filename'],
            'file_exists': file_exists,
            'draft_id': draft_id,
            'league_info': {
                'name': league_info.get('name'),
                'total_rosters': league_info.get('total_rosters')
            }
        })
        
    except ConnectionError as e:
        return jsonify(external_api_error(
            service="Sleeper",
            message="Unable to connect to Sleeper API for league information",
            context=context
        )), 503
    except Exception as e:
        return jsonify(internal_error(
            message="Failed to determine current rankings format",
            exception=e,
            context=context
        )), 500


@rankings_bp.route('/api/rankings/select', methods=['POST'])
@validate_json_body(['type'])
@handle_api_errors
def select_rankings():
    """Select which rankings to use with error handling"""
    context = generate_request_context()
    data = request.get_json()
    ranking_type = data.get('type')
    ranking_id = data.get('id')
    
    try:
        if ranking_type == 'fantasypros':
            if not ranking_id:
                return jsonify(validation_error(
                    field="id",
                    message="ID is required for FantasyPros rankings selection",
                    context=context
                )), 400
            
            # Validate format ID
            if not validate_rankings_format(ranking_id):
                return jsonify(validation_error(
                    field="id",
                    message="Invalid rankings format ID",
                    value=ranking_id,
                    context=context
                )), 400
            
            # Parse format key (e.g., "half_ppr_superflex")
            parts = ranking_id.split('_')
            if len(parts) < 2:
                return jsonify(validation_error(
                    field="id",
                    message="Invalid format key structure",
                    value=ranking_id,
                    context=context
                )), 400
            
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
            
            if not rankings_file:
                return jsonify(not_found_error(
                    resource="Rankings File",
                    resource_id=filename,
                    context=context
                )), 404
            
            return jsonify({
                'success': True, 
                'message': f'Selected {scoring} {format_type} rankings',
                'format': f'{scoring}_{format_type}',
                'file': filename,
                'file_path': rankings_file,
                'is_manual': True
            })
            
        elif ranking_type == 'custom':
            if not ranking_id:
                return jsonify(validation_error(
                    field="id",
                    message="ID is required for custom rankings selection",
                    context=context
                )), 400
            
            # For custom rankings, we don't use validate_rankings_format
            # since custom IDs have a different format (custom_timestamp_name)
            
            # Verify custom rankings exist
            custom_rankings = rankings_manager.get_custom_rankings_list()
            custom_ranking = next((r for r in custom_rankings if r['id'] == ranking_id), None)
            
            if not custom_ranking:
                return jsonify(validation_error(
                    field="id",
                    message="Custom rankings not found",
                    value=ranking_id,
                    context=context,
                    suggestions=[
                        "Check if the custom rankings file still exists",
                        "Try refreshing the page to reload available rankings",
                        "Re-upload the custom rankings if needed"
                    ]
                )), 404
            
            if not custom_ranking['exists']:
                return jsonify(validation_error(
                    field="id",
                    message="Custom rankings file not found",
                    value=ranking_id,
                    context=context,
                    suggestions=[
                        "The custom rankings file appears to be missing",
                        "Re-upload the custom rankings file",
                        "Choose a different rankings file"
                    ]
                )), 404
            
            # Set custom rankings in DraftService
            draft_service.set_manual_rankings('custom', ranking_id)
            
            return jsonify({
                'success': True,
                'message': f'Selected custom rankings: {custom_ranking["display_name"]}',
                'format': 'custom',
                'custom_id': ranking_id,
                'display_name': custom_ranking['display_name'],
                'description': custom_ranking['description'],
                'player_count': custom_ranking['player_count'],
                'upload_time': custom_ranking.get('upload_time'),
                'upload_time_formatted': custom_ranking.get('upload_time_formatted'),
                'scoring_format': custom_ranking.get('scoring_format', 'custom'),
                'league_type': custom_ranking.get('league_type', 'custom'),
                'is_manual': True,
                'type': 'custom'
            })
            
        elif ranking_type == 'auto':
            # Clear manual override to return to auto-detection
            draft_service.clear_manual_rankings()
            
            return jsonify({
                'success': True,
                'message': 'Switched to automatic league detection',
                'format': 'auto',
                'is_manual': False
            })
            
        else:
            return jsonify(validation_error(
                field="type",
                message="Invalid ranking type",
                value=ranking_type,
                context=context
            )), 400
            
    except Exception as e:
        return jsonify(internal_error(
            message="Failed to select rankings format",
            exception=e,
            context=context
        )), 500


@rankings_bp.route('/api/rankings/update', methods=['POST'])
@handle_api_errors
def update_rankings():
    """Update all rankings with error handling"""
    context = generate_request_context()
    
    try:
        result = rankings_manager.update_all_rankings()
        
        if result:
            return jsonify({
                'success': True,
                'message': 'Rankings update started successfully',
                'status': 'in_progress'
            })
        else:
            return jsonify(business_logic_error(
                message="Failed to start rankings update",
                details="Rankings update process could not be initiated",
                context=context,
                suggestions=[
                    "Check if another update is already in progress",
                    "Verify internet connectivity",
                    "Try again in a few moments",
                    "Contact support if the issue persists"
                ]
            )), 400
        
    except Exception as e:
        return jsonify(internal_error(
            message="Failed to update rankings",
            exception=e,
            context=context
        )), 500


@rankings_bp.route('/api/rankings/update/<scoring>/<format_type>', methods=['POST'])
@handle_api_errors
def update_specific_rankings(scoring, format_type):
    """Update specific rankings format with error handling"""
    context = generate_request_context()
    
    # Validate format parameters
    format_id = f"{scoring}_{format_type}"
    if not validate_rankings_format(format_id):
        return jsonify(validation_error(
            field="format",
            message="Invalid scoring format or league type",
            value=format_id,
            context=context
        )), 400
    
    try:
        result = rankings_manager.update_specific_format(scoring, format_type)
        
        if result:
            return jsonify({
                'success': True,
                'message': f'Update started for {scoring} {format_type} rankings',
                'format': format_id,
                'status': 'in_progress'
            })
        else:
            return jsonify(business_logic_error(
                message=f"Failed to start update for {scoring} {format_type}",
                details="Specific rankings update process could not be initiated",
                context=context,
                suggestions=[
                    "Check if the format combination is valid",
                    "Verify internet connectivity",
                    "Try updating all rankings instead",
                    "Contact support if the issue persists"
                ]
            )), 400
        
    except Exception as e:
        return jsonify(internal_error(
            message=f"Failed to update {scoring} {format_type} rankings",
            exception=e,
            context=context
        )), 500


# ============================================================================
# CUSTOM RANKINGS UPLOAD ENDPOINTS
# ============================================================================

@rankings_bp.route('/api/rankings/upload', methods=['POST'])
@handle_api_errors
def upload_custom_rankings():
    """Upload custom rankings CSV file with comprehensive validation"""
    context = generate_request_context()
    
    try:
        # Validate file presence
        if 'file' not in request.files:
            return jsonify(validation_error(
                field="file",
                message="No file provided in request",
                context=context
            )), 400
            
        file = request.files['file']
        
        # Validate file selection
        if file.filename == '':
            return jsonify(validation_error(
                field="file",
                message="No file selected",
                context=context
            )), 400
        
        # Validate file extension
        if not allowed_file(file.filename):
            return jsonify(validation_error(
                field="file",
                message="File must be a CSV format (.csv)",
                value=file.filename,
                context=context
            )), 400
        
        # Validate file size
        if not validate_file_size(file):
            return jsonify(validation_error(
                field="file",
                message=f"File size exceeds maximum allowed size of {MAX_FILE_SIZE // (1024*1024)}MB",
                context=context
            )), 400
        
        # Get metadata from form
        display_name = request.form.get('display_name', '').strip()
        if not display_name:
            display_name = file.filename.replace('.csv', '').replace('_', ' ').title()
        
        description = request.form.get('description', '').strip()
        if not description:
            description = f'Custom rankings uploaded from {file.filename}'
        
        scoring_format = request.form.get('scoring_format', 'half_ppr')
        league_type = request.form.get('league_type', 'standard')
        
        # Validate format parameters
        valid_scoring_formats = ['standard', 'half_ppr', 'ppr', 'custom']
        valid_league_types = ['standard', 'superflex', 'custom']
        
        if scoring_format not in valid_scoring_formats:
            return jsonify(validation_error(
                field="scoring_format",
                message=f"Invalid scoring format. Must be one of: {valid_scoring_formats}",
                value=scoring_format,
                context=context
            )), 400
        
        if league_type not in valid_league_types:
            return jsonify(validation_error(
                field="league_type",
                message=f"Invalid league type. Must be one of: {valid_league_types}",
                value=league_type,
                context=context
            )), 400
        
        # Process upload using RankingsManager
        result = rankings_manager.upload_custom_rankings(
            file, display_name, description, scoring_format, league_type
        )
        
        if result.get('success'):
            return jsonify({
                'success': True,
                'message': 'Custom rankings uploaded successfully',
                'data': {
                    'file_id': result['file_id'],
                    'filename': result['filename'],
                    'display_name': display_name,
                    'description': description,
                    'scoring_format': scoring_format,
                    'league_type': league_type,
                    'player_count': result['metadata']['player_count'],
                    'upload_time': result['metadata']['upload_time']
                }
            })
        else:
            return jsonify({
                'success': False,
                'error': result.get('error', 'Unknown upload error'),
                'message': 'Failed to process uploaded rankings',
                'suggestions': [
                    "Check CSV file format and structure",
                    "Ensure file contains required columns (name, position)",
                    "Verify player names and positions are valid",
                    "Try uploading a smaller file",
                    "Contact support if issue persists"
                ]
            }), 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to upload custom rankings',
            'details': str(e)
        }), 500


@rankings_bp.route('/api/rankings/custom', methods=['GET'])
@handle_api_errors
def get_custom_rankings():
    """Get list of all custom rankings with metadata"""
    context = generate_request_context()
    
    try:
        rankings_list = rankings_manager.get_custom_rankings_list()
        
        return jsonify({
            'success': True,
            'rankings': rankings_list,
            'total_count': len(rankings_list)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to retrieve custom rankings list',
            'rankings': [],
            'total_count': 0
        }), 500


@rankings_bp.route('/api/rankings/custom/<file_id>', methods=['DELETE'])
@handle_api_errors
def delete_custom_rankings(file_id):
    """Delete custom rankings file and metadata"""
    context = generate_request_context()
    
    try:
        result = rankings_manager.delete_custom_rankings(file_id)
        
        if result.get('success'):
            return jsonify({
                'success': True,
                'message': result['message']
            })
        else:
            return jsonify({
                'success': False,
                'error': result.get('error', 'Unknown deletion error'),
                'message': 'Failed to delete custom rankings',
                'suggestions': [
                    "Check if the rankings file exists",
                    "Verify the file ID is correct",
                    "Try refreshing the page and attempting again",
                    "Contact support if issue persists"
                ]
            }), 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to delete custom rankings'
        }), 500


@rankings_bp.route('/api/rankings/debug', methods=['GET'])
@handle_api_errors
def debug_custom_rankings():
    """Debug endpoint to check custom rankings data structure"""
    context = generate_request_context()
    
    try:
        # Get raw custom rankings data
        custom_rankings = rankings_manager.get_custom_rankings_list()
        
        # Get available formats
        available_formats = rankings_manager.get_available_formats()
        
        return jsonify({
            'success': True,
            'debug_info': {
                'custom_rankings_count': len(custom_rankings),
                'custom_rankings_sample': custom_rankings[:1] if custom_rankings else [],
                'available_formats_keys': list(available_formats.keys()),
                'custom_formats': available_formats.get('custom', {}),
                'manual_override': getattr(draft_service, 'manual_rankings_override', None)
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Debug endpoint failed'
        }), 500
