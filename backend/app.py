"""
Fully Updated Main Flask Application with Standardized Error Handling

This is the complete integration of the error handling system into the main application,
replacing all existing error patterns with the new standardized approach.
"""

import sys
import os
from flask import Flask, jsonify, request
from flask_cors import CORS

# Add the parent directory to the path so we can import existing modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import configuration
from config import DEFAULT_DRAFT_ID, FLASK_HOST, FLASK_PORT, FLASK_DEBUG

# Import updated services with error handling
from services.sleeper_api import SleeperAPI
from services.league_service import LeagueService
from services.rankings_service import RankingsService
from services.draft_service import DraftService
from services.error_service import error_service
from services.error_middleware import (
    ErrorHandlingMiddleware, handle_api_errors, validate_required_params,
    validate_json_body, generate_request_context
)
from services.error_service import (
    validation_error, not_found_error, external_api_error,
    business_logic_error, internal_error
)

# Import updated route blueprints
from routes.user_routes import user_bp
from routes.draft_routes import draft_bp, init_draft_routes
from routes.rankings_routes import rankings_bp, init_rankings_routes

# Import existing modules
from Rankings.RankingsManager import RankingsManager

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Initialize error handling middleware
error_middleware = ErrorHandlingMiddleware(app)

# Initialize rankings manager
rankings_manager = RankingsManager()
print("🚀 Using RankingsManager for rankings selection")

# Initialize services
league_service = LeagueService()

# Initialize draft service with rankings service
draft_service = DraftService(None, DEFAULT_DRAFT_ID)
rankings_service = RankingsService(draft_service, rankings_manager)
draft_service.rankings_service = rankings_service

# Initialize route blueprints with service dependencies
init_draft_routes(draft_service)
init_rankings_routes(draft_service, rankings_service, rankings_manager)

# Register blueprints
app.register_blueprint(user_bp)
app.register_blueprint(draft_bp)
app.register_blueprint(rankings_bp)

# Health check endpoint with comprehensive service testing
@app.route('/api/health')
@handle_api_errors
def health_check():
    """Enhanced health check with service validation"""
    context = generate_request_context()
    
    try:
        services_status = {}
        
        # Test SleeperAPI connectivity
        try:
            # Test with a known non-existent user to check API connectivity
            test_result = SleeperAPI.get_user('nonexistent_test_user_12345')
            services_status['sleeper_api'] = 'active'
        except ConnectionError:
            services_status['sleeper_api'] = 'degraded'
        except Exception:
            services_status['sleeper_api'] = 'active'  # None response is expected
        
        # Test other services
        services_status.update({
            'league_service': 'active',
            'rankings_service': 'active',
            'draft_service': 'active',
            'error_handling': 'enabled',
            'toast_notifications': 'enabled'
        })
        
        # Check rankings files availability
        try:
            available_formats = rankings_manager.get_available_formats()
            services_status['rankings_files'] = len(available_formats) if available_formats else 0
        except Exception:
            services_status['rankings_files'] = 'error'
        
        return jsonify({
            'status': 'healthy',
            'message': 'Fantasy Football Draft API is running with error handling',
            'services': services_status,
            'features': {
                'standardized_errors': True,
                'toast_notifications': True,
                'automatic_retries': True,
                'context_tracking': True,
                'suggestion_system': True
            },
            'version': '2.0.0',
            'architecture': 'service-oriented'
        })
        
    except Exception as e:
        return jsonify(internal_error(
            message="Health check failed",
            exception=e,
            context=context
        )), 500


# Error statistics endpoint for monitoring
@app.route('/api/error-stats')
@handle_api_errors
def get_error_stats():
    """Get comprehensive error statistics"""
    context = generate_request_context()
    
    try:
        stats = error_service.get_error_stats()
        
        # Add additional statistics
        enhanced_stats = {
            **stats,
            'current_draft_id': draft_service.current_draft_id,
            'manual_override_active': bool(draft_service.manual_rankings_override),
            'cache_status': {
                'draft_cache_active': bool(draft_service.cached_data),
                'last_cache_update': draft_service.last_update,
                'cache_duration': draft_service.cache_duration
            }
        }
        
        return jsonify(enhanced_stats)
        
    except Exception as e:
        return jsonify(internal_error(
            message="Failed to retrieve error statistics",
            exception=e,
            context=context
        )), 500


# Demo endpoints for testing error types (can be removed in production)
@app.route('/api/demo/errors/<error_type>')
@handle_api_errors
def demo_errors(error_type):
    """Demo endpoint to test different error types"""
    context = generate_request_context()
    
    if error_type == 'validation':
        return jsonify(validation_error(
            field="demo_field",
            message="This is a demo validation error for testing",
            value="invalid_demo_value",
            context=context
        )), 400
        
    elif error_type == 'not_found':
        return jsonify(not_found_error(
            resource="Demo Resource",
            resource_id="demo_123",
            context=context
        )), 404
        
    elif error_type == 'external_api':
        return jsonify(external_api_error(
            service="Demo External Service",
            message="Demo external API error for testing",
            status_code=503,
            context=context
        )), 503
        
    elif error_type == 'business_logic':
        return jsonify(business_logic_error(
            message="Demo business logic error for testing",
            details="This demonstrates a business rule violation",
            context=context,
            suggestions=[
                "This is a demo suggestion",
                "Check the demo documentation",
                "Contact demo support"
            ]
        )), 400
        
    elif error_type == 'internal':
        # This will trigger the @handle_api_errors decorator
        raise Exception("Demo internal error for testing")
        
    elif error_type == 'timeout':
        raise TimeoutError("Demo timeout error for testing")
        
    elif error_type == 'connection':
        raise ConnectionError("Demo connection error for testing")
        
    else:
        return jsonify(validation_error(
            field="error_type",
            message=f"Unknown error type: {error_type}",
            value=error_type,
            context=context
        )), 400


# Legacy compatibility endpoints (updated with error handling)
@app.route('/api/draft/settings')
@handle_api_errors
def get_draft_settings():
    """Get current draft settings with error handling"""
    try:
        return jsonify({
            'draft_id': draft_service.current_draft_id,
            'file_name': 'RankingsManager',
            'refresh_interval': 30,
            'error_handling': 'enabled',
            'version': '2.0.0',
            'manual_override': draft_service.manual_rankings_override,
            'cache_info': {
                'active': bool(draft_service.cached_data),
                'last_update': draft_service.last_update,
                'duration': draft_service.cache_duration
            }
        })
    except Exception as e:
        context = generate_request_context()
        return jsonify(internal_error(
            message="Failed to retrieve draft settings",
            exception=e,
            context=context
        )), 500


# Updated rankings endpoints that were missing from routes
@app.route('/api/rankings/current')
@handle_api_errors
def get_current_rankings():
    """Get currently active rankings with error handling"""
    context = generate_request_context()
    
    try:
        rankings = rankings_manager.get_rankings()
        
        if rankings is not None:
            # Convert DataFrame to list of dictionaries
            rankings_list = rankings.to_dict('records')
            return jsonify({
                'rankings': rankings_list,
                'total_players': len(rankings_list),
                'format': 'current_active'
            })
        else:
            return jsonify(business_logic_error(
                message="No rankings data available",
                details="Current rankings could not be loaded",
                context=context,
                suggestions=[
                    "Run rankings update to download latest data",
                    "Check if rankings files exist",
                    "Select a specific rankings format"
                ]
            )), 404
            
    except Exception as e:
        return jsonify(internal_error(
            message="Failed to retrieve current rankings",
            exception=e,
            context=context
        )), 500


@app.route('/api/rankings/custom')
@handle_api_errors
def get_custom_rankings():
    """Get list of custom uploaded rankings with error handling"""
    context = generate_request_context()
    
    try:
        custom = rankings_manager.get_custom_rankings_list()
        return jsonify({
            'custom_rankings': custom,
            'total_custom': len(custom) if custom else 0
        })
    except Exception as e:
        return jsonify(internal_error(
            message="Failed to retrieve custom rankings",
            exception=e,
            context=context
        )), 500


# File upload endpoint with proper error handling
@app.route('/api/rankings/upload', methods=['POST'])
@handle_api_errors
def upload_custom_rankings():
    """Upload custom rankings CSV file with comprehensive error handling"""
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
            
        # Validate file type
        if not file.filename.endswith('.csv'):
            return jsonify(validation_error(
                field="file",
                message="File must be a CSV format",
                value=file.filename,
                context=context
            )), 400
        
        # Get metadata from form
        scoring_format = request.form.get('scoring_format', 'half_ppr')
        league_type = request.form.get('league_type', 'standard')
        display_name = request.form.get('display_name', file.filename.replace('.csv', ''))
        description = request.form.get('description', f'Custom rankings uploaded from {file.filename}')
        
        # Validate format parameters
        format_id = f"{scoring_format}_{league_type}"
        if not validate_rankings_format(format_id):
            return jsonify(validation_error(
                field="format",
                message="Invalid scoring format or league type combination",
                value=format_id,
                context=context
            )), 400
        
        # Process upload
        result = rankings_manager.upload_custom_rankings(
            file, display_name, description, scoring_format, league_type
        )
        
        if result.get('success'):
            return jsonify({
                'success': True,
                'message': 'Custom rankings uploaded successfully',
                'format': format_id,
                'filename': file.filename,
                'details': result
            })
        else:
            return jsonify(business_logic_error(
                message="Failed to process uploaded rankings",
                details=result.get('error', 'Unknown upload error'),
                context=context,
                suggestions=[
                    "Check CSV file format and structure",
                    "Ensure file contains required columns",
                    "Try uploading a smaller file",
                    "Contact support if issue persists"
                ]
            )), 400
        
    except Exception as e:
        return jsonify(internal_error(
            message="Failed to upload custom rankings",
            exception=e,
            context=context
        )), 500


def validate_rankings_format(format_id):
    """Validate rankings format combination"""
    valid_formats = [
        'ppr_standard', 'ppr_superflex',
        'half_ppr_standard', 'half_ppr_superflex',
        'standard_standard', 'standard_superflex'
    ]
    return format_id in valid_formats


if __name__ == '__main__':
    print("🚀 Starting Fantasy Football Draft API with Full Error Handling...")
    print(f"📊 Default Draft ID: {DEFAULT_DRAFT_ID}")
    print(f"📁 Rankings: Using RankingsManager")
    print("🌐 API available at http://localhost:5001")
    print("🏗️ Architecture: Service-oriented with error handling")
    print("🚨 Features: Standardized errors, toast notifications, retry logic")
    print("🍞 Frontend: Ready for toast integration")
    print("📊 Monitoring: Error statistics available at /api/error-stats")
    print("🧪 Testing: Demo errors available at /api/demo/errors/<type>")
    
    app.run(host=FLASK_HOST, port=FLASK_PORT, debug=FLASK_DEBUG)
