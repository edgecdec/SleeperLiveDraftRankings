# Fantasy Football Draft API - Quick Reference

## 🚀 Base URL
```
http://localhost:5001
```

## 📋 Quick Endpoint Reference

### Health & Status
```bash
GET  /api/health                    # Health check
GET  /api/draft/settings            # Current settings
```

### Users & Leagues
```bash
GET  /api/user/{username}                    # Get user info
GET  /api/user/{username}/leagues            # Get user leagues
GET  /api/league/{league_id}/drafts          # Get league drafts
```

### Drafts
```bash
GET  /api/draft/{draft_id}/info              # Draft information
GET  /api/draft/{draft_id}                   # Comprehensive draft data
GET  /api/draft                              # Current draft data
POST /api/draft/set                          # Set current draft
GET  /api/draft/status?draft_id={id}         # Draft status
GET  /api/draft/refresh?draft_id={id}        # Refresh draft data
```

### Rankings
```bash
GET  /api/rankings/status                    # Rankings status
GET  /api/rankings/formats                   # Available formats
GET  /api/rankings/current-format            # Current format
POST /api/rankings/select                    # Select format
```

### Rosters
```bash
GET  /api/league/{league_id}/my-roster?username={user}  # Get roster
```

## 🔧 Common Usage Patterns

### 1. Basic Draft Setup
```bash
# 1. Get user info
curl "http://localhost:5001/api/user/edgecdec"

# 2. Get user leagues
curl "http://localhost:5001/api/user/edgecdec/leagues"

# 3. Set active draft
curl -X POST "http://localhost:5001/api/draft/set" \
  -H "Content-Type: application/json" \
  -d '{"draft_id": "1255160696186880000"}'

# 4. Get draft data
curl "http://localhost:5001/api/draft/1255160696186880000"
```

### 2. Rankings Management
```bash
# Check current format
curl "http://localhost:5001/api/rankings/current-format?draft_id=1255160696186880000"

# Switch to manual PPR superflex
curl -X POST "http://localhost:5001/api/rankings/select" \
  -H "Content-Type: application/json" \
  -d '{"type": "fantasypros", "id": "ppr_superflex"}'

# Return to auto-detection
curl -X POST "http://localhost:5001/api/rankings/select" \
  -H "Content-Type: application/json" \
  -d '{"type": "auto"}'
```

### 3. Real-time Draft Monitoring
```bash
# Get current draft status
curl "http://localhost:5001/api/draft/status?draft_id=1255160696186880000"

# Refresh when picks are made
curl "http://localhost:5001/api/draft/refresh?draft_id=1255160696186880000"
```

## 📊 Response Examples

### Draft Data Response
```json
{
  "draft_id": "1255160696186880000",
  "league_name": "My Fantasy League",
  "available_players": [
    {
      "name": "Josh Allen",
      "position": "QB",
      "team": "BUF",
      "rank": 1,
      "tier": 1
    }
  ],
  "positions": {
    "QB": [...],
    "RB": [...],
    "WR": [...]
  },
  "total_available": 450,
  "total_drafted": 34
}
```

### Rankings Format Response
```json
{
  "success": true,
  "scoring_format": "half_ppr",
  "league_type": "superflex",
  "is_manual": false,
  "source": "auto"
}
```

## 🎯 Available Rankings Formats

| Format ID | Description |
|-----------|-------------|
| `standard_standard` | Standard scoring, single QB |
| `standard_superflex` | Standard scoring, superflex/2QB |
| `half_ppr_standard` | Half PPR, single QB |
| `half_ppr_superflex` | Half PPR, superflex/2QB |
| `ppr_standard` | Full PPR, single QB |
| `ppr_superflex` | Full PPR, superflex/2QB |

## ⚡ Quick Test Commands

### Health Check
```bash
curl "http://localhost:5001/api/health"
```

### Get User Info
```bash
curl "http://localhost:5001/api/user/edgecdec"
```

### Get Draft Data
```bash
curl "http://localhost:5001/api/draft/1255160696186880000"
```

### Switch Rankings
```bash
curl -X POST "http://localhost:5001/api/rankings/select" \
  -H "Content-Type: application/json" \
  -d '{"type": "fantasypros", "id": "standard_standard"}'
```

## 🔍 Debugging Tips

### Check API Health
```bash
curl "http://localhost:5001/api/health" | jq
```

### Verify Rankings Format
```bash
curl "http://localhost:5001/api/rankings/current-format?draft_id=YOUR_DRAFT_ID" | jq
```

### Test with Different Users
```bash
curl "http://localhost:5001/api/user/YOUR_USERNAME" | jq
```

## 📝 Notes

- All responses are JSON format
- Player ranks are 1-indexed (1 = highest)
- Draft data is cached for 30 seconds
- Auto-detection works for most Sleeper leagues
- Manual override persists across draft switches
- Dynasty/Keeper leagues filter rostered players automatically

## 🚨 Common Issues

### "League information not found"
- Verify draft_id is correct
- Check if draft exists in Sleeper

### "User not found"
- Verify username spelling
- Check if user exists in Sleeper

### Empty available_players array
- Check if draft is complete
- Verify rankings file exists
- Try refreshing draft data

## 📚 Full Documentation

For complete documentation, see:
- `API_DOCUMENTATION.md` - Comprehensive API docs
- `openapi.yaml` - OpenAPI/Swagger specification
- `postman_collection.json` - Postman collection for testing
