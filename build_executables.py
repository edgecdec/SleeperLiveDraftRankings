#!/usr/bin/env python3
"""
Build script to create standalone executables for Fantasy Football Draft Assistant
"""

import os
import sys
import subprocess
import shutil
import platform
from pathlib import Path

def run_command(cmd, cwd=None):
    """Run a command and return success status"""
    try:
        result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"❌ Command failed: {cmd}")
            print(f"Error: {result.stderr}")
            return False
        return True
    except Exception as e:
        print(f"❌ Exception running command: {cmd}")
        print(f"Error: {e}")
        return False

def install_dependencies():
    """Install required build dependencies"""
    print("📦 Installing build dependencies...")
    
    dependencies = [
        "pyinstaller",
        "flask",
        "requests",
        "flask-cors",
        "python-dotenv"
    ]
    
    for dep in dependencies:
        print(f"Installing {dep}...")
        if not run_command(f"pip install {dep}"):
            return False
    
    return True

def build_backend_executable():
    """Build the backend into a standalone executable"""
    print("🏗️ Building backend executable...")
    
    backend_dir = Path("src/backend")
    if not backend_dir.exists():
        print("❌ Backend directory not found!")
        return False
    
    # Create PyInstaller spec for backend
    spec_content = '''
# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['app.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('rankings', 'rankings'),
        ('templates', 'templates') if os.path.exists('templates') else None,
        ('static', 'static') if os.path.exists('static') else None,
    ],
    hiddenimports=[
        'flask',
        'flask_cors',
        'requests',
        'json',
        'csv',
        'datetime',
        'os',
        'sys'
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='FantasyFootballDraftAssistant-Backend',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
'''
    
    spec_file = backend_dir / "backend.spec"
    with open(spec_file, 'w') as f:
        f.write(spec_content.strip())
    
    # Build the executable
    cmd = f"pyinstaller --clean --onefile backend.spec"
    if not run_command(cmd, cwd=backend_dir):
        return False
    
    print("✅ Backend executable built successfully!")
    return True

def create_installer_script():
    """Create a simple installer script"""
    print("📝 Creating installer script...")
    
    system = platform.system().lower()
    
    if system == "windows":
        installer_content = '''@echo off
echo ========================================
echo Fantasy Football Draft Assistant Installer
echo ========================================
echo.

echo Installing to %USERPROFILE%\\FantasyFootballDraftAssistant...
mkdir "%USERPROFILE%\\FantasyFootballDraftAssistant" 2>nul

echo Copying files...
copy "FantasyFootballDraftAssistant-Backend.exe" "%USERPROFILE%\\FantasyFootballDraftAssistant\\"
copy "start_app.bat" "%USERPROFILE%\\FantasyFootballDraftAssistant\\"

echo Creating desktop shortcut...
echo Set oWS = WScript.CreateObject("WScript.Shell") > CreateShortcut.vbs
echo sLinkFile = "%USERPROFILE%\\Desktop\\Fantasy Football Draft Assistant.lnk" >> CreateShortcut.vbs
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> CreateShortcut.vbs
echo oLink.TargetPath = "%USERPROFILE%\\FantasyFootballDraftAssistant\\start_app.bat" >> CreateShortcut.vbs
echo oLink.Save >> CreateShortcut.vbs
cscript CreateShortcut.vbs
del CreateShortcut.vbs

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo Desktop shortcut created: Fantasy Football Draft Assistant
echo Installation directory: %USERPROFILE%\\FantasyFootballDraftAssistant
echo.
pause
'''
        
        with open("installer.bat", 'w') as f:
            f.write(installer_content)
            
        # Create app launcher
        launcher_content = '''@echo off
cd /d "%~dp0"
echo Starting Fantasy Football Draft Assistant...
echo Backend will start on http://localhost:5001
echo.
echo Open your browser to http://localhost:3000 after both servers start
echo Press Ctrl+C to stop the application
echo.
start "Backend" FantasyFootballDraftAssistant-Backend.exe
timeout /t 3 /nobreak >nul
echo Backend started! Now open http://localhost:3000 in your browser
pause
'''
        
        with open("start_app.bat", 'w') as f:
            f.write(launcher_content)
    
    else:  # macOS/Linux
        installer_content = '''#!/bin/bash
echo "========================================"
echo "Fantasy Football Draft Assistant Installer"
echo "========================================"
echo ""

INSTALL_DIR="$HOME/FantasyFootballDraftAssistant"

echo "Installing to $INSTALL_DIR..."
mkdir -p "$INSTALL_DIR"

echo "Copying files..."
cp "FantasyFootballDraftAssistant-Backend" "$INSTALL_DIR/"
cp "start_app.sh" "$INSTALL_DIR/"
chmod +x "$INSTALL_DIR/FantasyFootballDraftAssistant-Backend"
chmod +x "$INSTALL_DIR/start_app.sh"

# Create desktop entry for Linux
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "Creating desktop entry..."
    cat > "$HOME/.local/share/applications/fantasy-football-draft-assistant.desktop" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Fantasy Football Draft Assistant
Comment=Real-time draft tool for fantasy football
Exec=$INSTALL_DIR/start_app.sh
Icon=applications-games
Terminal=true
Categories=Game;Sports;
EOF
fi

echo ""
echo "========================================"
echo "Installation Complete!"
echo "========================================"
echo "Installation directory: $INSTALL_DIR"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "Desktop entry created in Applications menu"
fi
echo ""
echo "To start the application:"
echo "  cd $INSTALL_DIR && ./start_app.sh"
echo ""
'''
        
        with open("installer.sh", 'w') as f:
            f.write(installer_content)
        os.chmod("installer.sh", 0o755)
        
        # Create app launcher
        launcher_content = '''#!/bin/bash
cd "$(dirname "$0")"
echo "Starting Fantasy Football Draft Assistant..."
echo "Backend will start on http://localhost:5001"
echo ""
echo "Open your browser to http://localhost:3000 after the backend starts"
echo "Press Ctrl+C to stop the application"
echo ""

./FantasyFootballDraftAssistant-Backend &
BACKEND_PID=$!

echo "Backend started! Now open http://localhost:3000 in your browser"
echo "Press Enter to stop the application..."
read

kill $BACKEND_PID 2>/dev/null
echo "Application stopped."
'''
        
        with open("start_app.sh", 'w') as f:
            f.write(launcher_content)
        os.chmod("start_app.sh", 0o755)

def main():
    """Main build process"""
    print("🏗️ Fantasy Football Draft Assistant - Executable Builder")
    print("=" * 60)
    
    # Check if we're in the right directory
    if not Path("src/backend/app.py").exists():
        print("❌ Please run this script from the project root directory")
        sys.exit(1)
    
    # Install dependencies
    if not install_dependencies():
        print("❌ Failed to install dependencies")
        sys.exit(1)
    
    # Build backend executable
    if not build_backend_executable():
        print("❌ Failed to build backend executable")
        sys.exit(1)
    
    # Create installer
    create_installer_script()
    
    print("")
    print("✅ Build completed successfully!")
    print("")
    print("Files created:")
    print("  • FantasyFootballDraftAssistant-Backend executable")
    print("  • Installer script")
    print("  • App launcher script")
    print("")
    print("Next steps:")
    print("  1. Test the executable locally")
    print("  2. Create distribution package")
    print("  3. Consider code signing for production")

if __name__ == "__main__":
    main()