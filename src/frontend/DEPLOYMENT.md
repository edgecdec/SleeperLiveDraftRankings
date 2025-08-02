# Frontend Deployment Guide

## Architecture Overview

This application consists of:
- **Frontend**: React app that runs in the browser
- **Backend**: Python Flask API that runs locally on the user's machine

## Local Development & Production Usage

### For Users (Recommended)

1. **Start the Backend** (Python Flask server):
   ```bash
   cd src/backend
   python3 app.py
   # Server runs on http://localhost:5001
   ```

2. **Serve the Frontend** (HTTP server to avoid CORS issues):
   ```bash
   cd src/frontend
   npm run build-and-serve
   # Frontend runs on http://localhost:3000
   # Connects to backend at http://localhost:5001
   ```

3. **Open in Browser**:
   - Go to `http://localhost:3000`
   - The frontend will connect to your local backend

### For Developers

1. **Development Mode** (with hot reload):
   ```bash
   # Terminal 1 - Backend
   cd src/backend && python3 app.py
   
   # Terminal 2 - Frontend
   cd src/frontend && npm start
   ```

## Browser Security Considerations

### Why HTTP Frontend?

When the frontend is served from HTTPS (like Cloudflare Pages), browsers block requests to HTTP localhost due to:

1. **Mixed Content Policy**: HTTPS sites can't make HTTP requests
2. **CORS Restrictions**: Cross-origin requests to localhost are blocked

### Solutions:

1. **HTTP Frontend** (Current approach):
   - Serve frontend from `http://localhost:3000`
   - Connect to backend at `http://localhost:5001`
   - ✅ No browser security issues

2. **HTTPS Backend** (Alternative):
   - Use HTTPS certificates for local backend
   - More complex setup for users

3. **Browser Flags** (Not recommended):
   - Users could disable security features
   - Creates security vulnerabilities

## Deployment Options

### Option 1: Local HTTP Server (Recommended)
```bash
npm run build-and-serve
```
- Serves built frontend from HTTP
- No CORS issues with localhost backend
- Best user experience

### Option 2: Static File Server
```bash
npm run build
npx serve -s build -p 3000
```
- Alternative HTTP server
- Same benefits as Option 1

### Option 3: Cloudflare Pages (For Demo Only)
- Frontend works but can't connect to localhost backend
- Good for showcasing UI without backend functionality
- Users would need to run locally for full functionality

## User Instructions

### Quick Start
1. Download/clone the repository
2. Install dependencies: `npm install` (in frontend directory)
3. Start backend: `python3 src/backend/app.py`
4. Start frontend: `npm run build-and-serve` (in frontend directory)
5. Open `http://localhost:3000`

### Troubleshooting

**"Cannot connect to backend"**:
- Ensure backend is running on port 5001
- Check that no firewall is blocking the connection
- Verify CORS is enabled on backend

**"Mixed content blocked"**:
- Use HTTP frontend server (not HTTPS)
- Don't access via Cloudflare Pages for full functionality

**"CORS error"**:
- Backend should have CORS enabled for all origins
- Check backend logs for CORS configuration