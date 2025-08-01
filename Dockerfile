# Multi-stage build for Fantasy Football Draft Assistant
FROM node:18-alpine AS frontend-builder

# Build frontend
WORKDIR /app/frontend
COPY src/frontend/package*.json ./
RUN npm ci --only=production
COPY src/frontend/ ./
RUN npm run build

FROM python:3.9-slim AS backend-builder

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Build backend
WORKDIR /app/backend
COPY src/backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY src/backend/ ./

# Final stage
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create app user
RUN useradd --create-home --shell /bin/bash app

# Set working directory
WORKDIR /app

# Copy backend
COPY --from=backend-builder /app/backend ./backend
COPY --from=backend-builder /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages

# Copy built frontend
COPY --from=frontend-builder /app/frontend/build ./frontend/build

# Copy rankings data
COPY src/Rankings ./Rankings

# Create startup script
RUN cat > start.sh << 'EOF'
#!/bin/bash
echo "🏈 Starting Fantasy Football Draft Assistant..."
echo "Backend: http://localhost:5001"
echo "Frontend: http://localhost:3000"
echo ""

# Start backend
cd /app/backend
python app.py &
BACKEND_PID=$!

# Start frontend server (simple HTTP server for built React app)
cd /app/frontend/build
python -m http.server 3000 &
FRONTEND_PID=$!

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID
EOF

RUN chmod +x start.sh

# Change ownership
RUN chown -R app:app /app

# Switch to app user
USER app

# Expose ports
EXPOSE 3000 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5001/health || exit 1

# Start application
CMD ["./start.sh"]