const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const express = require('express');

let mainWindow;
let backendProcess;
let frontendServer;

// Backend server setup
function startBackendServer() {
  console.log('Starting backend server...');
  
  const backendPath = path.join(__dirname, 'backend');
  
  // Try python3 first, then python
  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
  
  backendProcess = spawn(pythonCmd, ['app.py'], {
    cwd: backendPath,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });
  
  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
  });
  
  backendProcess.on('error', (err) => {
    console.error('Backend process error:', err);
  });
  
  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });
}

// Frontend server setup
function startFrontendServer() {
  console.log('Starting frontend server...');
  
  const app = express();
  
  // Serve built React app
  const buildPath = path.join(__dirname, 'frontend', 'build');
  app.use(express.static(buildPath));
  
  // Handle React Router - serve index.html for all routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
  
  frontendServer = app.listen(3000, () => {
    console.log('Frontend server running on http://localhost:3000');
  });
  
  frontendServer.on('error', (err) => {
    console.error('Frontend server error:', err);
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
  
  // Wait for backend to start, then start frontend
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