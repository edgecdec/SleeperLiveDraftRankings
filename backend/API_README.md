# Fantasy Football Draft API Documentation

## 📖 Overview

This directory contains comprehensive documentation for the Fantasy Football Draft API, a service-oriented application that provides fantasy football draft management, player rankings, and league integration with the Sleeper platform.

## 📁 Documentation Files

### 📋 Core Documentation
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference with all endpoints, parameters, responses, and examples
- **[API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md)** - Quick reference guide for developers with common usage patterns
- **[REFACTORING_PLAN.md](./REFACTORING_PLAN.md)** - Architecture refactoring plan and implementation strategy

### 🔧 Technical Specifications
- **[openapi.yaml](./openapi.yaml)** - OpenAPI 3.0 specification for interactive documentation and code generation
- **[postman_collection.json](./postman_collection.json)** - Postman collection for API testing and exploration

### 🏗️ Architecture Documentation
- **[config.py](./config.py)** - Configuration settings and constants
- **[services/](./services/)** - Service layer documentation and implementation
- **[routes/](./routes/)** - Route handlers and endpoint implementations

## 🚀 Getting Started

### 1. Quick Start
```bash
# Start the API server
python3 app_new.py

# Test health endpoint
curl http://localhost:5001/api/health

# Get user information
curl http://localhost:5001/api/user/edgecdec
```

### 2. Import Postman Collection
1. Open Postman
2. Import `postman_collection.json`
3. Set environment variables:
   - `baseUrl`: `http://localhost:5001`
   - `username`: Your Sleeper username
   - `league_id`: Your league ID
   - `draft_id`: Your draft ID

### 3. View Interactive Documentation
```bash
# Serve OpenAPI spec with Swagger UI (if you have swagger-ui installed)
swagger-ui-serve openapi.yaml
```

## 🎯 Key Features

### Core Functionality
- **User Management**: Retrieve user information and leagues from Sleeper
- **Draft Tracking**: Real-time draft data with player availability
- **Rankings Management**: Multiple scoring formats with auto-detection
- **Roster Analysis**: Team composition and player rankings
- **League Integration**: Seamless Sleeper platform integration

### Supported Formats
- **Scoring**: Standard, Half PPR, Full PPR
- **League Types**: Standard (1 QB), Superflex (2 QB)
- **Special Leagues**: Dynasty, Keeper, Redraft

## 📊 API Architecture

### Service-Oriented Design
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Routes   │    │  Draft Routes   │    │Rankings Routes  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────────────────────────────────────┐
         │              Main Flask App                     │
         └─────────────────────────────────────────────────┘
                                 │
    ┌────────────────────────────┼────────────────────────────┐
    │                            │                            │
┌───▼────┐    ┌──────▼──────┐    ┌─▼──────────┐    ┌─────▼────┐
│Sleeper │    │  Rankings   │    │   League   │    │  Draft   │
│API     │    │  Service    │    │  Service   │    │ Service  │
│Service │    │             │    │            │    │          │
└────────┘    └─────────────┘    └────────────┘    └──────────┘
```

### Data Flow
1. **Request** → Route Handler → Service Layer → External APIs/Files
2. **Response** ← JSON Response ← Business Logic ← Data Processing

## 🔍 Common Use Cases

### 1. Draft Monitoring Workflow
```bash
# 1. Get user leagues
GET /api/user/{username}/leagues

# 2. Select a draft
POST /api/draft/set {"draft_id": "..."}

# 3. Get initial draft data
GET /api/draft/{draft_id}

# 4. Monitor for updates
GET /api/draft/refresh?draft_id={draft_id}
```

### 2. Rankings Management Workflow
```bash
# 1. Check current format
GET /api/rankings/current-format

# 2. Switch to manual override
POST /api/rankings/select {"type": "fantasypros", "id": "ppr_superflex"}

# 3. Get updated draft data
GET /api/draft/refresh?draft_id={draft_id}

# 4. Return to auto-detection
POST /api/rankings/select {"type": "auto"}
```

### 3. Team Analysis Workflow
```bash
# 1. Get roster composition
GET /api/league/{league_id}/my-roster?username={username}

# 2. Get draft data for available players
GET /api/draft/{draft_id}

# 3. Compare rankings and make decisions
```

## 🛠️ Development

### Running the API
```bash
# Install dependencies
pip install -r requirements.txt

# Start development server
python3 app_new.py

# API will be available at http://localhost:5001
```

### Testing Endpoints
```bash
# Health check
curl http://localhost:5001/api/health

# User information
curl http://localhost:5001/api/user/YOUR_USERNAME

# Draft data
curl http://localhost:5001/api/draft/YOUR_DRAFT_ID
```

### Environment Variables
```bash
# Optional configuration
export FLASK_DEBUG=True
export FLASK_PORT=5001
export RANKINGS_CACHE_DURATION=30
```

## 📈 Performance Considerations

### Caching Strategy
- **Draft Data**: 30-second cache for performance
- **Player Data**: 1-hour cache for Sleeper API calls
- **Rankings**: File-based with auto-refresh

### Rate Limiting
- Currently no rate limiting implemented
- Recommended: 100 requests/minute per IP
- Future: User-based rate limiting

### Optimization Tips
- Use draft refresh sparingly (only when needed)
- Cache user league data on frontend
- Batch multiple operations when possible

## 🔒 Security Notes

### Current Status
- No authentication required
- CORS enabled for frontend integration
- Input validation on critical endpoints

### Future Enhancements
- User authentication and sessions
- API key-based access control
- Request rate limiting
- Input sanitization improvements

## 🐛 Troubleshooting

### Common Issues

**"League information not found"**
- Verify draft ID exists in Sleeper
- Check if league is accessible
- Try refreshing draft data

**Empty player rankings**
- Check if rankings file exists
- Verify format detection is working
- Try manual format selection

**Slow response times**
- Check Sleeper API status
- Verify cache is working
- Consider reducing data payload

### Debug Endpoints
```bash
# Check API health
curl http://localhost:5001/api/health

# Verify current format
curl http://localhost:5001/api/rankings/current-format

# Check draft settings
curl http://localhost:5001/api/draft/settings
```

## 📞 Support

### Getting Help
1. Check the [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed endpoint information
2. Use the [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md) for common patterns
3. Import the Postman collection for interactive testing
4. Review the OpenAPI specification for technical details

### Contributing
1. Follow the service-oriented architecture patterns
2. Add comprehensive documentation for new endpoints
3. Update the OpenAPI specification
4. Include examples in the Postman collection
5. Test all changes thoroughly

---

**API Version**: 1.0.0  
**Last Updated**: January 27, 2025  
**Maintainer**: Fantasy Football Draft API Team
