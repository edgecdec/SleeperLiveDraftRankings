#!/bin/bash

echo "🏗️ Building Fantasy Football Draft Assistant Release Package"
echo "============================================================"

# Set version
VERSION="v1.0.0"
RELEASE_NAME="FantasyFootballDraftAssistant-${VERSION}"
RELEASE_DIR="../${RELEASE_NAME}"

# Create release directory
echo "📁 Creating release directory..."
rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR"

# Copy essential files
echo "📋 Copying application files..."

# Backend files
cp -r src/backend "$RELEASE_DIR/backend"
# Remove debug files and logs
rm -f "$RELEASE_DIR/backend/debug_*.py"
rm -f "$RELEASE_DIR/backend/test_*.py"
rm -f "$RELEASE_DIR/backend/server.log"
rm -f "$RELEASE_DIR/backend/current_rankings_selection.json"
rm -f "$RELEASE_DIR/backend/manual_rankings_override.json"

# Frontend files (source code for npm install)
cp -r src/frontend "$RELEASE_DIR/frontend"
# Remove node_modules and build artifacts
rm -rf "$RELEASE_DIR/frontend/node_modules"
rm -rf "$RELEASE_DIR/frontend/build"

# Rankings files
cp -r src/Rankings "$RELEASE_DIR/Rankings"

# Start scripts
cp start.sh "$RELEASE_DIR/"
cp start.bat "$RELEASE_DIR/"

# Dependency checkers
cp check_dependencies.sh "$RELEASE_DIR/"
cp check_dependencies.bat "$RELEASE_DIR/"
chmod +x "$RELEASE_DIR/check_dependencies.sh"

# Documentation
cp doc/RELEASE_README.md "$RELEASE_DIR/README.md"

# Create additional helpful files
echo "📝 Creating additional files..."

# Create ZIP file
echo "📦 Creating ZIP package..."
cd ..
zip -r "${RELEASE_NAME}.zip" "$RELEASE_NAME" -x "*.DS_Store" "*/__pycache__/*" "*/node_modules/*" "*/build/*"

echo ""
echo "✅ Release package created successfully!"
echo "📦 File: ${RELEASE_NAME}.zip"
echo "📁 Directory: ${RELEASE_NAME}/"
echo ""
echo "🚀 Ready for distribution!"
