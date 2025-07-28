#!/usr/bin/env python3
"""
Launch script for the integrated Fantasy Football application
Features:
1. Automatic FantasyPros rankings updates on startup
2. League format detection
3. Manual override functionality
4. Real-time status monitoring
"""

import os
import sys
import time
import subprocess
import threading
from datetime import datetime

def print_banner():
    """Print application banner"""
    banner = """
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║        🏈 Enhanced Fantasy Football Live Draft Rankings      ║
    ║                                                              ║
    ║  Features:                                                   ║
    ║  • Automatic FantasyPros rankings updates                    ║
    ║  • League format detection (PPR, Half PPR, Standard)        ║
    ║  • Superflex vs Standard league support                      ║
    ║  • Manual override dropdown functionality                    ║
    ║  • Real-time Sleeper draft integration                       ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
    """
    print(banner)

def check_dependencies():
    """Check if required dependencies are installed"""
    print("🔍 Checking dependencies...")
    
    required_packages = [
        'flask',
        'flask-cors',
        'pandas',
        'requests',
        'selenium'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"  ✅ {package}")
        except ImportError:
            missing_packages.append(package)
            print(f"  ❌ {package}")
    
    if missing_packages:
        print(f"\n⚠️  Missing packages: {', '.join(missing_packages)}")
        print("Install them with: pip install " + " ".join(missing_packages))
        return False
    
    print("✅ All dependencies satisfied")
    return True

def check_chromedriver():
    """Check if ChromeDriver is available"""
    print("🔍 Checking ChromeDriver...")
    
    try:
        result = subprocess.run(['chromedriver', '--version'], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print(f"  ✅ ChromeDriver found: {result.stdout.strip()}")
            return True
    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass
    
    print("  ❌ ChromeDriver not found")
    print("  Install with: brew install chromedriver (macOS) or download from https://chromedriver.chromium.org/")
    return False

def start_backend():
    """Start the Flask backend server"""
    print("🚀 Starting backend server...")
    
    backend_path = os.path.join(os.path.dirname(__file__), 'backend')
    app_file = os.path.join(backend_path, 'app.py')
    
    if not os.path.exists(app_file):
        print(f"❌ Backend app not found: {app_file}")
        return None
    
    try:
        # Start Flask app
        process = subprocess.Popen([
            sys.executable, app_file
        ], cwd=backend_path)
        
        print(f"✅ Backend started (PID: {process.pid})")
        return process
    
    except Exception as e:
        print(f"❌ Failed to start backend: {e}")
        return None

def start_frontend():
    """Start the React frontend server"""
    print("🌐 Starting frontend server...")
    
    frontend_path = os.path.join(os.path.dirname(__file__), 'frontend')
    
    if not os.path.exists(frontend_path):
        print(f"❌ Frontend directory not found: {frontend_path}")
        return None
    
    try:
        # Check if node_modules exists
        node_modules = os.path.join(frontend_path, 'node_modules')
        if not os.path.exists(node_modules):
            print("📦 Installing frontend dependencies...")
            subprocess.run(['npm', 'install'], cwd=frontend_path, check=True)
        
        # Start React app
        process = subprocess.Popen([
            'npm', 'start'
        ], cwd=frontend_path)
        
        print(f"✅ Frontend started (PID: {process.pid})")
        return process
    
    except Exception as e:
        print(f"❌ Failed to start frontend: {e}")
        return None

def wait_for_backend(max_wait=30):
    """Wait for backend to be ready"""
    print("⏳ Waiting for backend to be ready...")
    
    import requests
    
    for i in range(max_wait):
        try:
            response = requests.get('http://localhost:5000/api/health', timeout=2)
            if response.status_code == 200:
                print("✅ Backend is ready!")
                return True
        except:
            pass
        
        time.sleep(1)
        if i % 5 == 0:
            print(f"  Still waiting... ({i}/{max_wait}s)")
    
    print("❌ Backend failed to start within timeout")
    return False

def show_status():
    """Show application status and URLs"""
    print("\n" + "="*60)
    print("🎉 Application is running!")
    print("="*60)
    print("📊 Backend API: http://localhost:5000")
    print("🌐 Frontend UI: http://localhost:3000")
    print("📋 Rankings Manager: http://localhost:3000/rankings")
    print("="*60)
    print("\n🔧 Available API Endpoints:")
    print("  • GET  /api/health - Health check")
    print("  • GET  /api/rankings/status - Rankings update status")
    print("  • POST /api/rankings/update - Trigger rankings update")
    print("  • GET  /api/rankings/formats - Available formats")
    print("  • POST /api/league/detect - Auto-detect league format")
    print("  • POST /api/league/override - Manual format override")
    print("  • GET  /api/rankings - Get current rankings")
    print("="*60)

def main():
    """Main application launcher"""
    print_banner()
    
    # Check dependencies
    if not check_dependencies():
        print("\n❌ Please install missing dependencies and try again")
        return 1
    
    # Check ChromeDriver (optional but recommended)
    chromedriver_available = check_chromedriver()
    if not chromedriver_available:
        print("⚠️  ChromeDriver not found - rankings updates may not work")
        response = input("Continue anyway? (y/N): ")
        if response.lower() != 'y':
            return 1
    
    print("\n🚀 Starting application...")
    
    # Start backend
    backend_process = start_backend()
    if not backend_process:
        return 1
    
    # Wait for backend to be ready
    if not wait_for_backend():
        backend_process.terminate()
        return 1
    
    # Start frontend
    frontend_process = start_frontend()
    
    # Show status
    show_status()
    
    try:
        print("\n⌨️  Press Ctrl+C to stop the application")
        
        # Keep running until interrupted
        while True:
            time.sleep(1)
            
            # Check if processes are still running
            if backend_process.poll() is not None:
                print("❌ Backend process died")
                break
            
            if frontend_process and frontend_process.poll() is not None:
                print("❌ Frontend process died")
                break
    
    except KeyboardInterrupt:
        print("\n🛑 Shutting down application...")
    
    finally:
        # Clean up processes
        if backend_process:
            backend_process.terminate()
            print("✅ Backend stopped")
        
        if frontend_process:
            frontend_process.terminate()
            print("✅ Frontend stopped")
    
    print("👋 Application stopped")
    return 0

if __name__ == "__main__":
    sys.exit(main())
