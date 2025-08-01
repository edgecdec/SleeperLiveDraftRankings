@echo off
echo ========================================
echo Fantasy Football Draft Assistant
echo ========================================
echo.
echo Starting backend server...
cd backend
echo Installing Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Python dependencies
    echo Please make sure Python and pip are installed
    pause
    exit /b 1
)

echo Starting Flask server on port 5001...
start "Backend Server" python app.py

echo.
echo Starting frontend...
cd ../frontend
echo Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Node.js dependencies
    echo Please make sure Node.js and npm are installed
    pause
    exit /b 1
)

echo Starting React development server...
echo.
echo ========================================
echo SETUP COMPLETE!
echo ========================================
echo Backend: http://localhost:5001
echo Frontend: http://localhost:3000
echo.
echo The app will open in your browser shortly...
echo Press Ctrl+C in both windows to stop the servers
echo ========================================
call npm start
