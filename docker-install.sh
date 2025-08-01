#!/bin/bash

echo "🏈 Fantasy Football Draft Assistant - Docker Installer"
echo "=================================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo ""
    echo "Please install Docker Desktop first:"
    echo "  • Windows/Mac: https://www.docker.com/products/docker-desktop/"
    echo "  • Linux: https://docs.docker.com/engine/install/"
    echo ""
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running!"
    echo ""
    echo "Please start Docker Desktop and try again."
    echo ""
    exit 1
fi

echo "✅ Docker is installed and running"
echo ""

# Create application directory
APP_DIR="$HOME/FantasyFootballDraftAssistant"
echo "📁 Creating application directory: $APP_DIR"
mkdir -p "$APP_DIR"
cd "$APP_DIR"

# Download docker-compose.yml
echo "📥 Downloading configuration..."
curl -sSL https://raw.githubusercontent.com/edgecdec/SleeperLiveDraftRankings/main/docker-compose.yml -o docker-compose.yml

if [ $? -ne 0 ]; then
    echo "❌ Failed to download configuration"
    echo "Please check your internet connection and try again."
    exit 1
fi

# Pull the Docker image
echo "📦 Downloading application (this may take a few minutes)..."
docker-compose pull

if [ $? -ne 0 ]; then
    echo "❌ Failed to download application"
    echo "Please check your internet connection and try again."
    exit 1
fi

# Create start script
echo "📝 Creating start script..."
cat > start.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
echo "🏈 Starting Fantasy Football Draft Assistant..."
echo ""
docker-compose up -d
echo ""
echo "✅ Application started!"
echo ""
echo "🌐 Open your browser to: http://localhost:3000"
echo ""
echo "To stop the application, run: ./stop.sh"
EOF

chmod +x start.sh

# Create stop script
cat > stop.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
echo "🛑 Stopping Fantasy Football Draft Assistant..."
docker-compose down
echo "✅ Application stopped!"
EOF

chmod +x stop.sh

# Create desktop shortcut (Linux only)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🖥️ Creating desktop shortcut..."
    cat > "$HOME/.local/share/applications/fantasy-football-draft-assistant.desktop" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Fantasy Football Draft Assistant
Comment=Real-time draft tool for fantasy football
Exec=$APP_DIR/start.sh
Icon=applications-games
Terminal=true
Categories=Game;Sports;
EOF
fi

echo ""
echo "🎉 Installation completed successfully!"
echo ""
echo "📁 Installation directory: $APP_DIR"
echo ""
echo "🚀 To start the application:"
echo "  ./start.sh"
echo ""
echo "🛑 To stop the application:"
echo "  ./stop.sh"
echo ""
echo "🌐 Once started, open your browser to:"
echo "  http://localhost:3000"
echo ""

# Ask if user wants to start now
read -p "Would you like to start the application now? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starting application..."
    ./start.sh
    echo ""
    echo "🌐 Opening browser..."
    
    # Try to open browser
    if command -v xdg-open &> /dev/null; then
        xdg-open http://localhost:3000
    elif command -v open &> /dev/null; then
        open http://localhost:3000
    else
        echo "Please open http://localhost:3000 in your browser"
    fi
fi

echo ""
echo "🏈 Ready to dominate your draft!"