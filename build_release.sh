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
cp -r backend "$RELEASE_DIR/"
# Remove debug files and logs
rm -f "$RELEASE_DIR/backend/debug_*.py"
rm -f "$RELEASE_DIR/backend/test_*.py"
rm -f "$RELEASE_DIR/backend/server.log"
rm -f "$RELEASE_DIR/backend/current_rankings_selection.json"
rm -f "$RELEASE_DIR/backend/manual_rankings_override.json"

# Frontend files (source code for npm install)
cp -r frontend "$RELEASE_DIR/"
# Remove node_modules and build artifacts
rm -rf "$RELEASE_DIR/frontend/node_modules"
rm -rf "$RELEASE_DIR/frontend/build"

# Rankings files
cp -r Rankings "$RELEASE_DIR/"

# Start scripts
cp start.sh "$RELEASE_DIR/"
cp start.bat "$RELEASE_DIR/"

# Documentation
cp RELEASE_README.md "$RELEASE_DIR/README.md"

# Create additional helpful files
echo "📝 Creating additional files..."

# Create a simple package.json check script
cat > "$RELEASE_DIR/check_dependencies.sh" << 'EOF'
#!/bin/bash
echo "🔍 Checking system dependencies..."

# Check Python
if command -v python3 &> /dev/null; then
    echo "✅ Python 3: $(python3 --version)"
else
    echo "❌ Python 3: Not found - Please install from https://python.org"
fi

# Check pip
if command -v pip &> /dev/null || command -v pip3 &> /dev/null; then
    echo "✅ pip: Available"
else
    echo "❌ pip: Not found - Please install Python with pip"
fi

# Check Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js: Not found - Please install from https://nodejs.org"
fi

# Check npm
if command -v npm &> /dev/null; then
    echo "✅ npm: $(npm --version)"
else
    echo "❌ npm: Not found - Please install Node.js with npm"
fi

echo ""
echo "If all dependencies show ✅, you're ready to run the application!"
EOF

chmod +x "$RELEASE_DIR/check_dependencies.sh"

# Create Windows dependency check
cat > "$RELEASE_DIR/check_dependencies.bat" << 'EOF'
@echo off
echo 🔍 Checking system dependencies...

python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Python: Available
) else (
    echo ❌ Python: Not found - Please install from https://python.org
)

pip --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ pip: Available
) else (
    echo ❌ pip: Not found - Please install Python with pip
)

node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js: Available
) else (
    echo ❌ Node.js: Not found - Please install from https://nodejs.org
)

npm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ npm: Available
) else (
    echo ❌ npm: Not found - Please install Node.js with npm
)

echo.
echo If all dependencies show ✅, you're ready to run the application!
pause
EOF

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
