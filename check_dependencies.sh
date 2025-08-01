#!/bin/bash

echo "========================================"
echo "🔍 Fantasy Football Draft Assistant"
echo "    Dependency Checker"
echo "========================================"
echo ""

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

# Function to print colored output
print_pass() {
    echo -e "${GREEN}✅${NC} $1"
    ((PASSED++))
}

print_fail() {
    echo -e "${RED}❌${NC} $1"
    ((FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ️${NC} $1"
}

echo "Checking system dependencies..."
echo ""

# Check Python
print_info "Checking Python installation..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2)
    print_pass "Python 3: $PYTHON_VERSION"
    
    # Check Python version (need 3.7+)
    PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d'.' -f1)
    PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d'.' -f2)
    if [ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -ge 7 ]; then
        print_pass "Python version is 3.7+ ✓"
    else
        print_warning "Python $PYTHON_VERSION found, but 3.7+ is recommended"
    fi
elif command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version 2>&1 | cut -d' ' -f2)
    if [[ $PYTHON_VERSION == 3.* ]]; then
        print_pass "Python 3: $PYTHON_VERSION"
    else
        print_fail "Python 3: Found Python $PYTHON_VERSION, but need Python 3.7+"
        print_info "Install from: https://python.org"
    fi
else
    print_fail "Python 3: Not found"
    print_info "Install from: https://python.org"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        print_info "macOS: brew install python3"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        print_info "Ubuntu/Debian: sudo apt-get install python3 python3-pip"
        print_info "CentOS/RHEL: sudo yum install python3 python3-pip"
    fi
fi

# Check pip
if command -v pip3 &> /dev/null; then
    PIP_VERSION=$(pip3 --version | cut -d' ' -f2)
    print_pass "pip3: $PIP_VERSION"
elif command -v pip &> /dev/null; then
    PIP_VERSION=$(pip --version | cut -d' ' -f2)
    print_pass "pip: $PIP_VERSION"
else
    print_fail "pip: Not found"
    print_info "Usually comes with Python - try reinstalling Python"
fi

echo ""

# Check Node.js
print_info "Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_pass "Node.js: $NODE_VERSION"
    
    # Check Node version (need 16+)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 16 ]; then
        print_pass "Node.js version is 16+ ✓"
    else
        print_warning "Node.js $NODE_VERSION found, but 16+ is recommended"
    fi
else
    print_fail "Node.js: Not found"
    print_info "Install from: https://nodejs.org"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        print_info "macOS: brew install node"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        print_info "Ubuntu/Debian: curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs"
    fi
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_pass "npm: $NPM_VERSION"
else
    print_fail "npm: Not found"
    print_info "Should come with Node.js - try reinstalling Node.js"
fi

echo ""

# Check for project files
print_info "Checking project structure..."
if [ -f "src/backend/requirements.txt" ]; then
    print_pass "Backend requirements.txt found"
else
    print_fail "Backend requirements.txt not found"
    print_info "Make sure you're running this from the project root directory"
fi

if [ -f "src/frontend/package.json" ]; then
    print_pass "Frontend package.json found"
else
    print_fail "Frontend package.json not found"
    print_info "Make sure you're running this from the project root directory"
fi

echo ""
echo "========================================"
echo "📊 DEPENDENCY CHECK SUMMARY"
echo "========================================"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All dependencies are ready!${NC}"
    echo ""
    echo "You can now run the application with:"
    echo "  • Windows: start.bat"
    echo "  • Mac: start.command (or ./start.sh)"
    echo "  • Linux: ./start.sh"
else
    echo -e "${RED}⚠️ $FAILED dependencies need attention${NC}"
    echo -e "${GREEN}✅ $PASSED dependencies are ready${NC}"
    echo ""
    echo "Please install the missing dependencies above, then run this check again."
fi

echo "========================================"