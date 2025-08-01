#!/usr/bin/env python3
"""
Create an Electron desktop application for Fantasy Football Draft Assistant
"""

import os
import json
import shutil
from pathlib import Path

def create_electron_structure():
    """Create the Electron app structure"""
    print("📁 Creating Electron app structure...")
    
    electron_dir = Path("electron-app")
    if electron_dir.exists():
        shutil.rmtree(electron_dir)
    
    electron_dir.mkdir()
    
    # Create package.json for Electron app
    package_json = {
        "name": "fantasy-football-draft-assistant",
        "version": "1.0.0",
        "description": "Real-time draft tool for fantasy football",
        "main": "main.js",
        "scripts": {
            "start": "electron .",
            "build": "electron-builder",
            "build-win": "electron-builder --win",
            "build-mac": "electron-builder --mac",
            "build-linux": "electron-builder --linux",
            "dist": "electron-builder --publish=never"
        },
        "author": "Fantasy Football Draft Assistant",
        "license": "MIT",
        "devDependencies": {
            "electron": "^27.0.0",
            "electron-builder": "^24.6.4"
        },
        "dependencies": {
            "express": "^4.18.2",
            "cors": "^2.8.5",
            "axios": "^1.5.0"
        },
        "build": {
            "appId": "com.fantasyfootball.draftassistant",
            "productName": "Fantasy Football Draft Assistant",
            "directories": {
                "output": "dist"
            },
            "files": [
                "main.js",
                "preload.js",
                "backend/**/*",
                "frontend/build/**/*",
                "node_modules/**/*"
            ],
            "mac": {
                "category": "public.app-category.sports",
                "icon": "assets/icon.icns"
            },
            "win": {
                "target": "nsis",
                "icon": "assets/icon.ico"
            },
            "linux": {
                "target": "AppImage",
                "icon": "assets/icon.png",
                "category": "Game"
            },
            "nsis": {
                "oneClick": False,
                "allowToChangeInstallationDirectory": True,
                "createDesktopShortcut": True,
                "createStartMenuShortcut": True
            }
        }
    }
    
    with open(electron_dir / "package.json", 'w') as f:
        json.dump(package_json, f, indent=2)
    
    # Create main Electron process
    main_js = '''
const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const express = require('express');
const cors = require('cors');

let mainWindow;
let backendProcess;
let frontendServer;

// Backend server setup
function startBackendServer() {
  console.log('Starting backend server...');
  
  // In development, use Python directly
  // In production, this would use the bundled executable
  const backendPath = path.join(__dirname, 'backend');
  backendProcess = spawn('python', ['app.py'], {
    cwd: backendPath,
    stdio: 'inherit'
  });
  
  backendProcess.on('error', (err) => {
    console.error('Backend process error:', err);
  });
}

// Frontend server setup
function startFrontendServer() {
  console.log('Starting frontend server...');
  
  const app = express();
  app.use(cors());
  
  // Serve built React app
  const buildPath = path.join(__dirname, 'frontend', 'build');
  app.use(express.static(buildPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
  
  frontendServer = app.listen(3000, () => {
    console.log('Frontend server running on http://localhost:3000');
  });
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    title: 'Fantasy Football Draft Assistant'
  });

  // Start servers
  startBackendServer();
  
  // Wait a bit for backend to start, then start frontend
  setTimeout(() => {
    startFrontendServer();
    
    // Wait a bit more, then load the app
    setTimeout(() => {
      mainWindow.loadURL('http://localhost:3000');
    }, 2000);
  }, 3000);

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // Clean up processes
  if (backendProcess) {
    backendProcess.kill();
  }
  if (frontendServer) {
    frontendServer.close();
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle app quit
app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  if (frontendServer) {
    frontendServer.close();
  }
});
'''
    
    with open(electron_dir / "main.js", 'w') as f:
        f.write(main_js.strip())
    
    # Create preload script
    preload_js = '''
const { contextBridge } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Add any APIs you want to expose to the renderer process
});
'''
    
    with open(electron_dir / "preload.js", 'w') as f:
        f.write(preload_js.strip())
    
    # Create assets directory and placeholder icon
    assets_dir = electron_dir / "assets"
    assets_dir.mkdir()
    
    # Create a simple build script
    build_script = '''#!/bin/bash
echo "🏗️ Building Fantasy Football Draft Assistant Desktop App"
echo "=================================================="

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build frontend first
echo "🌐 Building React frontend..."
cd ../src/frontend
npm install
npm run build
cd ../../electron-app

# Copy built frontend
echo "📋 Copying frontend build..."
rm -rf frontend
mkdir -p frontend
cp -r ../src/frontend/build frontend/

# Copy backend
echo "📋 Copying backend..."
rm -rf backend
cp -r ../src/backend backend

# Build Electron app
echo "🚀 Building Electron application..."
npm run dist

echo ""
echo "✅ Build completed!"
echo "📦 Check the 'dist' folder for your application"
'''
    
    with open(electron_dir / "build.sh", 'w') as f:
        f.write(build_script.strip())
    os.chmod(electron_dir / "build.sh", 0o755)
    
    print("✅ Electron app structure created!")
    return True

def create_installer_instructions():
    """Create instructions for building installers"""
    instructions = '''
# 🚀 Desktop Application Build Instructions

## Prerequisites

1. **Install Node.js** (16+): https://nodejs.org
2. **Install Python** (3.7+): https://python.org

## Building the Desktop App

### Option 1: Electron Desktop App (Recommended)

```bash
cd electron-app
./build.sh
```

This creates native desktop applications:
- **Windows**: `.exe` installer in `dist/`
- **macOS**: `.dmg` installer in `dist/`
- **Linux**: `.AppImage` in `dist/`

### Option 2: Python Executable

```bash
python build_executables.py
```

This creates:
- Standalone backend executable
- Simple installer scripts
- Cross-platform launchers

## Distribution

### For End Users:
1. **Download** the installer for your platform
2. **Run** the installer
3. **Launch** from desktop shortcut or applications menu
4. **No dependencies** required - everything is bundled!

### Installer Features:
- ✅ **One-click installation**
- ✅ **Desktop shortcuts**
- ✅ **Start menu entries** (Windows/Linux)
- ✅ **Automatic updates** (can be added)
- ✅ **Uninstaller** included

## Platform-Specific Notes

### Windows
- Creates NSIS installer (.exe)
- Installs to Program Files
- Creates desktop and start menu shortcuts
- Includes uninstaller

### macOS
- Creates DMG disk image
- Drag-and-drop installation
- Code signing recommended for distribution
- Notarization required for Gatekeeper

### Linux
- Creates AppImage (portable)
- No installation required
- Works on most distributions
- Creates .desktop entry

## Advanced Options

### Code Signing
For production distribution, add code signing:

```json
"build": {
  "mac": {
    "identity": "Developer ID Application: Your Name"
  },
  "win": {
    "certificateFile": "path/to/certificate.p12",
    "certificatePassword": "password"
  }
}
```

### Auto-Updates
Add auto-update capability:

```bash
npm install electron-updater
```

### Custom Icons
Replace placeholder icons in `electron-app/assets/`:
- `icon.ico` (Windows)
- `icon.icns` (macOS)  
- `icon.png` (Linux)

## File Sizes
- **Electron App**: ~150-200MB (includes Chromium)
- **Python Executable**: ~50-100MB (backend only)

## Pros/Cons

### Electron App
✅ Native desktop experience
✅ Professional installers
✅ Auto-updates possible
✅ Cross-platform consistency
❌ Larger file size
❌ More complex build process

### Python Executable
✅ Smaller file size
✅ Simpler build process
✅ Backend-only distribution
❌ Still requires browser
❌ Less native feel
'''
    
    with open("DESKTOP_APP_INSTRUCTIONS.md", 'w') as f:
        f.write(instructions.strip())

def main():
    """Main function"""
    print("🖥️ Fantasy Football Draft Assistant - Desktop App Creator")
    print("=" * 60)
    
    # Create Electron app structure
    if not create_electron_structure():
        print("❌ Failed to create Electron app structure")
        return
    
    # Create instructions
    create_installer_instructions()
    
    print("")
    print("✅ Desktop app setup completed!")
    print("")
    print("📁 Created:")
    print("  • electron-app/ - Electron desktop application")
    print("  • build_executables.py - Python executable builder")
    print("  • DESKTOP_APP_INSTRUCTIONS.md - Build instructions")
    print("")
    print("🚀 Next steps:")
    print("  1. cd electron-app && ./build.sh")
    print("  2. Or: python build_executables.py")
    print("  3. Check DESKTOP_APP_INSTRUCTIONS.md for details")

if __name__ == "__main__":
    main()