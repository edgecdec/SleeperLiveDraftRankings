"""
Main Flask Application with Standardized Error Handling

This demonstrates how to integrate the error handling system into the main application.
"""

import sys
import os
from flask import Flask, jsonify
from flask_cors import CORS

# Add the parent directory to the path so we can import existing modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import configuration
from config import DEFAULT_DRAFT_ID, FLASK_HOST, FLASK_PORT, FLASK_DEBUG

# Import services
from services.sleeper_api import SleeperAPI
from services.league_service import LeagueService
from services.rankings_service import RankingsService
from services.draft_service import DraftService
from services.error_service import error_service
from services.error_middleware import ErrorHandlingMiddleware, handle_api_errors

# Import route blueprints (using updated versions with error handling)
from routes.user_routes import user_bp
from routes.draft_routes_updated import draft_bp, init_draft_routes
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

# Initialize draft service (this will create rankings service internally)
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

# Health check endpoint with error handling
@app.route('/api/health')
@handle_api_errors
def health_check():
    """Health check endpoint with service status"""
    try:
        # Test basic service functionality
        services_status = {
            'sleeper_api': 'active',
            'league_service': 'active',
            'rankings_service': 'active',
            'draft_service': 'active'
        }
        
        # Test external connectivity (optional)
        try:
            test_user = SleeperAPI.get_user('test')  # This will return None for non-existent user
            services_status['sleeper_connectivity'] = 'active'
        except:
            services_status['sleeper_connectivity'] = 'degraded'
        
        return jsonify({
            'status': 'healthy',
            'message': 'Fantasy Football Draft API is running',
            'services': services_status,
            'error_handling': 'enabled',
            'version': '1.0.0'
        })
        
    except Exception as e:
        # This will be caught by @handle_api_errors decorator
        raise


# Error statistics endpoint for monitoring
@app.route('/api/error-stats')
@handle_api_errors
def get_error_stats():
    """Get error statistics for monitoring"""
    try:
        stats = error_service.get_error_stats()
        return jsonify(stats)
    except Exception as e:
        raise


# Example endpoint demonstrating different error types
@app.route('/api/demo/errors/<error_type>')
@handle_api_errors
def demo_errors(error_type):
    """Demo endpoint to test different error types"""
    from services.error_service import ErrorContext, ErrorType, ErrorSeverity
    
    context = ErrorContext(
        endpoint=f'/api/demo/errors/{error_type}',
        request_id='demo_request'
    )
    
    if error_type == 'validation':
        return jsonify(error_service.create_validation_error(
            field="demo_field",
            message="This is a demo validation error",
            value="invalid_value",
            context=context
        )), 400
        
    elif error_type == 'not_found':
        return jsonify(error_service.create_not_found_error(
            resource="Demo Resource",
            resource_id="demo_123",
            context=context
        )), 404
        
    elif error_type == 'external_api':
        return jsonify(error_service.create_external_api_error(
            service="Demo Service",
            message="Demo external API error",
            status_code=503,
            context=context
        )), 503
        
    elif error_type == 'business_logic':
        return jsonify(error_service.create_business_logic_error(
            message="Demo business logic error",
            details="This demonstrates a business rule violation",
            context=context,
            suggestions=[
                "Check your input parameters",
                "Refer to the API documentation",
                "Contact support for assistance"
            ]
        )), 400
        
    elif error_type == 'internal':
        # This will trigger the @handle_api_errors decorator
        raise Exception("Demo internal error")
        
    else:
        return jsonify(error_service.create_validation_error(
            field="error_type",
            message=f"Unknown error type: {error_type}",
            value=error_type,
            context=context
        )), 400


# Legacy endpoints for backward compatibility
@app.route('/api/draft/settings')
@handle_api_errors
def get_draft_settings():
    """Get current draft settings"""
    return jsonify({
        'draft_id': draft_service.current_draft_id,
        'file_name': 'RankingsManager',
        'refresh_interval': 30,
        'error_handling': 'enabled'
    })


if __name__ == '__main__':
    print("🚀 Starting Fantasy Football Draft API with Error Handling...")
    print(f"📊 Default Draft ID: {DEFAULT_DRAFT_ID}")
    print(f"📁 Rankings File: Using RankingsManager")
    print("🌐 API will be available at http://localhost:5001")
    print("🏗️ Using refactored service-oriented architecture")
    print("🚨 Standardized error handling enabled")
    print("🍞 Toast notifications ready for frontend integration")
    
    app.run(host=FLASK_HOST, port=FLASK_PORT, debug=FLASK_DEBUG)
