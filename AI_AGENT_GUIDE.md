# AI Agent Development Guide - Fantasy Football Draft API

## 🎯 **Purpose & Context**

This guide is specifically designed for AI agents (like Claude, GPT, etc.) who need to understand and develop on this Fantasy Football Draft API codebase without prior context. It provides essential domain knowledge, architectural patterns, and development guidelines.

---

## 🏈 **Domain Knowledge - Fantasy Football Basics**

### **Core Concepts**
- **Fantasy Football**: A game where users draft real NFL players to create virtual teams
- **Draft**: Process where users take turns selecting players for their teams
- **Rankings**: Ordered lists of players by projected value/performance
- **Scoring Formats**: Different point systems (Standard, Half PPR, Full PPR)
- **League Types**: Standard (1 QB) vs Superflex (2 QB/flexible QB slot)
- **Dynasty/Keeper**: Multi-year leagues where you keep players across seasons
- **Redraft**: Single-season leagues where you draft fresh each year

### **Key Terms**
```
PPR = Points Per Reception (0, 0.5, or 1 point per catch)
QB = Quarterback, RB = Running Back, WR = Wide Receiver, TE = Tight End
FLEX = Flexible position (RB/WR/TE), K = Kicker, DEF = Defense
Superflex = Position that can be QB or any skill position
Sleeper = Popular fantasy football platform (our data source)
```

### **Player Ranking Context**
- **Rank**: Overall position in rankings (1 = best player)
- **Tier**: Grouping of similarly valued players (1 = highest tier)
- **ADP**: Average Draft Position (where players typically get drafted)
- **Positional Scarcity**: Some positions (QB in standard) have less value

---

## 🏗️ **Architecture Overview**

### **System Purpose**
This API helps fantasy football users make better draft decisions by:
1. Showing available players ranked by value
2. Auto-detecting league format (scoring/type) from Sleeper
3. Filtering out already drafted/rostered players
4. Providing position-specific recommendations

### **Service-Oriented Architecture**
```
Frontend (React) ←→ Backend API ←→ External Services
                                   ├── Sleeper API (league data)
                                   └── Rankings Files (player values)
```

### **Core Services**
```python
SleeperAPI        # External API integration (users, leagues, drafts)
RankingsService   # Player rankings management and format detection
LeagueService     # League information and context
DraftService      # Draft data processing and player filtering
```

### **Data Flow**
1. **User Input** → Username/League Selection
2. **League Detection** → Auto-detect scoring format and league type
3. **Rankings Loading** → Load appropriate player rankings file
4. **Player Filtering** → Remove drafted/rostered players
5. **Response** → Available players ranked by position

---

## 📁 **Codebase Structure**

### **Directory Layout**
```
backend/
├── app_new.py              # Main Flask application (NEW refactored version)
├── app.py                  # Legacy monolithic version (DEPRECATED)
├── config.py               # Configuration and constants
├── services/               # Business logic services
│   ├── sleeper_api.py      # Sleeper platform integration
│   ├── rankings_service.py # Rankings management
│   ├── league_service.py   # League information
│   └── draft_service.py    # Draft data processing
├── routes/                 # Flask route handlers
│   ├── user_routes.py      # User/league endpoints
│   ├── draft_routes.py     # Draft-related endpoints
│   └── rankings_routes.py  # Rankings management
└── Rankings/               # Legacy rankings processing (external dependency)
    ├── ParseRankings.py    # CSV parsing utilities
    ├── RankingsUtil.py     # Draft data utilities
    └── Constants.py        # Position constants

frontend/
├── src/
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   └── App.jsx            # Main application
```

### **Key Files for AI Agents**
- **app_new.py**: Main application entry point (USE THIS, not app.py)
- **services/*.py**: Core business logic (modify these for new features)
- **routes/*.py**: API endpoints (add new endpoints here)
- **API_DOCUMENTATION.md**: Complete API reference
- **REFACTORING_PLAN.md**: Architecture decisions and rationale

---

## 🔧 **Development Patterns**

### **Service Pattern**
```python
# Each service has a single responsibility
class RankingsService:
    def get_effective_format(self, league_info):
        # Determine manual override vs auto-detection
    
    def load_rankings_data(self, scoring_format, league_type):
        # Load appropriate rankings file
    
    def get_current_rankings(self, league_info):
        # Main entry point - returns complete rankings data
```

### **Route Pattern**
```python
# Routes are thin wrappers around services
@draft_bp.route('/api/draft/<draft_id>')
def get_draft_data(draft_id):
    try:
        draft_service.set_draft_id(draft_id)
        draft_data = draft_service.get_draft_data()
        return jsonify(draft_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

### **Error Handling Pattern**
```python
# Consistent error responses
try:
    # Business logic
    return jsonify(success_response)
except Exception as e:
    return jsonify({'error': str(e)}), 500
```

---

## 🎯 **Common Development Tasks**

### **Adding a New Endpoint**
1. **Identify Service**: Which service handles this functionality?
2. **Add Business Logic**: Implement in appropriate service class
3. **Create Route**: Add route handler in appropriate routes file
4. **Register Blueprint**: Ensure blueprint is registered in app_new.py
5. **Test**: Use Postman collection or cURL commands

### **Modifying Rankings Logic**
- **File**: `services/rankings_service.py`
- **Key Methods**: `get_effective_format()`, `load_rankings_data()`
- **Testing**: Use `/api/rankings/current-format` endpoint

### **Adding League Format Support**
- **Detection Logic**: `services/sleeper_api.py` → `detect_league_format()`
- **Rankings Files**: Add new CSV files in `backend/PopulatedFromSites/`
- **Format Mapping**: Update `RankingsManager` class

### **Debugging Player Filtering**
- **File**: `services/draft_service.py`
- **Key Method**: `get_draft_data()`
- **Common Issues**: Name matching, position filtering, dynasty/keeper logic

---

## 🧪 **Testing & Debugging**

### **Quick Health Checks**
```bash
# API health
curl http://localhost:5001/api/health

# User lookup
curl http://localhost:5001/api/user/edgecdec

# Draft data
curl http://localhost:5001/api/draft/1255160696186880000

# Rankings format
curl http://localhost:5001/api/rankings/current-format?draft_id=1255160696186880000
```

### **Common Debug Scenarios**
```python
# Empty available_players array
# Check: Rankings file exists, format detection working, players not all drafted

# Wrong rankings format
# Check: League detection logic, manual override settings

# Player name mismatches
# Check: Name normalization in _names_match() method

# Dynasty league issues
# Check: is_dynasty_or_keeper_league() detection logic
```

### **Logging Patterns**
```python
# Current pattern (print statements)
print(f"🎯 Using manual rankings override: {scoring_format} {league_type}")
print(f"🤖 Auto-detected league format: {scoring_format} {league_type}")
print(f"📊 Using rankings file: {rankings_filename}")

# Emojis help identify log sources:
# 🎯 = Manual override, 🤖 = Auto-detection, 📊 = File operations
# 🔍 = Debug info, ⚠️ = Warnings, ❌ = Errors
```

---

## 📊 **Data Models & Structures**

### **Player Object**
```python
# From Rankings/PlayerRankings.py
class Player:
    name: str      # "Josh Allen"
    pos: str       # "QB" 
    team: str      # "BUF"
    rank: int      # 1 (overall ranking)
    tier: int      # 1 (tier grouping)
```

### **League Info Structure**
```python
# From Sleeper API
league_info = {
    "league_id": "1255160696174284800",
    "name": "My Fantasy League",
    "scoring_settings": {"rec": 0.5},  # PPR settings
    "roster_positions": ["QB", "RB", "RB", "WR", "WR", "TE", "FLEX"],
    "settings": {"type": 0, "max_keepers": 0}  # Dynasty/keeper settings
}
```

### **Draft Response Structure**
```python
# Main API response format
{
    "draft_id": "1255160696186880000",
    "available_players": [Player, ...],  # All available players
    "positions": {
        "QB": [Player, ...],    # Top 5 QBs
        "RB": [Player, ...],    # Top 5 RBs
        "FLEX": [Player, ...]   # Top 10 flex players
    },
    "total_available": 450,
    "total_drafted": 34,
    "is_dynasty_keeper": false
}
```

---

## 🔍 **Key Business Logic**

### **Format Detection Algorithm**
```python
# In SleeperAPI.detect_league_format()
def detect_league_format(league_info):
    # 1. Check PPR settings
    rec_points = league_info.get('scoring_settings', {}).get('rec', 0)
    if rec_points == 0: scoring_format = 'standard'
    elif rec_points == 0.5: scoring_format = 'half_ppr'  
    elif rec_points == 1.0: scoring_format = 'ppr'
    
    # 2. Check QB/Superflex settings
    roster_positions = league_info.get('roster_positions', [])
    qb_count = roster_positions.count('QB')
    has_superflex = 'SUPER_FLEX' in roster_positions
    
    if qb_count > 1 or has_superflex:
        league_type = 'superflex'
    else:
        league_type = 'standard'
    
    return scoring_format, league_type
```

### **Player Filtering Logic**
```python
# In DraftService.get_draft_data()
for player in player_rankings:
    is_drafted = False
    is_rostered = False
    
    # Check if drafted in current draft
    for drafted in players_drafted:
        if self._names_match(drafted.name, player.name):
            is_drafted = True
            break
    
    # Check if rostered (dynasty/keeper only)
    if is_dynasty_keeper and not is_drafted:
        is_rostered = self._is_player_rostered(player, rostered_players, all_players)
    
    if not is_drafted and not is_rostered:
        available_players.append(player)
```

### **Name Matching Algorithm**
```python
# Handles player name variations (Jr., nicknames, etc.)
def _names_match(self, name1, name2):
    # 1. Exact match
    if name1 == name2: return True
    
    # 2. Normalized match (lowercase, remove suffixes)
    name1_norm = self._normalize_name(name1)
    name2_norm = self._normalize_name(name2)
    if name1_norm == name2_norm: return True
    
    # 3. Nickname variations
    # 4. First/last name match (ignoring middle names/suffixes)
```

---

## 🚨 **Common Pitfalls for AI Agents**

### **1. File Structure Confusion**
- ❌ **DON'T** modify `app.py` (legacy monolithic file)
- ✅ **DO** use `app_new.py` (refactored service-oriented version)
- ❌ **DON'T** add business logic to route handlers
- ✅ **DO** implement logic in service classes

### **2. Data Format Misunderstanding**
- Rankings files use different naming: `FantasyPros_Rankings_{scoring}_{type}.csv`
- Player positions use constants: `POS_QB`, `POS_RB` (not strings)
- Sleeper IDs are strings, not integers
- Ranks are 1-indexed (1 = best), not 0-indexed

### **3. Fantasy Football Domain Errors**
- PPR affects WR/RB/TE value, not QB/K/DEF
- Superflex dramatically increases QB value
- Dynasty leagues need rostered player filtering
- Position scarcity varies by format (QB less valuable in standard)

### **4. Service Dependencies**
- RankingsService needs DraftService instance for manual overrides
- Routes need service instances injected via init functions
- Services should not directly import each other (use dependency injection)

---

## 🎯 **AI Agent Development Workflow**

### **1. Understanding a Request**
```
User Request → Identify Domain (Fantasy Football) → Locate Relevant Service → 
Understand Business Logic → Implement Changes → Test with API
```

### **2. Code Analysis Pattern**
```python
# When examining code, look for:
1. Service responsibility (what does this service handle?)
2. Data flow (input → processing → output)
3. External dependencies (Sleeper API, rankings files)
4. Error handling patterns
5. Caching strategies
```

### **3. Implementation Pattern**
```python
# For new features:
1. Add business logic to appropriate service
2. Create/modify route handler
3. Update API documentation
4. Add test cases to Postman collection
5. Test with real data
```

### **4. Debugging Pattern**
```python
# When debugging:
1. Check API health endpoint
2. Verify input data (user exists, league exists, draft exists)
3. Check service logs (print statements with emojis)
4. Test individual service methods
5. Verify external API responses
```

---

## 📚 **Essential References for AI Agents**

### **Must-Read Files (in order)**
1. **This file** - Domain knowledge and patterns
2. **API_DOCUMENTATION.md** - Complete API reference
3. **app_new.py** - Application structure
4. **services/rankings_service.py** - Core business logic
5. **REFACTORING_PLAN.md** - Architecture decisions

### **Quick Reference Commands**
```bash
# Start development server
python3 app_new.py

# Test basic functionality
curl http://localhost:5001/api/health
curl http://localhost:5001/api/user/edgecdec
curl http://localhost:5001/api/draft/1255160696186880000

# Switch rankings format
curl -X POST http://localhost:5001/api/rankings/select \
  -H "Content-Type: application/json" \
  -d '{"type": "fantasypros", "id": "ppr_superflex"}'
```

### **Key Constants & Enums**
```python
# Position constants (from Rankings/Constants.py)
POS_QB = "QB"
POS_RB = "RB" 
POS_WR = "WR"
POS_TE = "TE"
POS_K = "K"

# Scoring formats
SCORING_FORMATS = ["standard", "half_ppr", "ppr"]
LEAGUE_TYPES = ["standard", "superflex"]

# Available format combinations
AVAILABLE_FORMATS = [
    "standard_standard", "standard_superflex",
    "half_ppr_standard", "half_ppr_superflex", 
    "ppr_standard", "ppr_superflex"
]
```

---

## 🎯 **Success Metrics for AI Agents**

### **Code Quality Indicators**
- ✅ Business logic in services, not routes
- ✅ Consistent error handling patterns
- ✅ Proper service dependency injection
- ✅ Clear separation of concerns

### **Functionality Indicators**
- ✅ API health endpoint returns "healthy"
- ✅ User lookup works for valid Sleeper users
- ✅ Draft data returns available players
- ✅ Rankings format detection works correctly
- ✅ Manual override persists across requests

### **Domain Understanding Indicators**
- ✅ Understands PPR impact on player values
- ✅ Recognizes superflex QB value increase
- ✅ Properly handles dynasty/keeper filtering
- ✅ Implements correct name matching logic

---

This guide provides AI agents with the essential context, patterns, and domain knowledge needed to effectively develop on this Fantasy Football Draft API codebase. The service-oriented architecture, fantasy football domain knowledge, and development patterns are clearly explained to enable productive AI-assisted development.

**Remember**: This is a specialized domain (fantasy football) with specific business rules. Always consider the fantasy football context when making changes, and test with real Sleeper data to ensure accuracy.
