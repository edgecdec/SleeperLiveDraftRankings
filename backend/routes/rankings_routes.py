"""
Simple Rankings Routes - No Complex Validation

This module contains simplified rankings-related API endpoints.
"""

import os
from datetime import datetime
from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename

# Create blueprint for rankings routes
rankings_bp = Blueprint('rankings', __name__)

# Configuration
ALLOWED_EXTENSIONS = {'csv'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_file_size(file_obj):
    """Validate file size"""
    if hasattr(file_obj, 'content_length') and file_obj.content_length:
        return file_obj.content_length <= MAX_FILE_SIZE
    return True

# Initialize services
rankings_manager = None
draft_service = None

def init_rankings_routes(rm, ds):
    """Initialize rankings routes with services"""
    global rankings_manager, draft_service
    rankings_manager = rm
    draft_service = ds


@rankings_bp.route('/api/rankings/formats', methods=['GET'])
def get_rankings_formats():
    """Get all available ranking formats"""
    try:
        formats = rankings_manager.get_available_formats()
        return jsonify(formats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@rankings_bp.route('/api/rankings/status', methods=['GET'])
def get_rankings_status():
    """Get current rankings status"""
    try:
        # Get current format info
        current_format = draft_service.get_current_format_info()
        
        return jsonify({
            'success': True,
            'current_format': current_format,
            'total_rankings': len(rankings_manager.get_available_formats()),
            'last_updated': rankings_manager.last_update_time.isoformat() if rankings_manager.last_update_time else None
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@rankings_bp.route('/api/rankings/select', methods=['POST'])
def select_rankings():
    """Select rankings format - simplified without validation"""
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400
    
    ranking_type = data.get('type')
    ranking_id = data.get('id')
    
    if not ranking_type:
        return jsonify({'success': False, 'error': 'Type is required'}), 400
    
    try:
        if ranking_type == 'fantasypros':
            if not ranking_id:
                return jsonify({'success': False, 'error': 'ID is required for FantasyPros rankings'}), 400
            
            # Parse format key (e.g., "half_ppr_superflex")
            parts = ranking_id.split('_')
            if len(parts) < 2:
                return jsonify({'success': False, 'error': 'Invalid format key structure'}), 400
            
            scoring = '_'.join(parts[:-1])  # e.g., "half_ppr"
            format_type = parts[-1]         # e.g., "superflex"
            
            # Set manual override in DraftService
            draft_service.set_manual_rankings(scoring, format_type)
            print(f"🎯 Set FantasyPros rankings: {scoring} {format_type}")
            
            return jsonify({
                'success': True,
                'message': f'Selected {scoring} {format_type} rankings',
                'format': f'{scoring}_{format_type}',
                'is_manual': True
            })
            
        elif ranking_type == 'custom':
            if not ranking_id:
                return jsonify({'success': False, 'error': 'ID is required for custom rankings'}), 400
            
            # Just check if the custom ranking exists in our list
            custom_rankings = rankings_manager.get_custom_rankings_list()
            custom_ranking = next((r for r in custom_rankings if r['id'] == ranking_id), None)
            
            if not custom_ranking:
                return jsonify({'success': False, 'error': 'Custom rankings not found'}), 404
            
            # Set custom rankings in DraftService
            draft_service.set_manual_rankings('custom', ranking_id)
            print(f"🎯 Set custom rankings: {ranking_id} ({custom_ranking['display_name']})")
            
            # Force clear any cached data to ensure new rankings are used
            if hasattr(draft_service, 'cached_data'):
                draft_service.cached_data = None
                print("🔄 Cleared draft service cache")
            
            return jsonify({
                'success': True,
                'message': f'Selected custom rankings: {custom_ranking["display_name"]}',
                'format': 'custom',
                'custom_id': ranking_id,
                'display_name': custom_ranking['display_name'],
                'description': custom_ranking['description'],
                'player_count': custom_ranking['player_count'],
                'is_manual': True,
                'type': 'custom',
                'cache_cleared': True  # Indicate that cache was cleared
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
            return jsonify({'success': False, 'error': f'Unknown ranking type: {ranking_type}'}), 400
            
    except Exception as e:
        print(f"❌ Error selecting rankings: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@rankings_bp.route('/api/rankings/refresh', methods=['POST'])
def refresh_rankings():
    """Force refresh rankings data - clears all caches"""
    try:
        # Clear draft service cache
        if hasattr(draft_service, 'cached_data'):
            draft_service.cached_data = None
            draft_service.last_update = None
            print("🔄 Cleared draft service cache")
        
        # Clear rankings manager cache if it exists
        if hasattr(rankings_manager, 'rankings_cache'):
            rankings_manager.rankings_cache = {}
            print("🔄 Cleared rankings manager cache")
        
        return jsonify({
            'success': True,
            'message': 'Rankings data refreshed successfully',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"❌ Error refreshing rankings: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@rankings_bp.route('/api/rankings/upload', methods=['POST'])
def upload_custom_rankings():
    """Upload custom rankings CSV file"""
    try:
        # Validate file presence
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
            
        file = request.files['file']
        
        # Validate file selection
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        # Validate file extension
        if not allowed_file(file.filename):
            return jsonify({'success': False, 'error': 'File must be a CSV format (.csv)'}), 400
        
        # Validate file size
        if not validate_file_size(file):
            return jsonify({'success': False, 'error': f'File size exceeds maximum allowed size of {MAX_FILE_SIZE // (1024*1024)}MB'}), 400
        
        # Get metadata from form
        display_name = request.form.get('display_name', '').strip()
        if not display_name:
            display_name = file.filename.replace('.csv', '').replace('_', ' ').title()
        
        description = request.form.get('description', '').strip()
        if not description:
            description = f'Custom rankings uploaded from {file.filename}'
        
        scoring_format = request.form.get('scoring_format', 'half_ppr')
        league_type = request.form.get('league_type', 'standard')
        
        # Process upload
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
            return jsonify({'success': False, 'error': result.get('error', 'Unknown upload error')}), 400
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@rankings_bp.route('/api/rankings/custom', methods=['GET'])
def get_custom_rankings():
    """Get list of all custom rankings with metadata"""
    try:
        rankings_list = rankings_manager.get_custom_rankings_list()
        
        return jsonify({
            'success': True,
            'rankings': rankings_list,
            'total_count': len(rankings_list)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e), 'rankings': [], 'total_count': 0}), 500


@rankings_bp.route('/api/rankings/custom/<file_id>', methods=['DELETE'])
def delete_custom_rankings(file_id):
    """Delete custom rankings file and metadata"""
    try:
        result = rankings_manager.delete_custom_rankings(file_id)
        
        if result.get('success'):
            return jsonify({
                'success': True,
                'message': result['message']
            })
        else:
            return jsonify({'success': False, 'error': result.get('error', 'Unknown deletion error')}), 400
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@rankings_bp.route('/api/rankings/debug', methods=['GET'])
def debug_custom_rankings():
    """Debug endpoint to check custom rankings data structure"""
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
        return jsonify({'success': False, 'error': str(e)}), 500


@rankings_bp.route('/api/rankings/use-file', methods=['POST'])
def use_rankings_file():
    """Simple endpoint to use a rankings file by filename"""
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400
    
    filename = data.get('filename')
    display_name = data.get('display_name', filename)
    
    if not filename:
        return jsonify({'success': False, 'error': 'Filename is required'}), 400
    
    try:
        # Store the filename directly in a simple way
        # We'll create a simple file to store the current selection
        current_selection = {
            'filename': filename,
            'display_name': display_name,
            'selected_at': datetime.now().isoformat(),
            'type': 'custom'
        }
        
        # Save to a simple JSON file
        with open('current_rankings_selection.json', 'w') as f:
            import json
            json.dump(current_selection, f, indent=2)
        
        print(f"🎯 Selected rankings file: {filename} ({display_name})")
        
        # Clear any caches
        if draft_service and hasattr(draft_service, 'cached_data'):
            draft_service.cached_data = None
            draft_service.last_update = None
            print("🔄 Cleared draft service cache")
        
        return jsonify({
            'success': True,
            'message': f'Now using: {display_name}',
            'filename': filename,
            'display_name': display_name
        })
        
    except Exception as e:
        print(f"❌ Error selecting rankings file: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@rankings_bp.route('/api/rankings/current-selection', methods=['GET'])
def get_current_selection():
    """Get the currently selected rankings file"""
    try:
        if os.path.exists('current_rankings_selection.json'):
            with open('current_rankings_selection.json', 'r') as f:
                import json
                selection = json.load(f)
            return jsonify({
                'success': True,
                'selection': selection
            })
        else:
            return jsonify({
                'success': True,
                'selection': None
            })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
