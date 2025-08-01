const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const express = require('express');
const http = require('http');

let mainWindow;
let backendProcess;
let frontendServer;

// Function to check if backend is ready
function checkBackendReady(callback, attempts = 0) {
  const maxAttempts = 60; // 60 seconds max
  
  if (attempts >= maxAttempts) {
    callback(false);
    return;
  }
  
  // Try a simple connection first, then the health endpoint
  const testUrl = attempts < 10 ? 'http://localhost:5001/' : 'http://localhost:5001/api/health';
  
  const req = http.get(testUrl, (res) => {
    callback(true);
  });
  
  req.on('error', (err) => {
    setTimeout(() => checkBackendReady(callback, attempts + 1), 1000);
  });
  
  req.setTimeout(2000, () => {
    req.destroy();
    setTimeout(() => checkBackendReady(callback, attempts + 1), 1000);
  });
}

// Backend server setup
function startBackendServer() {
  // In packaged app, backend is in app.asar.unpacked
  // In development, it's in the regular backend directory
  let backendPath;
  if (app.isPackaged) {
    backendPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'backend');
  } else {
    backendPath = path.join(__dirname, 'backend');
  }
  
  // Check if backend directory exists
  const fs = require('fs');
  if (!fs.existsSync(backendPath)) {
    return;
  }
  
  // Check if app.py exists
  const appPyPath = path.join(backendPath, 'app.py');
  if (!fs.existsSync(appPyPath)) {
    return;
  }
  
  // Try python3 first, then python
  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
  
  backendProcess = spawn(pythonCmd, ['app.py'], {
    cwd: backendPath,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, FLASK_ENV: 'production', FLASK_DEBUG: '0' }
  });
  
  // Silently handle output to prevent EPIPE errors
  backendProcess.stdout.on('data', (data) => {
    // Backend output - silently handled
  });
  
  backendProcess.stderr.on('data', (data) => {
    // Backend errors - silently handled
  });
  
  backendProcess.on('error', (err) => {
    // Try alternative Python command
    if (pythonCmd === 'python3') {
      setTimeout(() => startBackendServerWithPython(), 1000);
    }
  });
  
  backendProcess.on('close', (code) => {
    if (code !== 0 && code !== null) {
      setTimeout(() => startBackendServer(), 2000);
    }
  });
}

// Fallback function to try with 'python' command
function startBackendServerWithPython() {
  let backendPath;
  if (app.isPackaged) {
    backendPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'backend');
  } else {
    backendPath = path.join(__dirname, 'backend');
  }
  
  backendProcess = spawn('python', ['app.py'], {
    cwd: backendPath,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, FLASK_ENV: 'production', FLASK_DEBUG: '0' }
  });
  
  // Silently handle output to prevent EPIPE errors
  backendProcess.stdout.on('data', (data) => {
    // Backend output - silently handled
  });
  
  backendProcess.stderr.on('data', (data) => {
    // Backend errors - silently handled
  });
  
  backendProcess.on('error', (err) => {
    // Silent error handling
  });
  
  backendProcess.on('close', (code) => {
    if (code !== 0 && code !== null) {
      setTimeout(() => startBackendServerWithPython(), 2000);
    }
  });
}

// Frontend server setup
function startFrontendServer() {
  const expressApp = express();
  
  // Serve built React app
  let buildPath;
  if (app.isPackaged) {
    buildPath = path.join(process.resourcesPath, 'app.asar', 'frontend', 'build');
  } else {
    buildPath = path.join(__dirname, 'frontend', 'build');
  }
  
  expressApp.use(express.static(buildPath));
  
  // Handle React Router - serve index.html for all routes
  expressApp.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
  
  frontendServer = expressApp.listen(3000, () => {
    // Frontend server started
  });
  
  frontendServer.on('error', (err) => {
    // Frontend server error - silently handled
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
    // icon: path.join(__dirname, 'assets', 'icon.png'), // TODO: Add icon
    title: 'Fantasy Football Draft Assistant',
    show: false // Don't show until ready
  });

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Start servers
  startBackendServer();
  
  // Wait for backend to be ready, then start frontend
  setTimeout(() => {
    checkBackendReady((isReady) => {
      if (isReady) {
        startFrontendServer();
        
        // Wait a bit for frontend to start, then load the app
        setTimeout(() => {
          mainWindow.loadURL('http://localhost:3000');
        }, 2000);
      } else {
        mainWindow.loadURL('data:text/html,<h1>Backend Failed to Start</h1><p>Please check if Python is installed.</p>');
      }
    });
  }, 2000);

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  
  // Handle navigation
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://localhost:3000') {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });
}

// App event handlers
app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

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

// Handle app quit
app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  if (frontendServer) {
    frontendServer.close();
  }
});

// Handle certificate errors (for development)
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (url.startsWith('http://localhost')) {
    // Ignore certificate errors for localhost
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});