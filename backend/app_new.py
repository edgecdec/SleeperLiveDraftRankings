"""
Main Flask Application

This is the main entry point for the Fantasy Football Draft API.
It initializes all services and registers route blueprints.
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

# Import route blueprints
from routes.user_routes import user_bp
from routes.draft_routes import draft_bp, init_draft_routes
from routes.rankings_routes import rankings_bp, init_rankings_routes

# Import existing modules
from Rankings.RankingsManager import RankingsManager

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize rankings manager
rankings_manager = RankingsManager()
print("🚀 Using RankingsManager for rankings selection")

# Initialize services
league_service = LeagueService()

# Initialize draft service (this will create rankings service internally)
draft_service = DraftService(None, DEFAULT_DRAFT_ID)  # We'll set rankings_service after creation
rankings_service = RankingsService(draft_service, rankings_manager)
draft_service.rankings_service = rankings_service  # Set the rankings service

# Initialize route blueprints with service dependencies
init_draft_routes(draft_service)
init_rankings_routes(draft_service, rankings_service, rankings_manager)

# Register blueprints
app.register_blueprint(user_bp)
app.register_blueprint(draft_bp)
app.register_blueprint(rankings_bp)

# Health check endpoint
@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Fantasy Football Draft API is running',
        'services': {
            'sleeper_api': 'active',
            'league_service': 'active',
            'rankings_service': 'active',
            'draft_service': 'active'
        }
    })

# Global error handler
@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

# Legacy endpoints for backward compatibility (temporary)
@app.route('/api/draft/settings')
def get_draft_settings():
    """Get current draft settings"""
    return jsonify({
        'draft_id': draft_service.current_draft_id,
        'file_name': 'RankingsManager',  # Using RankingsManager instead of legacy file
        'refresh_interval': 30
    })

if __name__ == '__main__':
    print("🚀 Starting Fantasy Football Draft API...")
    print(f"📊 Default Draft ID: {DEFAULT_DRAFT_ID}")
    print(f"📁 Rankings File: Using RankingsManager")
    print("🌐 API will be available at http://localhost:5001")
    print("🏗️ Using refactored service-oriented architecture")
    
    app.run(host=FLASK_HOST, port=FLASK_PORT, debug=FLASK_DEBUG)
