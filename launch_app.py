#!/usr/bin/env python3
"""
Fantasy Football Draft Assistant Launcher
Starts both the Flask backend and React frontend
"""

import subprocess
import sys
import os
import time
import webbrowser
import threading
from pathlib import Path

def check_node_installed():
    """Check if Node.js is installed"""
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Node.js found: {result.stdout.strip()}")
            return True
    except FileNotFoundError:
        pass
    
    print("❌ Node.js not found. Please install Node.js from https://nodejs.org/")
    return False

def check_npm_installed():
    """Check if npm is installed"""
    try:
        result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ npm found: {result.stdout.strip()}")
            return True
    except FileNotFoundError:
        pass
    
    print("❌ npm not found. Please install Node.js which includes npm.")
    return False

def install_python_dependencies():
    """Install Python dependencies"""
    print("📦 Installing Python dependencies...")
    try:
        subprocess.run([
            sys.executable, '-m', 'pip', 'install', '-r', 'backend/requirements.txt'
        ], check=True)
        print("✅ Python dependencies installed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install Python dependencies: {e}")
        return False

def install_node_dependencies():
    """Install Node.js dependencies"""
    print("📦 Installing Node.js dependencies...")
    frontend_dir = Path('frontend')
    
    if not frontend_dir.exists():
        print("❌ Frontend directory not found")
        return False
    
    try:
        subprocess.run(['npm', 'install'], cwd=frontend_dir, check=True)
        print("✅ Node.js dependencies installed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install Node.js dependencies: {e}")
        return False

def start_backend():
    """Start the Flask backend server"""
    print("🚀 Starting Flask backend server...")
    try:
        # Change to backend directory and start the server
        env = os.environ.copy()
        env['FLASK_ENV'] = 'development'
        
        process = subprocess.Popen([
            sys.executable, 'app.py'
        ], cwd='backend', env=env)
        
        return process
    except Exception as e:
        print(f"❌ Failed to start backend: {e}")
        return None

def start_frontend():
    """Start the React frontend development server"""
    print("🚀 Starting React frontend server...")
    try:
        process = subprocess.Popen([
            'npm', 'start'
        ], cwd='frontend')
        
        return process
    except Exception as e:
        print(f"❌ Failed to start frontend: {e}")
        return None

def open_browser():
    """Open the application in the default browser"""
    print("🌐 Opening application in browser...")
    time.sleep(3)  # Wait for servers to start
    webbrowser.open('http://localhost:3000')

def main():
    print("🏈 Fantasy Football Draft Assistant")
    print("=" * 50)
    
    # Check prerequisites
    if not check_node_installed() or not check_npm_installed():
        print("\n💡 Please install Node.js and try again.")
        sys.exit(1)
    
    # Install dependencies
    if not install_python_dependencies():
        sys.exit(1)
    
    if not install_node_dependencies():
        sys.exit(1)
    
    print("\n🚀 Starting application servers...")
    
    # Start backend server
    backend_process = start_backend()
    if not backend_process:
        sys.exit(1)
    
    # Wait a moment for backend to start
    time.sleep(2)
    
    # Start frontend server
    frontend_process = start_frontend()
    if not frontend_process:
        backend_process.terminate()
        sys.exit(1)
    
    # Open browser in a separate thread
    browser_thread = threading.Thread(target=open_browser)
    browser_thread.daemon = True
    browser_thread.start()
    
    print("\n✅ Application started successfully!")
    print("📊 Backend API: http://localhost:5001")
    print("🎨 Frontend UI: http://localhost:3000")
    print("\n💡 The application will open in your browser automatically.")
    print("⏹️  Press Ctrl+C to stop both servers")
    
    try:
        # Wait for processes to complete
        while True:
            time.sleep(1)
            
            # Check if processes are still running
            if backend_process.poll() is not None:
                print("❌ Backend server stopped unexpectedly")
                break
            
            if frontend_process.poll() is not None:
                print("❌ Frontend server stopped unexpectedly")
                break
                
    except KeyboardInterrupt:
        print("\n🛑 Shutting down servers...")
        
        # Terminate processes
        if backend_process:
            backend_process.terminate()
        if frontend_process:
            frontend_process.terminate()
        
        # Wait for processes to finish
        if backend_process:
            backend_process.wait()
        if frontend_process:
            frontend_process.wait()
        
        print("✅ Servers stopped successfully")

if __name__ == "__main__":
    main()
