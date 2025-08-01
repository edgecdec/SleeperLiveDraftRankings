# 🏈 Fantasy Football Draft Assistant

A real-time draft tool that helps you make better picks during your fantasy football draft by providing live player rankings, tier analysis, and custom rankings support.

## 🚀 Quick Start - Download & Run

### Option 1: One-Click Download (Recommended)

**📥 [Download Latest Release](https://github.com/edgecdec/SleeperLiveDraftRankings/releases/latest)**

1. Download the ZIP file
2. Extract to your desired location
3. **Windows**: Double-click `start.bat`
4. **Mac**: Double-click `start.command` (or run `./start.sh` in Terminal)
5. **Linux**: Run `./start.sh` in Terminal
6. Open http://localhost:3000 in your browser

### Option 2: Try Online (No Download Required)

[![Open in Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/edgecdec/SleeperLiveDraftRankings)

### Option 3: Clone & Build

```bash
git clone https://github.com/edgecdec/SleeperLiveDraftRankings.git
cd SleeperLiveDraftRankings
./start.sh  # Mac/Linux
# or
start.bat   # Windows
```

## 📋 System Requirements

- **Python 3.7+** - [Download](https://python.org)
- **Node.js 16+** - [Download](https://nodejs.org)
- **Internet connection** - For live draft data

**Not sure if you have these?** Run the enhanced dependency checker:
- **Windows**: Double-click `check_dependencies.bat`
- **Mac**: Double-click `check_dependencies.command` (or run `./check_dependencies.sh` in Terminal)
- **Linux**: Run `./check_dependencies.sh` in Terminal

The dependency checker will:
- ✅ Verify all required software is installed
- ⚠️ Show version warnings if updates are recommended
- 🔧 Provide installation instructions for missing dependencies
- 📊 Give you a clear summary of what's ready

## ✨ What's Included in the Download

- ✅ **Complete application** - Backend + Frontend
- ✅ **Smart start scripts** - One-click setup with automatic dependency installation
- ✅ **Enhanced dependency checker** - Verify your system is ready with detailed feedback
- ✅ **Sample rankings** - Example CSV files to get started
- ✅ **Full documentation** - Setup guide and troubleshooting

## 🎯 Features

### 🏈 **Live Draft Integration**
- Real-time sync with Sleeper drafts
- Automatic player updates as picks are made
- Multi-league and mock draft support

### 📊 **Smart Rankings**
- **FantasyPros Integration** - Expert consensus rankings
- **Custom Rankings Upload** - Use your own CSV files
- **Value Column Support** - See projected player values
- **Tier Analysis** - Visual tier groupings

### 🎨 **Advanced Interface**
- **Position Filtering** - Focus on QB, RB, WR, TE
- **Drag & Drop** - Reorder your preferences
- **Dark/Light Mode** - Comfortable viewing
- **Responsive Design** - Works on all devices

### 🔧 **Customization**
- **Multiple Scoring Formats** - PPR, Half-PPR, Standard
- **League Types** - Standard, Superflex, Dynasty
- **Custom Rankings Manager** - Upload and manage your own rankings
- **Flexible CSV Support** - Multiple column name formats

## 🔧 Quick Setup Guide

1. **Download** the latest release ZIP file
2. **Extract** to any folder on your computer
3. **Run** the start script for your operating system
4. **Wait** for both servers to start (30-60 seconds)
5. **Open** http://localhost:3000 in your browser
6. **Enter** your Sleeper username to get started

That's it! The tool will guide you through selecting your league and draft.

## 📁 Custom Rankings Format

Upload CSV files with player rankings:

```csv
name,position,rank,tier,team,value
Josh Allen,QB,1,1,BUF,25.5
Christian McCaffrey,RB,2,1,SF,24.8
Cooper Kupp,WR,3,1,LAR,23.2
Travis Kelce,TE,4,1,KC,18.7
```

**Required columns:** `name`, `position`  
**Optional columns:** `rank`, `tier`, `team`, `value`

## 🏗️ Architecture

- **Backend**: Python Flask server (port 5001)
- **Frontend**: React application (port 3000)
- **Data**: Sleeper API integration + FantasyPros rankings
- **Storage**: Local file system for custom rankings

## 🛠️ Development Setup

### Manual Installation

**Backend (Terminal 1):**
```bash
cd src/backend
pip install -r requirements.txt
python app.py
```

**Frontend (Terminal 2):**
```bash
cd src/frontend
npm install
npm start
```

### Testing
```bash
cd test
python test_dst_roster.py
```

## 📚 Documentation

- **[doc/RELEASE_README.md](./doc/RELEASE_README.md)** - Complete user guide for the release package
- **[doc/TECHNICAL_DOCUMENTATION.md](./doc/TECHNICAL_DOCUMENTATION.md)** - Detailed technical documentation
- **[doc/DOCUMENTATION_INDEX.md](./doc/DOCUMENTATION_INDEX.md)** - Navigation guide for all documentation
- **[src/backend/API_README.md](./src/backend/API_README.md)** - API documentation and reference
- **[src/backend/UPLOAD_FEATURES_README.md](./src/backend/UPLOAD_FEATURES_README.md)** - Custom rankings and mock draft features

## 🆘 Need Help?

**Common Issues:**
- **"Connection refused"** → Make sure both servers are running
- **"Python not found"** → Install Python 3.7+ from python.org
- **"Node not found"** → Install Node.js 16+ from nodejs.org

**Still stuck?** Check the included documentation for detailed troubleshooting.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Sleeper API** - For providing excellent fantasy football data
- **FantasyPros** - For expert consensus rankings
- **React & Flask** - For the excellent development frameworks

---

*Built for Sleeper fantasy football leagues. Works with standard, PPR, superflex, and dynasty formats.*

**🎯 Ready to dominate your draft with real-time rankings and smart analysis!**