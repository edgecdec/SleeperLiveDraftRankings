# AI Development Patterns - Fantasy Football Draft API

## 🤖 **AI Agent Code Patterns & Templates**

This document provides specific code patterns, templates, and examples for AI agents to follow when developing on this codebase.

---

## 🏗️ **Service Implementation Pattern**

### **Template: New Service Class**
```python
"""
{Service Name} Service

This module handles {specific responsibility} including:
- {Key functionality 1}
- {Key functionality 2}
- {Key functionality 3}
"""

import os
import sys
from typing import Dict, List, Optional, Tuple

# Add parent directory for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from .sleeper_api import SleeperAPI  # Import other services as needed


class {ServiceName}Service:
    """Service class for managing {specific domain}"""
    
    def __init__(self, dependency_service=None):
        """Initialize service with dependencies"""
        self.dependency_service = dependency_service
        print(f"🔧 {ServiceName}Service initialized")
    
    def main_method(self, required_param: str, optional_param: Optional[str] = None) -> Dict:
        """
        Main entry point for {functionality}.
        
        Args:
            required_param: Description of required parameter
            optional_param: Description of optional parameter
            
        Returns:
            Dict containing {result description}
            
        Raises:
            ValueError: When {error condition}
        """
        try:
            # 1. Validate inputs
            if not required_param:
                raise ValueError("required_param is required")
            
            # 2. Process business logic
            result = self._process_logic(required_param, optional_param)
            
            # 3. Return structured response
            return {
                'success': True,
                'data': result,
                'metadata': {
                    'processed_at': datetime.now().isoformat(),
                    'source': 'service_name'
                }
            }
            
        except Exception as e:
            print(f"❌ Error in {ServiceName}Service.main_method: {e}")
            raise
    
    def _process_logic(self, param1: str, param2: Optional[str]) -> Dict:
        """Private method for core business logic"""
        # Implementation here
        pass
    
    def _helper_method(self, data: Dict) -> bool:
        """Private helper method with specific purpose"""
        # Implementation here
        pass
```

---

## 🛣️ **Route Implementation Pattern**

### **Template: New Route Handler**
```python
"""
{Domain} Routes

This module contains all {domain}-related API endpoints.
"""

from flask import Blueprint, jsonify, request
from typing import Dict, Any

# Create blueprint
{domain}_bp = Blueprint('{domain}', __name__)

# Global service instances (injected during initialization)
{domain}_service = None


def init_{domain}_routes(service_instance):
    """Initialize routes with service dependency injection"""
    global {domain}_service
    {domain}_service = service_instance


@{domain}_bp.route('/api/{domain}/<resource_id>')
def get_{domain}_resource(resource_id: str):
    """
    Get {domain} resource by ID
    
    Args:
        resource_id: Unique identifier for the resource
        
    Returns:
        JSON response with resource data or error
    """
    try:
        # 1. Validate input
        if not resource_id:
            return jsonify({'error': 'resource_id is required'}), 400
        
        # 2. Call service method
        result = {domain}_service.get_resource(resource_id)
        
        # 3. Handle service response
        if 'error' in result:
            return jsonify(result), 400
            
        return jsonify(result)
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        print(f"❌ Error in get_{domain}_resource: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@{domain}_bp.route('/api/{domain}', methods=['POST'])
def create_{domain}_resource():
    """
    Create new {domain} resource
    
    Request Body:
        JSON object with resource data
        
    Returns:
        JSON response with created resource or error
    """
    try:
        # 1. Get and validate request data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        # 2. Validate required fields
        required_fields = ['field1', 'field2']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # 3. Call service method
        result = {domain}_service.create_resource(data)
        
        # 4. Return response
        return jsonify(result), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        print(f"❌ Error in create_{domain}_resource: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@{domain}_bp.route('/api/{domain}/<resource_id>', methods=['PUT'])
def update_{domain}_resource(resource_id: str):
    """Update existing {domain} resource"""
    try:
        data = request.get_json()
        result = {domain}_service.update_resource(resource_id, data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@{domain}_bp.route('/api/{domain}/<resource_id>', methods=['DELETE'])
def delete_{domain}_resource(resource_id: str):
    """Delete {domain} resource"""
    try:
        result = {domain}_service.delete_resource(resource_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

---

## 🎯 **Fantasy Football Specific Patterns**

### **League Format Detection Pattern**
```python
def detect_league_format(self, league_info: Dict) -> Tuple[str, str]:
    """
    Detect league scoring format and type from Sleeper league settings.
    
    Args:
        league_info: League information from Sleeper API
        
    Returns:
        Tuple of (scoring_format, league_type)
        
    Example:
        ("half_ppr", "superflex") for 0.5 PPR superflex league
    """
    if not league_info:
        print("⚠️ No league info provided, using default format")
        return 'half_ppr', 'superflex'  # Safe default
    
    # 1. Detect PPR scoring format
    scoring_settings = league_info.get('scoring_settings', {})
    rec_points = scoring_settings.get('rec', 0)
    
    if rec_points == 0:
        scoring_format = 'standard'
    elif rec_points == 0.5:
        scoring_format = 'half_ppr'
    elif rec_points == 1.0:
        scoring_format = 'ppr'
    else:
        print(f"⚠️ Unusual PPR value: {rec_points}, defaulting to half_ppr")
        scoring_format = 'half_ppr'
    
    # 2. Detect league type (standard vs superflex)
    roster_positions = league_info.get('roster_positions', [])
    qb_count = roster_positions.count('QB')
    has_superflex = 'SUPER_FLEX' in roster_positions
    
    if qb_count > 1 or has_superflex:
        league_type = 'superflex'
    else:
        league_type = 'standard'
    
    print(f"🏈 Detected league format: {scoring_format} {league_type}")
    print(f"   📊 Scoring: rec={rec_points} -> {scoring_format}")
    print(f"   🏟️  Roster: QB={qb_count}, SUPER_FLEX={has_superflex} -> {league_type}")
    
    return scoring_format, league_type
```

### **Player Filtering Pattern**
```python
def filter_available_players(self, all_players: List, drafted_players: List, 
                           rostered_players: Set = None) -> List:
    """
    Filter out drafted and rostered players from rankings.
    
    Args:
        all_players: Complete player rankings list
        drafted_players: Players drafted in current draft
        rostered_players: Players rostered in dynasty/keeper leagues
        
    Returns:
        List of available players
    """
    available_players = []
    filtered_count = 0
    
    for player in all_players:
        is_drafted = False
        is_rostered = False
        
        # Check if drafted in current draft
        for drafted in drafted_players:
            if (drafted.pos.upper() == player.pos.upper() and 
                self._names_match(drafted.name, player.name)):
                is_drafted = True
                print(f"🚫 Filtered drafted player: {player.name} ({player.pos})")
                break
        
        # Check if rostered (dynasty/keeper only)
        if rostered_players and not is_drafted:
            is_rostered = self._is_player_rostered(player, rostered_players)
            if is_rostered:
                print(f"🏠 Filtered rostered player: {player.name} ({player.pos})")
                filtered_count += 1
        
        # Add to available if not filtered
        if not is_drafted and not is_rostered:
            available_players.append(player)
    
    print(f"📊 Player filtering complete: {len(available_players)} available, {filtered_count} filtered")
    return available_players
```

### **Name Matching Pattern**
```python
def _names_match(self, name1: str, name2: str) -> bool:
    """
    Check if two player names refer to the same player.
    Handles variations like "Josh Allen" vs "J. Allen" vs "Joshua Allen Jr."
    
    Args:
        name1: First player name
        name2: Second player name
        
    Returns:
        True if names likely refer to same player
    """
    if not name1 or not name2:
        return False
    
    # 1. Exact match (case insensitive)
    if name1.lower().strip() == name2.lower().strip():
        return True
    
    # 2. Normalize and compare
    name1_norm = self._normalize_name(name1)
    name2_norm = self._normalize_name(name2)
    
    if name1_norm == name2_norm:
        return True
    
    # 3. Check nickname variations
    if self._check_nickname_variations(name1_norm, name2_norm):
        return True
    
    # 4. First/last name match (handles middle names, suffixes)
    if self._check_first_last_match(name1_norm, name2_norm):
        return True
    
    return False

def _normalize_name(self, name: str) -> str:
    """Normalize name for comparison"""
    # Convert to lowercase, remove extra spaces
    normalized = ' '.join(name.lower().strip().split())
    
    # Handle common variations
    replacements = {
        'jr.': 'jr', 'sr.': 'sr', 'iii': '3', 'ii': '2', 'iv': '4'
    }
    
    for old, new in replacements.items():
        normalized = normalized.replace(old, new)
    
    return normalized
```

---

## 📊 **Data Processing Patterns**

### **Rankings Data Loading Pattern**
```python
def load_rankings_data(self, scoring_format: str, league_type: str) -> Tuple[List, Dict, str]:
    """
    Load player rankings for specified format.
    
    Args:
        scoring_format: 'standard', 'half_ppr', or 'ppr'
        league_type: 'standard' or 'superflex'
        
    Returns:
        Tuple of (rankings_list, rankings_dict, filename)
    """
    # 1. Generate filename
    rankings_filename = f"FantasyPros_Rankings_{scoring_format}_{league_type}.csv"
    
    # 2. Try multiple file locations
    possible_paths = [
        os.path.join(RANKINGS_OUTPUT_DIRECTORY, rankings_filename),
        os.path.join('..', 'Rankings', RANKINGS_OUTPUT_DIRECTORY, rankings_filename),
        os.path.join('..', RANKINGS_OUTPUT_DIRECTORY, rankings_filename)
    ]
    
    rankings_file = None
    for path in possible_paths:
        if os.path.exists(path):
            rankings_file = path
            print(f"📁 Found rankings file: {path}")
            break
    
    if not rankings_file:
        print(f"⚠️ Rankings file not found: {rankings_filename}")
        return [], {}, rankings_filename
    
    try:
        # 3. Load and parse CSV
        print(f"📊 Loading rankings: {rankings_filename}")
        rankings_list = parseCSV(rankings_file)
        
        # 4. Convert to dictionary for fast lookups
        rankings_dict = self._convert_to_dict_format(rankings_list)
        
        print(f"✅ Loaded {len(rankings_list)} players from {rankings_filename}")
        return rankings_list, rankings_dict, rankings_filename
        
    except Exception as e:
        print(f"❌ Error loading rankings: {e}")
        return [], {}, rankings_filename

def _convert_to_dict_format(self, rankings_list: List) -> Dict:
    """Convert rankings list to dictionary for fast player lookups"""
    rankings_dict = {}
    for player in rankings_list:
        key = player.name.lower().strip()
        rankings_dict[key] = {
            'rank': player.rank,
            'tier': getattr(player, 'tier', 1),
            'original_name': player.name,
            'position': player.pos,
            'team': player.team
        }
    return rankings_dict
```

### **API Response Formatting Pattern**
```python
def format_draft_response(self, available_players: List, draft_info: Dict, 
                         league_info: Dict, stats: Dict) -> Dict:
    """
    Format comprehensive draft response with all required data.
    
    Args:
        available_players: Filtered list of available players
        draft_info: Draft information from Sleeper
        league_info: League information from Sleeper
        stats: Draft statistics (totals, counts, etc.)
        
    Returns:
        Formatted API response dictionary
    """
    # 1. Convert players to JSON-serializable format
    available_players_dict = []
    for player in available_players:
        available_players_dict.append({
            'name': player.name,
            'position': player.pos,
            'team': player.team,
            'rank': player.rank,
            'tier': getattr(player, 'tier', 1)
        })
    
    # 2. Organize by position
    positions_data = {
        'QB': self._get_top_players_by_position(['QB'], available_players, 5),
        'RB': self._get_top_players_by_position(['RB'], available_players, 5),
        'WR': self._get_top_players_by_position(['WR'], available_players, 5),
        'TE': self._get_top_players_by_position(['TE'], available_players, 5),
        'K': self._get_top_players_by_position(['K'], available_players, 5),
        'FLEX': self._get_top_players_by_position(['RB', 'WR', 'TE'], available_players, 10),
        'ALL': self._get_top_players_by_position(['QB', 'RB', 'WR', 'TE', 'K'], available_players, 10)
    }
    
    # 3. Build comprehensive response
    return {
        'draft_id': draft_info.get('draft_id'),
        'league_name': league_info.get('name', 'Unknown League'),
        'is_dynasty_keeper': stats.get('is_dynasty_keeper', False),
        'last_updated': datetime.now().isoformat(),
        
        # Player data
        'available_players': available_players_dict,
        'positions': positions_data,
        
        # Statistics
        'total_available': len(available_players),
        'total_drafted': stats.get('total_drafted', 0),
        'total_rostered': stats.get('total_rostered', 0),
        'filtered_count': stats.get('filtered_count', 0),
        
        # Metadata
        'draft_info': draft_info,
        'roster_settings': stats.get('roster_settings', {}),
        'position_counts': stats.get('position_counts', {})
    }
```

---

## 🔧 **Error Handling Patterns**

### **Service Error Handling Pattern**
```python
def service_method_with_error_handling(self, param: str) -> Dict:
    """Template for service method with comprehensive error handling"""
    try:
        # 1. Input validation
        if not param:
            raise ValueError("param is required")
        
        if not isinstance(param, str):
            raise TypeError("param must be a string")
        
        # 2. Business logic with specific error handling
        try:
            result = self._external_api_call(param)
        except requests.RequestException as e:
            print(f"🌐 External API error: {e}")
            raise ConnectionError(f"Failed to fetch data from external service: {e}")
        
        try:
            processed_result = self._process_data(result)
        except KeyError as e:
            print(f"📊 Data processing error: {e}")
            raise ValueError(f"Invalid data format received: missing {e}")
        
        # 3. Success response
        return {
            'success': True,
            'data': processed_result,
            'timestamp': datetime.now().isoformat()
        }
        
    except ValueError as e:
        print(f"⚠️ Validation error in service_method: {e}")
        return {'error': str(e), 'type': 'validation_error'}
    
    except ConnectionError as e:
        print(f"🌐 Connection error in service_method: {e}")
        return {'error': str(e), 'type': 'connection_error'}
    
    except Exception as e:
        print(f"❌ Unexpected error in service_method: {e}")
        return {'error': 'Internal service error', 'type': 'internal_error'}
```

### **Route Error Handling Pattern**
```python
@blueprint.route('/api/endpoint')
def endpoint_with_error_handling():
    """Template for route with comprehensive error handling"""
    try:
        # 1. Input validation
        param = request.args.get('param')
        if not param:
            return jsonify({'error': 'param query parameter is required'}), 400
        
        # 2. Service call
        result = service.method(param)
        
        # 3. Handle service errors
        if 'error' in result:
            error_type = result.get('type', 'unknown')
            
            if error_type == 'validation_error':
                return jsonify(result), 400
            elif error_type == 'connection_error':
                return jsonify(result), 503
            else:
                return jsonify(result), 500
        
        # 4. Success response
        return jsonify(result)
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        print(f"❌ Unexpected error in endpoint: {e}")
        return jsonify({'error': 'Internal server error'}), 500
```

---

## 🧪 **Testing Patterns**

### **Service Testing Pattern**
```python
def test_service_method():
    """Template for testing service methods"""
    # 1. Setup
    service = ServiceClass()
    
    # 2. Test valid input
    result = service.method("valid_input")
    assert result['success'] == True
    assert 'data' in result
    
    # 3. Test invalid input
    result = service.method("")
    assert 'error' in result
    assert result['error'] == "param is required"
    
    # 4. Test edge cases
    result = service.method(None)
    assert 'error' in result
    
    print("✅ All service tests passed")
```

### **API Testing Pattern**
```python
def test_api_endpoint():
    """Template for testing API endpoints"""
    # 1. Test valid request
    response = requests.get("http://localhost:5001/api/endpoint?param=valid")
    assert response.status_code == 200
    data = response.json()
    assert 'data' in data
    
    # 2. Test missing parameter
    response = requests.get("http://localhost:5001/api/endpoint")
    assert response.status_code == 400
    error = response.json()
    assert 'error' in error
    
    # 3. Test invalid parameter
    response = requests.get("http://localhost:5001/api/endpoint?param=invalid")
    assert response.status_code in [400, 404]
    
    print("✅ All API tests passed")
```

---

## 📝 **Documentation Patterns**

### **Service Documentation Pattern**
```python
class ExampleService:
    """
    Example Service for {domain} management.
    
    This service handles:
    - {Responsibility 1}
    - {Responsibility 2}
    - {Responsibility 3}
    
    Dependencies:
    - {Dependency 1}: Used for {purpose}
    - {Dependency 2}: Used for {purpose}
    
    Example Usage:
        service = ExampleService(dependency)
        result = service.main_method("param")
        if result['success']:
            data = result['data']
    """
    
    def main_method(self, param: str) -> Dict:
        """
        Main service method description.
        
        This method performs {specific action} by:
        1. {Step 1}
        2. {Step 2}
        3. {Step 3}
        
        Args:
            param (str): Description of parameter and its constraints
            
        Returns:
            Dict: Response dictionary containing:
                - success (bool): Whether operation succeeded
                - data (Dict): Result data if successful
                - error (str): Error message if failed
                
        Raises:
            ValueError: When {condition}
            ConnectionError: When {condition}
            
        Example:
            >>> service = ExampleService()
            >>> result = service.main_method("test")
            >>> print(result['success'])
            True
        """
```

---

## 🎯 **AI Agent Checklist**

### **Before Making Changes**
- [ ] Read CODEBASE_CONTEXT.md for domain knowledge
- [ ] Understand the fantasy football context
- [ ] Identify which service handles the functionality
- [ ] Check existing patterns in similar code

### **When Implementing**
- [ ] Follow service-oriented architecture
- [ ] Add business logic to services, not routes
- [ ] Use consistent error handling patterns
- [ ] Add appropriate logging with emojis
- [ ] Handle edge cases (empty data, API failures)

### **After Implementation**
- [ ] Test with real Sleeper data
- [ ] Verify error handling works
- [ ] Update API documentation
- [ ] Add examples to Postman collection
- [ ] Check that existing functionality still works

---

These patterns provide AI agents with concrete templates and examples for developing on this Fantasy Football Draft API codebase while maintaining consistency with the established architecture and domain requirements.
