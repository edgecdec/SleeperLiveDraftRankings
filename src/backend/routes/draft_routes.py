"""
Updated Draft Routes with Standardized Error Handling

This module demonstrates how to integrate the new error handling system
into existing route handlers for consistent error responses and toast notifications.
"""

from flask import Blueprint, jsonify, request
from services.sleeper_api import SleeperAPI
from services.error_middleware import (
    handle_api_errors, validate_required_params, validate_json_body,
    validate_sleeper_id, generate_request_context
)
from services.error_service import (
    validation_error, not_found_error, external_api_error, 
    business_logic_error, internal_error
)

# Create blueprint for draft routes
draft_bp = Blueprint('draft', __name__)

# Global draft service will be injected
draft_service = None


def init_draft_routes(draft_service_instance):
    """Initialize draft routes with draft service instance"""
    global draft_service
    draft_service = draft_service_instance


@draft_bp.route('/api/draft/<draft_id>/info')
@handle_api_errors
def get_draft_info(draft_id):
    """Get draft information with standardized error handling"""
    context = generate_request_context()
    
    # Validate draft ID format
    if not validate_sleeper_id(draft_id, 'draft'):
        return jsonify(validation_error(
            field="draft_id",
            message="Invalid draft ID format",
            value=draft_id,
            context=context
        )), 400
    
    try:
        draft_info = SleeperAPI.get_draft_info(draft_id)
        
        if not draft_info:
            return jsonify(not_found_error(
                resource="Draft",
                resource_id=draft_id,
                context=context
            )), 404
        
        return jsonify(draft_info)
        
    except ConnectionError as e:
        return jsonify(external_api_error(
            service="Sleeper",
            message="Unable to fetch draft information from Sleeper",
            context=context
        )), 503


@draft_bp.route('/api/draft/status')
@handle_api_errors
def get_draft_status():
    """Get current draft status with error handling"""
    context = generate_request_context()
    draft_id = request.args.get('draft_id')
    
    # Use current draft if no ID provided
    if not draft_id:
        if not draft_service.current_draft_id:
            return jsonify(business_logic_error(
                message="No active draft selected",
                details="Please select a draft first or provide a draft_id parameter",
                context=context,
                suggestions=[
                    "Use the draft selection interface to choose a draft",
                    "Provide a draft_id query parameter",
                    "Check if you have any available drafts"
                ]
            )), 400
        draft_id = draft_service.current_draft_id
    
    # Validate draft ID
    if not validate_sleeper_id(draft_id, 'draft'):
        return jsonify(validation_error(
            field="draft_id",
            message="Invalid draft ID format",
            value=draft_id,
            context=context
        )), 400
    
    try:
        draft_data = draft_service.get_draft_data(draft_id)
        
        if 'error' in draft_data:
            return jsonify(business_logic_error(
                message=draft_data['error'],
                context=context
            )), 400
        
        return jsonify(draft_data)
        
    except Exception as e:
        return jsonify(internal_error(
            message="Failed to retrieve draft status",
            exception=e,
            context=context
        )), 500


@draft_bp.route('/api/draft/refresh')
@handle_api_errors
def refresh_draft_data():
    """Force refresh of draft data with error handling"""
    context = generate_request_context()
    draft_id = request.args.get('draft_id')
    
    if not draft_id and not draft_service.current_draft_id:
        return jsonify(business_logic_error(
            message="No draft specified for refresh",
            details="Provide a draft_id parameter or select an active draft",
            context=context,
            suggestions=[
                "Add ?draft_id=YOUR_DRAFT_ID to the URL",
                "Select an active draft first",
                "Check your available drafts"
            ]
        )), 400
    
    target_draft_id = draft_id or draft_service.current_draft_id
    
    if not validate_sleeper_id(target_draft_id, 'draft'):
        return jsonify(validation_error(
            field="draft_id",
            message="Invalid draft ID format",
            value=target_draft_id,
            context=context
        )), 400
    
    try:
        # Clear cache and get fresh data
        draft_service.cached_data = None
        draft_service.last_update = None
        
        draft_data = draft_service.get_draft_data(target_draft_id)
        
        if 'error' in draft_data:
            return jsonify(business_logic_error(
                message=f"Failed to refresh draft data: {draft_data['error']}",
                context=context
            )), 400
        
        return jsonify(draft_data)
        
    except Exception as e:
        return jsonify(internal_error(
            message="Failed to refresh draft data",
            exception=e,
            context=context
        )), 500


@draft_bp.route('/api/draft/set', methods=['POST'])
@validate_json_body(['draft_id'])
@handle_api_errors
def set_current_draft():
    """Set the current draft ID with validation"""
    context = generate_request_context()
    data = request.get_json()
    draft_id = data.get('draft_id')
    
    # Validate draft ID format
    if not validate_sleeper_id(draft_id, 'draft'):
        return jsonify(validation_error(
            field="draft_id",
            message="Invalid draft ID format",
            value=draft_id,
            context=context
        )), 400
    
    try:
        # Verify draft exists before setting it
        draft_info = SleeperAPI.get_draft_info(draft_id)
        if not draft_info:
            return jsonify(not_found_error(
                resource="Draft",
                resource_id=draft_id,
                context=context
            )), 404
        
        # Set the draft
        draft_service.set_draft_id(draft_id)
        
        return jsonify({
            'success': True,
            'draft_id': draft_id,
            'message': 'Draft selected successfully',
            'draft_info': {
                'name': draft_info.get('metadata', {}).get('name', 'Unknown Draft'),
                'status': draft_info.get('status', 'unknown'),
                'league_id': draft_info.get('league_id')
            }
        })
        
    except ConnectionError as e:
        return jsonify(external_api_error(
            service="Sleeper",
            message="Unable to verify draft with Sleeper",
            context=context
        )), 503
    except Exception as e:
        return jsonify(internal_error(
            message="Failed to set current draft",
            exception=e,
            context=context
        )), 500


@draft_bp.route('/api/draft/<draft_id>')
@handle_api_errors
def get_draft_data(draft_id):
    """Get comprehensive draft data with error handling"""
    context = generate_request_context()
    
    # Validate draft ID
    if not validate_sleeper_id(draft_id, 'draft'):
        return jsonify(validation_error(
            field="draft_id",
            message="Invalid draft ID format",
            value=draft_id,
            context=context
        )), 400
    
    try:
        # Set the draft ID
        draft_service.set_draft_id(draft_id)
        
        # Get the draft data
        draft_data = draft_service.get_draft_data()
        
        if 'error' in draft_data:
            error_msg = draft_data['error']
            
            # Categorize different types of errors
            if 'not found' in error_msg.lower():
                return jsonify(not_found_error(
                    resource="Draft or League",
                    resource_id=draft_id,
                    context=context
                )), 404
            elif 'league information' in error_msg.lower():
                return jsonify(business_logic_error(
                    message="Unable to load league information for this draft",
                    details=error_msg,
                    context=context,
                    suggestions=[
                        "Verify the draft ID is correct",
                        "Check if the draft exists in Sleeper",
                        "Try refreshing the data"
                    ]
                )), 400
            else:
                return jsonify(business_logic_error(
                    message=error_msg,
                    context=context
                )), 400
        
        return jsonify(draft_data)
        
    except ConnectionError as e:
        return jsonify(external_api_error(
            service="Sleeper",
            message="Unable to connect to Sleeper API",
            context=context
        )), 503
    except Exception as e:
        return jsonify(internal_error(
            message="Failed to retrieve draft data",
            exception=e,
            context=context
        )), 500


@draft_bp.route('/api/draft')
@handle_api_errors
def get_current_draft_data():
    """Get current draft data with error handling"""
    context = generate_request_context()
    
    if not draft_service.current_draft_id:
        return jsonify(business_logic_error(
            message="No active draft selected",
            details="Please select a draft before accessing draft data",
            context=context,
            suggestions=[
                "Use the draft selection interface",
                "Call /api/draft/set with a draft_id",
                "Check your available drafts"
            ]
        )), 400
    
    try:
        draft_data = draft_service.get_draft_data()
        
        if 'error' in draft_data:
            return jsonify(business_logic_error(
                message=draft_data['error'],
                context=context
            )), 400
        
        return jsonify(draft_data)
        
    except Exception as e:
        return jsonify(internal_error(
            message="Failed to retrieve current draft data",
            exception=e,
            context=context
        )), 500
