# Fantasy Football Draft API Documentation

## Overview

The Fantasy Football Draft API provides comprehensive functionality for managing fantasy football drafts, including player rankings, league information, draft tracking, and roster management. The API integrates with Sleeper Fantasy Football platform and supports multiple scoring formats and league types.

**Base URL**: `http://localhost:5001`  
**API Version**: v1  
**Content-Type**: `application/json`  
**CORS**: Enabled for frontend integration

---

## Table of Contents

1. [Authentication](#authentication)
2. [User & League Endpoints](#user--league-endpoints)
3. [Draft Endpoints](#draft-endpoints)
4. [Rankings Endpoints](#rankings-endpoints)
5. [Roster Endpoints](#roster-endpoints)
6. [Health & Status Endpoints](#health--status-endpoints)
7. [Data Models](#data-models)
8. [Error Handling](#error-handling)
9. [Rate Limiting](#rate-limiting)
10. [Examples](#examples)

---

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

> **Note**: Authentication and authorization will be added in future versions.

---

## User & League Endpoints

### Get User Information

Retrieve user information by Sleeper username.

**Endpoint**: `GET /api/user/{username}`

**Parameters**:
- `username` (path, required): Sleeper username

**Response**:
```json
{
  "user_id": "123456789",
  "username": "edgecdec",
  "display_name": "EdgeCDec",
  "avatar": "avatar_id",
  "metadata": {
    "team_name": "Team Name"
  }
}
```

**Status Codes**:
- `200`: Success
- `404`: User not found

**Example**:
```bash
curl -X GET "http://localhost:5001/api/user/edgecdec"
```

---

### Get User Leagues

Retrieve all leagues for a specific user in a given season.

**Endpoint**: `GET /api/user/{username}/leagues`

**Parameters**:
- `username` (path, required): Sleeper username
- `season` (query, optional): NFL season year (default: "2025")

**Response**:
```json
{
  "user": {
    "user_id": "123456789",
    "username": "edgecdec",
    "display_name": "EdgeCDec"
  },
  "leagues": [
    {
      "league_id": "1255160696174284800",
      "name": "My Fantasy League",
      "status": "in_season",
      "sport": "nfl",
      "season": "2025",
      "season_type": "regular",
      "total_rosters": 12,
      "scoring_settings": {
        "rec": 0.5,
        "pass_td": 4
      },
      "roster_positions": ["QB", "RB", "RB", "WR", "WR", "TE", "FLEX", "K", "DEF", "BN", "BN", "BN", "BN", "BN", "BN"],
      "drafts": [
        {
          "draft_id": "1255160696186880000",
          "status": "complete",
          "type": "snake",
          "start_time": 1693526400000
        }
      ]
    }
  ],
  "season": "2025"
}
```

**Status Codes**:
- `200`: Success
- `404`: User not found

**Example**:
```bash
curl -X GET "http://localhost:5001/api/user/edgecdec/leagues?season=2025"
```

---

### Get League Drafts

Retrieve all drafts for a specific league.

**Endpoint**: `GET /api/league/{league_id}/drafts`

**Parameters**:
- `league_id` (path, required): Sleeper league ID

**Response**:
```json
[
  {
    "draft_id": "1255160696186880000",
    "status": "complete",
    "type": "snake",
    "start_time": 1693526400000,
    "sport": "nfl",
    "season": "2025",
    "league_id": "1255160696174284800",
    "metadata": {
      "scoring_type": "ppr"
    }
  }
]
```

**Status Codes**:
- `200`: Success
- `404`: League not found

---

## Draft Endpoints

### Get Draft Information

Retrieve detailed information about a specific draft.

**Endpoint**: `GET /api/draft/{draft_id}/info`

**Parameters**:
- `draft_id` (path, required): Sleeper draft ID

**Response**:
```json
{
  "draft_id": "1255160696186880000",
  "status": "complete",
  "type": "snake",
  "start_time": 1693526400000,
  "sport": "nfl",
  "season": "2025",
  "league_id": "1255160696174284800",
  "metadata": {
    "scoring_type": "ppr"
  },
  "settings": {
    "teams": 12,
    "rounds": 16,
    "pick_timer": 120
  }
}
```

**Status Codes**:
- `200`: Success
- `404`: Draft not found

---

### Get Draft Data with Rankings

Retrieve comprehensive draft data including available players, rankings, and draft status.

**Endpoint**: `GET /api/draft/{draft_id}`

**Parameters**:
- `draft_id` (path, required): Sleeper draft ID

**Response**:
```json
{
  "draft_id": "1255160696186880000",
  "league_name": "My Fantasy League",
  "is_dynasty_keeper": false,
  "last_updated": "2025-01-27T21:00:00.000Z",
  "available_players": [
    {
      "name": "Josh Allen",
      "position": "QB",
      "team": "BUF",
      "rank": 1,
      "tier": 1
    },
    {
      "name": "Saquon Barkley",
      "position": "RB",
      "team": "PHI",
      "rank": 2,
      "tier": 1
    }
  ],
  "positions": {
    "QB": [
      {
        "name": "Josh Allen",
        "position": "QB",
        "team": "BUF",
        "rank": 1,
        "target_rank": 1,
        "tier": 1
      }
    ],
    "RB": [
      {
        "name": "Saquon Barkley",
        "position": "RB",
        "team": "PHI",
        "rank": 2,
        "target_rank": 1,
        "tier": 1
      }
    ],
    "WR": [...],
    "TE": [...],
    "K": [...],
    "FLEX": [...],
    "ALL": [...]
  },
  "total_available": 450,
  "total_drafted": 34,
  "total_rostered": 0,
  "filtered_count": 0,
  "draft_info": {
    "status": "complete",
    "type": "snake"
  }
}
```

**Status Codes**:
- `200`: Success
- `400`: Invalid draft ID or league information not found
- `500`: Internal server error

---

### Get Current Draft Data

Retrieve data for the currently active draft.

**Endpoint**: `GET /api/draft`

**Response**: Same as `/api/draft/{draft_id}` but uses the currently set draft ID.

**Status Codes**:
- `200`: Success
- `400`: No active draft set
- `500`: Internal server error

---

### Set Current Draft

Set the active draft ID for the session.

**Endpoint**: `POST /api/draft/set`

**Request Body**:
```json
{
  "draft_id": "1255160696186880000"
}
```

**Response**:
```json
{
  "success": true,
  "draft_id": "1255160696186880000"
}
```

**Status Codes**:
- `200`: Success
- `400`: Missing draft_id parameter

---

### Get Draft Status

Get current draft status and available players with optional draft ID.

**Endpoint**: `GET /api/draft/status`

**Parameters**:
- `draft_id` (query, optional): Sleeper draft ID

**Response**: Same as `/api/draft/{draft_id}`

---

### Refresh Draft Data

Force refresh of cached draft data.

**Endpoint**: `GET /api/draft/refresh`

**Parameters**:
- `draft_id` (query, optional): Sleeper draft ID

**Response**: Same as `/api/draft/{draft_id}` with refreshed data

---

## Rankings Endpoints

### Get Rankings Status

Retrieve current rankings status and metadata.

**Endpoint**: `GET /api/rankings/status`

**Response**:
```json
{
  "last_updated": "2025-01-27T21:00:00.000Z",
  "total_rankings": 6,
  "available_formats": [
    "standard_standard",
    "standard_superflex",
    "half_ppr_standard",
    "half_ppr_superflex",
    "ppr_standard",
    "ppr_superflex"
  ],
  "current_format": "half_ppr_superflex",
  "is_manual_override": false
}
```

**Status Codes**:
- `200`: Success
- `500`: Internal server error

---

### Get Available Formats

Retrieve all available ranking formats.

**Endpoint**: `GET /api/rankings/formats`

**Response**:
```json
{
  "formats": [
    {
      "id": "standard_standard",
      "name": "Standard Scoring - Standard League",
      "scoring": "standard",
      "league_type": "standard",
      "description": "No PPR, single QB league"
    },
    {
      "id": "half_ppr_superflex",
      "name": "Half PPR - Superflex League",
      "scoring": "half_ppr",
      "league_type": "superflex",
      "description": "0.5 PPR, superflex/2QB league"
    }
  ]
}
```

**Status Codes**:
- `200`: Success
- `500`: Internal server error

---

### Get Current Rankings Format

Get the current rankings format being used based on league settings.

**Endpoint**: `GET /api/rankings/current-format`

**Parameters**:
- `draft_id` (query, optional): Draft ID for format detection

**Response**:
```json
{
  "success": true,
  "scoring_format": "half_ppr",
  "league_type": "superflex",
  "is_manual": false,
  "source": "auto",
  "rankings_filename": "FantasyPros_Rankings_half_ppr_superflex.csv"
}
```

**Status Codes**:
- `200`: Success
- `404`: League information not found
- `500`: Internal server error

---

### Select Rankings Format

Select which rankings format to use (manual override or auto-detection).

**Endpoint**: `POST /api/rankings/select`

**Request Body**:
```json
{
  "type": "fantasypros",
  "id": "half_ppr_superflex"
}
```

**Request Body (Auto-detection)**:
```json
{
  "type": "auto"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Selected half_ppr superflex rankings",
  "format": "half_ppr_superflex",
  "file": "FantasyPros_Rankings_half_ppr_superflex.csv"
}
```

**Status Codes**:
- `200`: Success
- `400`: Invalid format key or ranking type
- `404`: Rankings file not found
- `500`: Internal server error
- `501`: Custom rankings not implemented

---

## Roster Endpoints

### Get My Roster

Retrieve the current user's roster for a league with starter/bench breakdown.

**Endpoint**: `GET /api/league/{league_id}/my-roster`

**Parameters**:
- `league_id` (path, required): Sleeper league ID
- `username` (query, required): Sleeper username
- `draft_id` (query, optional): Draft ID to include current draft picks

**Response**:
```json
{
  "league_id": "1255160696174284800",
  "username": "edgecdec",
  "roster_id": 1,
  "total_players": 16,
  "drafted_this_draft": 0,
  "roster_settings": {
    "starter_counts": {
      "QB": 1,
      "RB": 2,
      "WR": 2,
      "TE": 1,
      "FLEX": 1,
      "K": 1,
      "DEF": 1
    },
    "bench_slots": 6,
    "taxi_slots": 0,
    "reserve_slots": 0
  },
  "positions": {
    "QB": [
      {
        "name": "Josh Allen",
        "position": "QB",
        "team": "BUF",
        "rank": 1,
        "tier": 1,
        "status": "rostered"
      }
    ],
    "RB": [...],
    "WR": [...],
    "TE": [...],
    "K": [...],
    "DEF": [...],
    "BENCH": [...]
  },
  "position_counts": {
    "QB": 1,
    "RB": 2,
    "WR": 3,
    "TE": 1,
    "K": 1,
    "DEF": 1,
    "BENCH": 7
  }
}
```

**Status Codes**:
- `200`: Success
- `400`: Missing username parameter
- `404`: League or user not found
- `500`: Internal server error

---

## Health & Status Endpoints

### Health Check

Check API health and service status.

**Endpoint**: `GET /api/health`

**Response**:
```json
{
  "status": "healthy",
  "message": "Fantasy Football Draft API is running",
  "services": {
    "sleeper_api": "active",
    "league_service": "active",
    "rankings_service": "active",
    "draft_service": "active"
  }
}
```

**Status Codes**:
- `200`: API is healthy
- `500`: API is unhealthy

---

### Get Draft Settings

Get current draft settings and configuration.

**Endpoint**: `GET /api/draft/settings`

**Response**:
```json
{
  "draft_id": "1255160696186880000",
  "file_name": "RankingsManager",
  "refresh_interval": 30
}
```

**Status Codes**:
- `200`: Success

---

## Data Models

### Player Object
```json
{
  "name": "Josh Allen",
  "position": "QB",
  "team": "BUF",
  "rank": 1,
  "tier": 1,
  "target_rank": 1
}
```

### League Object
```json
{
  "league_id": "1255160696174284800",
  "name": "My Fantasy League",
  "status": "in_season",
  "sport": "nfl",
  "season": "2025",
  "total_rosters": 12,
  "scoring_settings": {
    "rec": 0.5,
    "pass_td": 4
  },
  "roster_positions": ["QB", "RB", "RB", "WR", "WR", "TE", "FLEX", "K", "DEF", "BN", "BN", "BN", "BN", "BN", "BN"]
}
```

### Draft Object
```json
{
  "draft_id": "1255160696186880000",
  "status": "complete",
  "type": "snake",
  "start_time": 1693526400000,
  "sport": "nfl",
  "season": "2025",
  "league_id": "1255160696174284800"
}
```

### User Object
```json
{
  "user_id": "123456789",
  "username": "edgecdec",
  "display_name": "EdgeCDec",
  "avatar": "avatar_id"
}
```

---

## Error Handling

### Standard Error Response
```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes
- `200`: Success
- `400`: Bad Request - Invalid parameters or request body
- `404`: Not Found - Resource not found
- `500`: Internal Server Error - Server-side error
- `501`: Not Implemented - Feature not yet implemented

### Error Examples

**User Not Found (404)**:
```json
{
  "error": "User not found"
}
```

**Missing Parameters (400)**:
```json
{
  "error": "username parameter is required"
}
```

**Invalid Draft ID (400)**:
```json
{
  "error": "League information not found"
}
```

---

## Rate Limiting

Currently, no rate limiting is implemented. All endpoints can be called without restrictions.

> **Note**: Rate limiting will be added in future versions to prevent abuse.

---

## Examples

### Complete Draft Workflow

1. **Get User Information**:
```bash
curl -X GET "http://localhost:5001/api/user/edgecdec"
```

2. **Get User's Leagues**:
```bash
curl -X GET "http://localhost:5001/api/user/edgecdec/leagues?season=2025"
```

3. **Get League Drafts**:
```bash
curl -X GET "http://localhost:5001/api/league/1255160696174284800/drafts"
```

4. **Set Active Draft**:
```bash
curl -X POST "http://localhost:5001/api/draft/set" \
  -H "Content-Type: application/json" \
  -d '{"draft_id": "1255160696186880000"}'
```

5. **Get Draft Data with Rankings**:
```bash
curl -X GET "http://localhost:5001/api/draft/1255160696186880000"
```

6. **Select Manual Rankings**:
```bash
curl -X POST "http://localhost:5001/api/rankings/select" \
  -H "Content-Type: application/json" \
  -d '{"type": "fantasypros", "id": "ppr_superflex"}'
```

7. **Get Updated Draft Data**:
```bash
curl -X GET "http://localhost:5001/api/draft/refresh?draft_id=1255160696186880000"
```

### Rankings Management Workflow

1. **Check Available Formats**:
```bash
curl -X GET "http://localhost:5001/api/rankings/formats"
```

2. **Get Current Format**:
```bash
curl -X GET "http://localhost:5001/api/rankings/current-format?draft_id=1255160696186880000"
```

3. **Switch to Manual Override**:
```bash
curl -X POST "http://localhost:5001/api/rankings/select" \
  -H "Content-Type: application/json" \
  -d '{"type": "fantasypros", "id": "standard_standard"}'
```

4. **Return to Auto-Detection**:
```bash
curl -X POST "http://localhost:5001/api/rankings/select" \
  -H "Content-Type: application/json" \
  -d '{"type": "auto"}'
```

---

## Notes

- All timestamps are in Unix milliseconds format
- Player rankings are 1-indexed (1 = highest ranked)
- Tier values are 1-indexed (1 = highest tier)
- League IDs and Draft IDs are Sleeper platform identifiers
- The API automatically detects league format (PPR, Superflex) unless manually overridden
- Dynasty/Keeper leagues automatically filter out rostered players
- Draft data is cached for 30 seconds to improve performance

---

## Support

For issues, questions, or feature requests, please refer to the project repository or contact the development team.

**API Version**: 1.0  
**Last Updated**: January 27, 2025
