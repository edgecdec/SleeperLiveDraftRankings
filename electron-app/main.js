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
    console.error('Backend failed to start after 60 seconds');
    callback(false);
    return;
  }
  
  // Try a simple connection first, then the health endpoint
  const testUrl = attempts < 10 ? 'http://localhost:5001/' : 'http://localhost:5001/api/health';
  
  const req = http.get(testUrl, (res) => {
    console.log(`Backend is responding! (status: ${res.statusCode})`);
    callback(true);
  });
  
  req.on('error', (err) => {
    if (attempts % 5 === 0) { // Log every 5th attempt to reduce noise
      console.log(`Backend not ready yet (attempt ${attempts + 1}/${maxAttempts})...`);
    }
    setTimeout(() => checkBackendReady(callback, attempts + 1), 1000);
  });
  
  req.setTimeout(2000, () => {
    req.destroy();
    setTimeout(() => checkBackendReady(callback, attempts + 1), 1000);
  });
}

// Backend server setup
function startBackendServer() {
  console.log('Starting backend server...');
  
  // In packaged app, backend is in app.asar.unpacked
  // In development, it's in the regular backend directory
  let backendPath;
  if (app.isPackaged) {
    backendPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'backend');
  } else {
    backendPath = path.join(__dirname, 'backend');
  }
  
  console.log('Backend path:', backendPath);
  console.log('App is packaged:', app.isPackaged);
  console.log('Process resources path:', process.resourcesPath);
  
  // Check if backend directory exists
  const fs = require('fs');
  if (!fs.existsSync(backendPath)) {
    console.error('Backend directory does not exist:', backendPath);
    return;
  }
  
  // Check if app.py exists
  const appPyPath = path.join(backendPath, 'app.py');
  if (!fs.existsSync(appPyPath)) {
    console.error('app.py does not exist:', appPyPath);
    return;
  }
  
  console.log('Backend files verified, starting Python process...');
  
  // Try python3 first, then python
  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
  console.log('Using Python command:', pythonCmd);
  
  backendProcess = spawn(pythonCmd, ['app.py'], {
    cwd: backendPath,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, FLASK_ENV: 'production' }
  });
  
  backendProcess.stdout.on('data', (data) => {
    try {
      console.log(`Backend: ${data.toString().trim()}`);
    } catch (err) {
      // Ignore write errors to prevent EPIPE
    }
  });
  
  backendProcess.stderr.on('data', (data) => {
    try {
      console.error(`Backend Error: ${data.toString().trim()}`);
    } catch (err) {
      // Ignore write errors to prevent EPIPE
    }
  });
  
  backendProcess.on('error', (err) => {
    console.error('Backend process error:', err);
    // Try alternative Python command
    if (pythonCmd === 'python3') {
      console.log('Trying with python command...');
      setTimeout(() => startBackendServerWithPython(), 1000);
    }
  });
  
  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
    if (code !== 0 && code !== null) {
      console.log('Backend crashed, attempting restart...');
      setTimeout(() => startBackendServer(), 2000);
    }
  });
  
  // Give backend time to start
  setTimeout(() => {
    console.log('Backend should be ready now');
  }, 3000);
}

// Fallback function to try with 'python' command
function startBackendServerWithPython() {
  let backendPath;
  if (app.isPackaged) {
    backendPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'backend');
  } else {
    backendPath = path.join(__dirname, 'backend');
  }
  
  console.log('Starting backend with python fallback...');
  
  backendProcess = spawn('python', ['app.py'], {
    cwd: backendPath,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, FLASK_ENV: 'production' }
  });
  
  backendProcess.stdout.on('data', (data) => {
    try {
      console.log(`Backend: ${data.toString().trim()}`);
    } catch (err) {
      // Ignore write errors to prevent EPIPE
    }
  });
  
  backendProcess.stderr.on('data', (data) => {
    try {
      console.error(`Backend Error: ${data.toString().trim()}`);
    } catch (err) {
      // Ignore write errors to prevent EPIPE
    }
  });
  
  backendProcess.on('error', (err) => {
    console.error('Backend process error (python fallback):', err);
  });
  
  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
    if (code !== 0 && code !== null) {
      console.log('Backend fallback crashed, attempting restart...');
      setTimeout(() => startBackendServerWithPython(), 2000);
    }
  });
}

// Frontend server setup
function startFrontendServer() {
  console.log('Starting frontend server...');
  
  const expressApp = express();
  
  // Serve built React app
  let buildPath;
  if (app.isPackaged) {
    buildPath = path.join(process.resourcesPath, 'app.asar', 'frontend', 'build');
  } else {
    buildPath = path.join(__dirname, 'frontend', 'build');
  }
  
  console.log('Frontend build path:', buildPath);
  
  expressApp.use(express.static(buildPath));
  
  // Handle React Router - serve index.html for all routes
  expressApp.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
  
  frontendServer = expressApp.listen(3000, () => {
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
  
  // Wait for backend to be ready, then start frontend
  setTimeout(() => {
    checkBackendReady((isReady) => {
      if (isReady) {
        startFrontendServer();
        
        // Wait a bit for frontend to start, then load the app
        setTimeout(() => {
          console.log('Loading application in browser window...');
          mainWindow.loadURL('http://localhost:3000');
        }, 2000);
      } else {
        console.error('Backend failed to start, showing error page');
        mainWindow.loadURL('data:text/html,<h1>Backend Failed to Start</h1><p>Please check the console for errors.</p>');
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