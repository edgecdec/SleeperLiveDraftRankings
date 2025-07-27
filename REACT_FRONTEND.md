# Fantasy Football Draft Assistant - React Frontend

A modern, responsive web application for your fantasy football draft tool with real-time updates and a professional interface.

## 🎯 Features

### ✨ **Modern Interface**
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Auto-refreshes every 30 seconds
- **Live Status**: Connection indicators and countdown timers
- **Professional Styling**: Clean, modern design with Tailwind CSS

### 📊 **Draft Intelligence**
- **Position-Specific Rankings**: QB, RB, WR, TE, K sections
- **Flex Recommendations**: Best RB/WR/TE options
- **Overall Best Available**: Top players across all positions
- **Tier Visualization**: Color-coded player tiers
- **Team Information**: Player teams and positions clearly displayed

### 🔄 **Real-time Features**
- **Auto-refresh**: Updates every 30 seconds automatically
- **Manual Refresh**: Instant update button
- **Connection Status**: Visual indicators for connectivity
- **Live Countdown**: Shows time until next update
- **Draft Progress**: Tracks available vs drafted players

## 🚀 Quick Start

### **One-Command Launch**
```bash
python3 launch_app.py
```

This will:
- ✅ Check for Node.js and npm
- ✅ Install Python dependencies
- ✅ Install React dependencies
- ✅ Start Flask backend (port 5000)
- ✅ Start React frontend (port 3000)
- ✅ Open your browser automatically

### **Manual Setup** (if needed)

1. **Install Python dependencies:**
```bash
pip install -r backend/requirements.txt
```

2. **Install Node.js dependencies:**
```bash
cd frontend
npm install
```

3. **Start backend server:**
```bash
cd backend
python app.py
```

4. **Start frontend server:**
```bash
cd frontend
npm start
```

5. **Open browser:**
Navigate to `http://localhost:3000`

## 📁 Project Structure

```
SleeperLiveDraftRankings/
├── backend/                    # Flask API server
│   ├── app.py                 # Main Flask application
│   └── requirements.txt       # Python dependencies
├── frontend/                  # React application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── DraftHeader.jsx
│   │   │   ├── PlayerCard.jsx
│   │   │   └── PositionSection.jsx
│   │   ├── hooks/            # Custom React hooks
│   │   │   └── useDraftData.js
│   │   ├── App.jsx           # Main app component
│   │   ├── index.js          # React entry point
│   │   └── index.css         # Tailwind CSS styles
│   ├── public/
│   │   └── index.html        # HTML template
│   ├── package.json          # Node.js dependencies
│   └── tailwind.config.js    # Tailwind configuration
├── launch_app.py             # Application launcher
└── [existing files...]       # Your original draft tool files
```

## 🎨 Interface Overview

### **Header Section**
- **Title**: Fantasy Draft Assistant with trophy icon
- **Live Stats**: Available players and drafted count
- **Auto-refresh Timer**: Countdown to next update
- **Manual Refresh**: Instant update button
- **Last Updated**: Timestamp of last data fetch

### **Main Dashboard**
- **Best Available**: Top 10 players across all positions
- **Flex Options**: Top 10 RB/WR/TE for flex positions
- **Position Sections**: Top 5 players for each position (QB, RB, WR, TE, K)

### **Player Cards**
- **Player Name**: Full name with position badge
- **Team**: NFL team abbreviation
- **Tier**: Draft tier with color coding
- **Rank**: Overall draft ranking
- **Visual Tiers**: Color-coded left border

## 🔧 API Endpoints

The Flask backend provides these endpoints:

- **`GET /api/draft/status`** - Current draft data
- **`GET /api/draft/refresh`** - Force refresh data
- **`GET /api/settings`** - Draft configuration
- **`GET /api/health`** - Health check

## 🎯 Customization

### **Colors and Styling**
Edit `frontend/tailwind.config.js` to customize:
- Color schemes
- Animations
- Spacing
- Typography

### **Position Colors**
In `frontend/src/index.css`:
```css
.position-qb { @apply bg-red-100 text-red-800; }
.position-rb { @apply bg-green-100 text-green-800; }
.position-wr { @apply bg-blue-100 text-blue-800; }
.position-te { @apply bg-yellow-100 text-yellow-800; }
.position-k { @apply bg-purple-100 text-purple-800; }
```

### **Refresh Interval**
Change auto-refresh timing in `frontend/src/hooks/useDraftData.js`:
```javascript
const interval = setInterval(() => {
  // Change 30000 to desired milliseconds
}, 30000);
```

## 📱 Responsive Design

The interface adapts to different screen sizes:

- **Desktop**: Full 3-column layout
- **Tablet**: 2-column layout
- **Mobile**: Single column, stacked sections

## 🔄 Real-time Updates

### **Automatic Updates**
- Fetches new data every 30 seconds
- Shows countdown timer
- Maintains connection status

### **Manual Updates**
- Refresh button in header
- Instant data refresh
- Loading indicators

### **Error Handling**
- Connection error messages
- Retry functionality
- Graceful degradation

## 🚀 Building for Production

### **Create Production Build**
```bash
cd frontend
npm run build
```

### **Serve Production Build**
```bash
# Install serve globally
npm install -g serve

# Serve the build
serve -s build -l 3000
```

## 📦 Packaging as Executable

### **Option 1: PyInstaller (Recommended)**
```bash
# Install PyInstaller
pip install pyinstaller

# Create executable
pyinstaller --onefile --add-data "frontend/build:frontend/build" launch_app.py
```

### **Option 2: Electron Wrapper**
For a true desktop app experience:

1. **Install Electron**
```bash
npm install -g electron
```

2. **Create Electron main.js**
3. **Package with electron-builder**

## 🛠️ Development

### **Adding New Components**
1. Create component in `frontend/src/components/`
2. Import and use in `App.jsx`
3. Add styling in `index.css` if needed

### **Adding New API Endpoints**
1. Add route in `backend/app.py`
2. Update frontend to consume new endpoint
3. Add error handling

### **Debugging**
- **Backend**: Check Flask console output
- **Frontend**: Use browser developer tools
- **API**: Test endpoints directly at `http://localhost:5000/api/`

## 🔧 Troubleshooting

### **Common Issues**

**Port Already in Use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

**Node.js Not Found:**
- Install from https://nodejs.org/
- Restart terminal after installation

**Python Dependencies:**
```bash
pip install --upgrade pip
pip install -r backend/requirements.txt
```

**React Build Errors:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### **Performance Issues**
- Check network connectivity
- Verify Sleeper API is responding
- Reduce refresh interval if needed

## 🎯 Future Enhancements

### **Planned Features**
- **Dark Mode**: Toggle between light/dark themes
- **Player Search**: Find specific players quickly
- **Draft History**: Track previous picks
- **Export Data**: Save rankings to CSV
- **Mobile App**: React Native version
- **Push Notifications**: Draft alerts

### **Advanced Features**
- **Drag & Drop**: Reorder player preferences
- **Player Comparison**: Side-by-side stats
- **Draft Simulation**: Mock draft scenarios
- **Analytics Dashboard**: Draft performance metrics

## 📞 Support

If you encounter issues:

1. **Check the console** for error messages
2. **Verify your settings** in `EditMe.py`
3. **Test the API** directly at `http://localhost:5000/api/draft/status`
4. **Restart the application** with `python3 launch_app.py`

The React frontend provides a modern, professional interface while maintaining all the functionality of your original command-line tool!
