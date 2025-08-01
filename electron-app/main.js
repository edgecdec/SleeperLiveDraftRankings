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