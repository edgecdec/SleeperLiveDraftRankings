# Backend Refactoring Plan

## 🎯 **Goal**
Refactor the monolithic 1,411-line app.py file into a clean, maintainable, service-oriented architecture.

## 📊 **Current State**
- **File Size**: 1,411 lines, 57KB
- **Classes**: 4 major classes mixed together
- **Routes**: 15+ Flask endpoints in one file
- **Concerns**: Multiple responsibilities in single file

## 🏗️ **Proposed Structure**

```
backend/
├── app.py                 # Main Flask app (minimal, ~50 lines)
├── config.py             # Configuration and constants
├── services/             # Business logic services
│   ├── __init__.py
│   ├── sleeper_api.py    # SleeperAPI class
│   ├── rankings_service.py # RankingsService class
│   ├── league_service.py  # LeagueService class
│   └── draft_service.py   # DraftAPI → DraftService
├── routes/               # Flask route handlers
│   ├── __init__.py
│   ├── user_routes.py    # User/league endpoints
│   ├── draft_routes.py   # Draft-related endpoints
│   ├── rankings_routes.py # Rankings endpoints
│   └── roster_routes.py  # My Roster endpoints
└── utils/                # Utility functions (if needed)
    ├── __init__.py
    └── helpers.py
```

## 🔄 **Migration Strategy**

### Phase 1: Create Directory Structure
- Create `services/`, `routes/`, `utils/` directories
- Add `__init__.py` files

### Phase 2: Extract Services (Low Risk)
1. **sleeper_api.py** - Extract SleeperAPI class
2. **rankings_service.py** - Extract RankingsService class  
3. **league_service.py** - Extract LeagueService class
4. **draft_service.py** - Extract DraftAPI class (rename to DraftService)

### Phase 3: Extract Routes (Medium Risk)
1. **user_routes.py** - User and league endpoints
2. **draft_routes.py** - Draft-related endpoints
3. **rankings_routes.py** - Rankings management endpoints
4. **roster_routes.py** - My Roster endpoints

### Phase 4: Clean Main App (Low Risk)
1. **config.py** - Extract configuration
2. **app.py** - Minimal Flask app with route registration

### Phase 5: Testing & Validation
- Test each component after extraction
- Ensure all endpoints work correctly
- Verify no functionality is broken

## ✅ **Benefits**

1. **Maintainability**: Easy to find and modify specific functionality
2. **Testability**: Each service can be tested in isolation
3. **Scalability**: Easy to add new features without affecting existing code
4. **Readability**: Clear separation of concerns
5. **Team Development**: Multiple developers can work on different services
6. **Debugging**: Easier to locate and fix issues

## 🧪 **Testing Strategy**

After each phase:
- Run existing test suite
- Test all API endpoints manually
- Verify rankings switching works
- Check My Roster functionality
- Ensure draft data loading works

## 📋 **Success Criteria**

- All existing functionality works exactly the same
- Code is organized into logical, focused modules
- Main app.py is under 100 lines
- Each service has a single, clear responsibility
- Easy to understand and extend for future developers
