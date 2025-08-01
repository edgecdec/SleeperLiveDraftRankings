# 🏈 Fantasy Football Draft Assistant

A real-time draft tool that helps you make better picks during your fantasy football draft by providing live player rankings, tier analysis, and custom rankings support.

## 🚀 Quick Start

### Option 1: One-Click Start (Recommended)

**Windows:**
1. Double-click `start.bat`
2. Wait for both servers to start
3. Open http://localhost:3000 in your browser

**Mac/Linux:**
1. Double-click `start.sh` (or run `./start.sh` in terminal)
2. Wait for both servers to start  
3. Open http://localhost:3000 in your browser

### Option 2: Manual Start

**Backend (Terminal 1):**
```bash
cd backend
pip install -r requirements.txt
python app.py
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm install
npm start
```

## 📋 Prerequisites

- **Python 3.7+** - [Download here](https://python.org)
- **Node.js 16+** - [Download here](https://nodejs.org)
- **Internet connection** - For fetching live draft data

## ✨ Features

### 🎯 **Live Draft Tracking**
- Real-time sync with Sleeper drafts
- Automatic player removal as they're drafted
- Live draft status and pick tracking

### 📊 **Smart Rankings**
- **FantasyPros Integration** - Official expert rankings
- **Custom Rankings Upload** - Upload your own CSV rankings
- **Tier-based Analysis** - Visual tier groupings
- **Value Column Support** - See projected player values

### 🎨 **Advanced UI**
- **Position-based Filtering** - Focus on specific positions
- **Drag & Drop Interface** - Reorder your preferences
- **Dark/Light Mode** - Comfortable viewing
- **Responsive Design** - Works on all screen sizes

### 🔧 **Customization**
- **Multiple Scoring Formats** - PPR, Half-PPR, Standard
- **League Types** - Standard, Superflex, Dynasty
- **Custom Rankings Manager** - Upload and manage your own rankings
- **Flexible CSV Support** - Multiple column name formats

## 📁 Custom Rankings Format

Upload CSV files with these columns:

**Required:**
- `name` - Player name
- `position` - QB, RB, WR, TE, K, DST

**Optional:**
- `rank` - Overall ranking
- `tier` - Tier grouping (1-10)
- `team` - NFL team abbreviation
- `value` - Projected value/price

**Example CSV:**
```csv
name,position,rank,tier,team,value
Josh Allen,QB,1,1,BUF,25.5
Christian McCaffrey,RB,2,1,SF,24.8
Cooper Kupp,WR,3,1,LAR,23.2
Travis Kelce,TE,4,1,KC,18.7
```

## 🔗 Getting Started

1. **Start the application** using one of the methods above
2. **Enter your Sleeper username** on the setup page
3. **Select your league and draft** from the dropdown
4. **Choose your rankings** (FantasyPros or upload custom)
5. **Start drafting!** The tool will track picks in real-time

## 🛠️ Troubleshooting

### Common Issues:

**"Connection refused" errors:**
- Make sure both backend (port 5001) and frontend (port 3000) are running
- Check that no other applications are using these ports

**"Failed to fetch user leagues":**
- Verify your Sleeper username is correct
- Ensure you have active leagues for the current season
- Check your internet connection

**Custom rankings not showing:**
- Verify your CSV has the required columns (`name`, `position`)
- Check file size is under 5MB
- Ensure the file is properly formatted CSV

**Python/Node.js not found:**
- Install Python 3.7+ from https://python.org
- Install Node.js 16+ from https://nodejs.org
- Restart your terminal/command prompt after installation

### Getting Help:

1. Check the browser console (F12) for error messages
2. Look at the backend terminal for server logs
3. Verify all dependencies are installed correctly

## 🏗️ Architecture

- **Backend**: Python Flask server (port 5001)
- **Frontend**: React application (port 3000)
- **Data**: Sleeper API integration + FantasyPros rankings
- **Storage**: Local file system for custom rankings

## 📝 Notes

- The tool works with **Sleeper leagues only**
- Rankings update automatically during drafts
- Custom rankings are stored locally in `backend/rankings/Custom/`
- All data is processed locally - no external data storage

## 🎉 Enjoy Your Draft!

This tool is designed to give you an edge in your fantasy football draft. Good luck and may the best picks win! 🏆

---

*For technical support or feature requests, please check the GitHub repository.*
