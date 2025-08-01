"""
Upload Routes - Mock Draft Functionality Only

This module contains only mock draft related endpoints.
Rankings upload functionality has been moved to rankings_routes.py
"""

from flask import Blueprint, jsonify, request
import os
import json
from datetime import datetime
from services.error_middleware import (
    handle_api_errors, generate_request_context
)
from services.error_service import (
    validation_error, business_logic_error, internal_error
)

# Create blueprint for upload routes (mock draft only)
upload_bp = Blueprint('upload', __name__)

# Configuration
MOCK_DRAFT_CONFIG_FILE = 'mock_draft_config.json'


# ============================================================================
# MOCK DRAFT CONFIGURATION ENDPOINTS
# ============================================================================

@upload_bp.route('/api/mock-draft/config', methods=['GET'])
@handle_api_errors
def get_mock_draft_config():
    """Get current mock draft configuration"""
    context = generate_request_context()
    
    try:
        config = _load_mock_draft_config()
        return jsonify({
            'success': True,
            'config': config
        })
        
    except Exception as e:
        return jsonify(internal_error(
            message="Failed to retrieve mock draft configuration",
            exception=e,
            context=context
        )), 500


@upload_bp.route('/api/mock-draft/config', methods=['POST'])
@handle_api_errors
def set_mock_draft_config():
    """Set mock draft ID and configuration"""
    context = generate_request_context()
    
    try:
        data = request.get_json()
        if not data:
            return jsonify(validation_error(
                field="request_body",
                message="Request body must contain JSON data",
                context=context
            )), 400
        
        draft_id = data.get('draft_id', '').strip()
        if not draft_id:
            return jsonify(validation_error(
                field="draft_id",
                message="Draft ID is required",
                context=context
            )), 400
        
        # Validate draft ID format (Sleeper draft IDs are typically numeric)
        if not draft_id.isdigit():
            return jsonify(validation_error(
                field="draft_id",
                message="Draft ID must be numeric",
                value=draft_id,
                context=context
            )), 400
        
        # Optional: Validate draft exists by calling Sleeper API
        validate_draft = data.get('validate_draft', True)
        if validate_draft:
            try:
                from services.sleeper_api import SleeperAPI
                draft_info = SleeperAPI.get_draft_info(draft_id)
                if not draft_info:
                    return jsonify(business_logic_error(
                        message="Draft not found",
                        details=f"No draft found with ID: {draft_id}",
                        context=context,
                        suggestions=[
                            "Check if the draft ID is correct",
                            "Verify the draft exists on Sleeper",
                            "Try a different draft ID"
                        ]
                    )), 404
            except Exception as e:
                return jsonify(business_logic_error(
                    message="Could not validate draft",
                    details=f"Error checking draft existence: {str(e)}",
                    context=context,
                    suggestions=[
                        "Check internet connection",
                        "Try again in a moment",
                        "Skip validation by setting validate_draft to false"
                    ]
                )), 400
        
        # Create configuration
        config = {
            'draft_id': draft_id,
            'description': data.get('description', f'Mock Draft {draft_id}'),
            'auto_refresh': data.get('auto_refresh', True),
            'refresh_interval': data.get('refresh_interval', 30),
            'created_at': datetime.now().isoformat(),
            'last_updated': datetime.now().isoformat(),
            'is_active': True
        }
        
        # Save configuration
        _save_mock_draft_config(config)
        
        # Update the draft service with new draft ID
        try:
            from app import draft_service
            draft_service.current_draft_id = draft_id
            print(f"🎯 Updated draft service with mock draft ID: {draft_id}")
        except Exception as e:
            print(f"⚠️ Could not update draft service: {e}")
        
        return jsonify({
            'success': True,
            'message': f'Mock draft configuration saved successfully',
            'config': config
        })
        
    except Exception as e:
        return jsonify(internal_error(
            message="Failed to save mock draft configuration",
            exception=e,
            context=context
        )), 500


@upload_bp.route('/api/mock-draft/config', methods=['DELETE'])
@handle_api_errors
def clear_mock_draft_config():
    """Clear mock draft configuration"""
    context = generate_request_context()
    
    try:
        # Clear configuration file
        if os.path.exists(MOCK_DRAFT_CONFIG_FILE):
            os.remove(MOCK_DRAFT_CONFIG_FILE)
        
        # Clear draft service
        try:
            from app import draft_service
            draft_service.current_draft_id = None
            print("🗑️ Cleared mock draft configuration")
        except Exception as e:
            print(f"⚠️ Could not clear draft service: {e}")
        
        return jsonify({
            'success': True,
            'message': 'Mock draft configuration cleared successfully'
        })
        
    except Exception as e:
        return jsonify(internal_error(
            message="Failed to clear mock draft configuration",
            exception=e,
            context=context
        )), 500


@upload_bp.route('/api/mock-draft/status', methods=['GET'])
@handle_api_errors
def get_mock_draft_status():
    """Get current mock draft status and live data"""
    context = generate_request_context()
    
    try:
        config = _load_mock_draft_config()
        
        if not config or not config.get('is_active'):
            return jsonify({
                'success': True,
                'is_configured': False,
                'message': 'No active mock draft configuration'
            })
        
        draft_id = config['draft_id']
        
        # Get formatted draft data using DraftService (same as regular drafts)
        try:
            from app import draft_service
            draft_data = draft_service.get_draft_data(draft_id)
            
            if 'error' in draft_data:
                return jsonify({
                    'success': True,
                    'is_configured': True,
                    'config': config,
                    'error': draft_data['error'],
                    'suggestions': [
                        'Check internet connection',
                        'Verify draft ID is correct',
                        'Try refreshing the page'
                    ]
                })
            
            # Add mock draft specific metadata to the response
            draft_data['is_mock_draft'] = True
            draft_data['mock_config'] = config
            
            return jsonify(draft_data)
            
        except Exception as e:
            return jsonify({
                'success': True,
                'is_configured': True,
                'config': config,
                'error': f'Could not fetch draft data: {str(e)}',
                'suggestions': [
                    'Check internet connection',
                    'Verify draft ID is correct',
                    'Try refreshing the page'
                ]
            })
        
    except Exception as e:
        return jsonify(internal_error(
            message="Failed to get mock draft status",
            exception=e,
            context=context
        )), 500


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def _load_mock_draft_config():
    """Load mock draft configuration from file"""
    try:
        if os.path.exists(MOCK_DRAFT_CONFIG_FILE):
            with open(MOCK_DRAFT_CONFIG_FILE, 'r') as f:
                return json.load(f)
        return {}
    except Exception as e:
        print(f"⚠️ Error loading mock draft config: {e}")
        return {}


def _save_mock_draft_config(config):
    """Save mock draft configuration to file"""
    try:
        with open(MOCK_DRAFT_CONFIG_FILE, 'w') as f:
            json.dump(config, f, indent=2)
        print(f"💾 Saved mock draft config: {config['draft_id']}")
    except Exception as e:
        print(f"⚠️ Error saving mock draft config: {e}")
        raise


def _get_last_pick_time(drafted_players):
    """Get the timestamp of the last pick"""
    if not drafted_players:
        return None
    
    # Find the most recent pick
    latest_pick = max(drafted_players, key=lambda x: x.get('pick_no', 0))
    return latest_pick.get('picked_at', None)
