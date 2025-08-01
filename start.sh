#!/bin/bash

echo "========================================"
echo "Fantasy Football Draft Assistant"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3 from https://python.org"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

echo "Starting backend server..."
cd backend

echo "Installing Python dependencies..."
python3 -m pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install Python dependencies"
    echo "Please make sure Python 3 and pip are installed"
    exit 1
fi

echo "Starting Flask server on port 5001..."
python3 app.py &
BACKEND_PID=$!

echo ""
echo "Starting frontend..."
cd ../frontend

echo "Installing Node.js dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install Node.js dependencies"
    echo "Please make sure Node.js and npm are installed"
    kill $BACKEND_PID
    exit 1
fi

echo "Starting React development server..."
echo ""
echo "========================================"
echo "SETUP COMPLETE!"
echo "========================================"
echo "Backend: http://localhost:5001"
echo "Frontend: http://localhost:3000"
echo ""
echo "The app will open in your browser shortly..."
echo "Press Ctrl+C to stop both servers"
echo "========================================"

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup INT TERM

npm start
