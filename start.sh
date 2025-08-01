#!/bin/bash

echo "========================================"
echo "🏈 Fantasy Football Draft Assistant"
echo "========================================"
echo ""

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ️${NC} $1"
}

# Function to check and install Python dependencies
check_python() {
    print_info "Checking Python installation..."
    
    # Check for python3
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2)
        print_status "Python 3 found: $PYTHON_VERSION"
        PYTHON_CMD="python3"
    elif command -v python &> /dev/null; then
        PYTHON_VERSION=$(python --version 2>&1 | cut -d' ' -f2)
        if [[ $PYTHON_VERSION == 3.* ]]; then
            print_status "Python 3 found: $PYTHON_VERSION"
            PYTHON_CMD="python"
        else
            print_error "Python 3 is required, but found Python $PYTHON_VERSION"
            print_info "Please install Python 3.7+ from https://python.org"
            exit 1
        fi
    else
        print_error "Python 3 is not installed"
        print_info "Please install Python 3.7+ from https://python.org"
        
        # Try to provide OS-specific installation help
        if [[ "$OSTYPE" == "darwin"* ]]; then
            print_info "On macOS, you can install with: brew install python3"
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            print_info "On Ubuntu/Debian: sudo apt-get install python3 python3-pip"
            print_info "On CentOS/RHEL: sudo yum install python3 python3-pip"
        fi
        exit 1
    fi
    
    # Check for pip
    if command -v pip3 &> /dev/null; then
        print_status "pip3 found"
        PIP_CMD="pip3"
    elif command -v pip &> /dev/null; then
        print_status "pip found"
        PIP_CMD="pip"
    else
        print_warning "pip not found, will try using python -m pip"
        PIP_CMD="$PYTHON_CMD -m pip"
    fi
}

# Function to check and install Node.js
check_node() {
    print_info "Checking Node.js installation..."
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js found: $NODE_VERSION"
        
        # Check if version is 16 or higher
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -lt 16 ]; then
            print_warning "Node.js $NODE_VERSION found, but version 16+ is recommended"
        fi
    else
        print_error "Node.js is not installed"
        print_info "Please install Node.js 16+ from https://nodejs.org"
        
        # Try to provide OS-specific installation help
        if [[ "$OSTYPE" == "darwin"* ]]; then
            print_info "On macOS, you can install with: brew install node"
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            print_info "On Ubuntu/Debian: curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs"
        fi
        exit 1
    fi
    
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_status "npm found: $NPM_VERSION"
    else
        print_error "npm is not installed (should come with Node.js)"
        print_info "Please reinstall Node.js from https://nodejs.org"
        exit 1
    fi
}

# Function to install Python dependencies
install_python_deps() {
    print_info "Installing Python dependencies..."
    
    # Try to install in user space first, then fallback to system
    if $PIP_CMD install --user -r requirements.txt; then
        print_status "Python dependencies installed successfully"
    elif $PIP_CMD install -r requirements.txt; then
        print_status "Python dependencies installed successfully"
    else
        print_error "Failed to install Python dependencies"
        print_info "You may need to run: $PIP_CMD install --upgrade pip"
        print_info "Or try: $PYTHON_CMD -m pip install --user -r requirements.txt"
        exit 1
    fi
}

# Function to install Node.js dependencies
install_node_deps() {
    print_info "Installing Node.js dependencies..."
    
    # Clear npm cache if node_modules exists but is corrupted
    if [ -d "node_modules" ] && [ ! -f "node_modules/.package-lock.json" ]; then
        print_warning "Clearing potentially corrupted node_modules..."
        rm -rf node_modules package-lock.json
    fi
    
    if npm install; then
        print_status "Node.js dependencies installed successfully"
    else
        print_error "Failed to install Node.js dependencies"
        print_info "Trying to clear npm cache and retry..."
        npm cache clean --force
        rm -rf node_modules package-lock.json
        
        if npm install; then
            print_status "Node.js dependencies installed successfully after cache clear"
        else
            print_error "Still failed to install Node.js dependencies"
            print_info "You may need to update npm: npm install -g npm@latest"
            exit 1
        fi
    fi
}

# Function to cleanup background processes
cleanup() {
    echo ""
    print_info "Shutting down servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup INT TERM

# Main execution
echo "🔍 Checking system dependencies..."
check_python
check_node

echo ""
echo "🚀 Starting backend server..."
cd src/backend

# Check if requirements.txt exists
if [ ! -f "requirements.txt" ]; then
    print_error "requirements.txt not found in src/backend/"
    exit 1
fi

install_python_deps

print_info "Starting Flask server on port 5001..."
$PYTHON_CMD app.py &
BACKEND_PID=$!

# Give backend a moment to start
sleep 2

echo ""
echo "🌐 Starting frontend..."
cd ../frontend

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found in src/frontend/"
    kill $BACKEND_PID
    exit 1
fi

install_node_deps

echo ""
echo "========================================"
echo "🎉 SETUP COMPLETE!"
echo "========================================"
echo "Backend:  http://localhost:5001"
echo "Frontend: http://localhost:3000"
echo ""
echo "The app will open in your browser shortly..."
echo "Press Ctrl+C to stop both servers"
echo "========================================"

# Start the React development server
npm start