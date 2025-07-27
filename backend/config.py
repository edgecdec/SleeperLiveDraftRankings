"""
Configuration and Constants

This module contains all configuration settings and constants used throughout the application.
"""

# Default settings
DEFAULT_DRAFT_ID = None  # Will be set via API
LEGACY_FILE_NAME = 'Rankings.csv'  # Legacy fallback, prefer RankingsManager

# Flask settings
FLASK_HOST = '0.0.0.0'
FLASK_PORT = 5001
FLASK_DEBUG = True

# Cache settings
DRAFT_CACHE_DURATION = 30  # seconds
PLAYER_CACHE_DURATION = 3600  # 1 hour cache for player data

# File settings
MANUAL_RANKINGS_OVERRIDE_FILE = 'manual_rankings_override.json'
