# Codebase Context for AI Agents

## 🤖 **AI Agent Quick Start**

This document provides essential context for AI agents working on this Fantasy Football Draft API without prior knowledge. Read this FIRST before making any changes.

---

## 🎯 **What This System Does**

### **Primary Purpose**
Helps fantasy football users make better draft decisions by showing which players are available and ranked highest according to their preferences.

### **Core Workflow**
```
User enters Sleeper username → System finds their leagues → User selects draft → 
System shows available players ranked by value → User makes informed draft picks
```

### **Key Value Propositions**
1. **Auto-detects league format** (PPR settings, superflex) from Sleeper
2. **Filters out unavailable players** (already drafted or rostered)
3. **Shows position-specific rankings** (top QBs, RBs, etc.)
4. **Supports multiple scoring systems** (Standard, Half PPR, Full PPR)
5. **Handles special league types** (Dynasty, Keeper, Superflex)

---

## 🏗️ **Architecture at a Glance**

### **Current State (Post-Refactoring)**
```
app_new.py (MAIN) ← Use this, not app.py
├── services/ (Business Logic)
│   ├── sleeper_api.py      # External API calls
│   ├── rankings_service.py # Player rankings logic
│   ├── league_service.py   # League information
│   └── draft_service.py    # Draft data processing
└── routes/ (API Endpoints)
    ├── user_routes.py      # User/league endpoints
    ├── draft_routes.py     # Draft endpoints
    └── rankings_routes.py  # Rankings endpoints
```

### **Legacy Files (DO NOT MODIFY)**
- `app.py` - Old monolithic version (1,411 lines) - DEPRECATED
- `EditMe.py` - Old configuration - REMOVED

---

## 🏈 **Fantasy Football Domain Knowledge**

### **Essential Concepts**
```
PPR = Points Per Reception (0, 0.5, or 1 point per catch)
- Standard: 0 PPR (no points for catches)
- Half PPR: 0.5 points per catch  
- Full PPR: 1 point per catch

League Types:
- Standard: 1 QB required
- Superflex: Can start 2 QBs (makes QBs more valuable)

Player Positions:
- QB (Quarterback), RB (Running Back), WR (Wide Receiver)
- TE (Tight End), K (Kicker), DEF (Defense)
- FLEX: Can be RB, WR, or TE
```

### **Why This Matters**
- **PPR increases WR/RB/TE value** (they catch passes)
- **Superflex dramatically increases QB value** (can start 2 QBs)
- **Dynasty leagues keep players year-to-year** (need to filter rostered players)
- **Player rankings change based on format** (Josh Allen #1 in superflex, lower in standard)

---

## 🔧 **Development Patterns**

### **Service Pattern (FOLLOW THIS)**
```python
# Business logic goes in services
class RankingsService:
    def get_current_rankings(self, league_info):
        # 1. Determine format (manual override or auto-detect)
        # 2. Load appropriate rankings file
        # 3. Return both list and dict formats
        
# Routes are thin wrappers
@rankings_bp.route('/api/rankings/current-format')
def get_current_rankings_format():
    rankings_result = rankings_service.get_current_rankings(league_info)
    return jsonify(rankings_result)
```

### **Error Handling Pattern**
```python
try:
    # Business logic
    return jsonify(success_response)
except Exception as e:
    return jsonify({'error': str(e)}), 500
```

### **Logging Pattern**
```python
# Use emojis to identify log sources
print(f"🎯 Using manual rankings override: {scoring_format} {league_type}")
print(f"🤖 Auto-detected league format: {scoring_format} {league_type}")
print(f"📊 Using rankings file: {rankings_filename}")
```

---

## 📊 **Key Data Structures**

### **Player Object**
```python
# From Rankings/PlayerRankings.py
player = {
    "name": "Josh Allen",
    "position": "QB", 
    "team": "BUF",
    "rank": 1,        # Overall ranking (1 = best)
    "tier": 1         # Tier grouping (1 = highest tier)
}
```

### **League Info (from Sleeper)**
```python
league_info = {
    "league_id": "1255160696174284800",
    "scoring_settings": {"rec": 0.5},  # 0.5 = Half PPR
    "roster_positions": ["QB", "RB", "RB", "WR", "WR", "TE", "FLEX"],
    "settings": {"type": 0}  # 0 = Redraft, 2 = Dynasty
}
```

### **API Response Format**
```python
{
    "available_players": [player_objects],
    "positions": {
        "QB": [top_5_qbs],
        "RB": [top_5_rbs],
        "FLEX": [top_10_flex_players]
    },
    "total_available": 450,
    "total_drafted": 34,
    "is_dynasty_keeper": false
}
```

---

## 🎯 **Critical Business Logic**

### **Format Detection (Most Important)**
```python
# In services/sleeper_api.py
def detect_league_format(league_info):
    # PPR Detection
    rec_points = league_info.get('scoring_settings', {}).get('rec', 0)
    if rec_points == 0: scoring_format = 'standard'
    elif rec_points == 0.5: scoring_format = 'half_ppr'
    elif rec_points == 1.0: scoring_format = 'ppr'
    
    # Superflex Detection  
    roster_positions = league_info.get('roster_positions', [])
    if roster_positions.count('QB') > 1 or 'SUPER_FLEX' in roster_positions:
        league_type = 'superflex'
    else:
        league_type = 'standard'
        
    return scoring_format, league_type
```

### **Player Filtering**
```python
# Remove drafted and rostered players
for player in all_players:
    if not is_drafted(player) and not is_rostered(player):
        available_players.append(player)
```

### **Name Matching (Complex)**
```python
# Handles "Josh Allen" vs "J. Allen" vs "Joshua Allen"
def _names_match(self, name1, name2):
    # Normalize names, handle suffixes (Jr., Sr.), nicknames
    # This is complex because player names vary across data sources
```

---

## 🚨 **Common AI Agent Mistakes**

### **1. File Confusion**
- ❌ Modifying `app.py` (legacy file)
- ✅ Use `app_new.py` (refactored version)

### **2. Architecture Violations**
- ❌ Adding business logic to route handlers
- ✅ Implement logic in service classes

### **3. Domain Misunderstanding**
- ❌ Treating all formats the same
- ✅ Understanding PPR affects WR/RB/TE value, superflex affects QB value

### **4. Data Format Errors**
- ❌ Using 0-indexed ranks
- ✅ Rankings are 1-indexed (1 = best player)

---

## 🧪 **Testing & Validation**

### **Quick Health Checks**
```bash
# 1. API is running
curl http://localhost:5001/api/health

# 2. User lookup works
curl http://localhost:5001/api/user/edgecdec

# 3. Draft data loads
curl http://localhost:5001/api/draft/1255160696186880000

# 4. Format detection works
curl http://localhost:5001/api/rankings/current-format?draft_id=1255160696186880000
```

### **Expected Results**
```json
// Health check
{"status": "healthy"}

// User lookup  
{"username": "edgecdec", "user_id": "123456789"}

// Draft data
{"available_players": [...], "total_available": 450}

// Format detection
{"scoring_format": "half_ppr", "league_type": "superflex", "source": "auto"}
```

---

## 📁 **File Modification Guide**

### **Adding New Features**
1. **Business Logic** → `services/` directory
2. **API Endpoints** → `routes/` directory  
3. **Configuration** → `config.py`
4. **Documentation** → Update API docs

### **Common Modifications**
```python
# Add new ranking format
# File: services/rankings_service.py
# Method: load_rankings_data()

# Add new endpoint
# File: routes/draft_routes.py
# Pattern: @draft_bp.route('/api/draft/new-endpoint')

# Modify league detection
# File: services/sleeper_api.py  
# Method: detect_league_format()
```

---

## 🎯 **Success Criteria for AI Agents**

### **Code Quality**
- ✅ Business logic in services, not routes
- ✅ Consistent error handling
- ✅ Proper logging with emojis
- ✅ Service dependency injection

### **Functionality**
- ✅ Format detection works for test leagues
- ✅ Player filtering removes drafted players
- ✅ Manual override persists across requests
- ✅ Dynasty leagues filter rostered players

### **Domain Understanding**
- ✅ PPR affects skill position values
- ✅ Superflex increases QB importance
- ✅ Player name matching handles variations
- ✅ Rankings reflect format differences

---

## 🔍 **Debugging Workflow**

### **When Things Break**
1. **Check API Health**: `curl http://localhost:5001/api/health`
2. **Verify Input Data**: Does user/league/draft exist in Sleeper?
3. **Check Format Detection**: Is the right rankings file being loaded?
4. **Review Logs**: Look for emoji-prefixed log messages
5. **Test Individual Services**: Import and test service methods directly

### **Common Issues**
- **Empty available_players**: Rankings file missing or all players drafted
- **Wrong format detected**: League detection logic needs adjustment  
- **Player name mismatches**: Name normalization needs improvement
- **Dynasty filtering errors**: Rostered player detection issues

---

## 📚 **Essential Reading Order**

1. **This file** - Core context and patterns
2. **AI_AGENT_GUIDE.md** - Comprehensive development guide
3. **API_DOCUMENTATION.md** - Complete API reference
4. **services/rankings_service.py** - Core business logic
5. **app_new.py** - Application structure

---

## 🎯 **Quick Commands for AI Agents**

```bash
# Start development
python3 app_new.py

# Test core functionality
curl http://localhost:5001/api/health
curl http://localhost:5001/api/user/edgecdec  
curl http://localhost:5001/api/draft/1255160696186880000

# Switch rankings (test manual override)
curl -X POST http://localhost:5001/api/rankings/select \
  -H "Content-Type: application/json" \
  -d '{"type": "fantasypros", "id": "ppr_superflex"}'

# Verify format change
curl http://localhost:5001/api/rankings/current-format?draft_id=1255160696186880000
```

---

**Remember**: This is a specialized fantasy football domain with specific business rules. Always consider the fantasy context when making changes, and test with real Sleeper data to ensure accuracy.

**Key Insight**: The system's value comes from accurate format detection and player filtering. Focus on these areas when debugging or adding features.
