# 🏈 Fantasy Football Draft Assistant

A real-time draft tool that helps you make better picks during your fantasy football draft by providing live player rankings, tier analysis, and custom rankings support.

## 🚀 Quick Start - Download & Run

### Option 1: One-Click Download (Recommended)

**📥 [Download Latest Release](https://github.com/edgecdec/SleeperLiveDraftRankings/releases/latest)**

1. Download the ZIP file
2. Extract to your desired location
3. **Windows**: Double-click `start.bat`
4. **Mac/Linux**: Double-click `start.sh`
5. Open http://localhost:3000 in your browser

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

**Not sure if you have these?** Run the dependency checker:
- **Windows**: Double-click `check_dependencies.bat`
- **Mac/Linux**: Run `./check_dependencies.sh`

## ✨ What's Included in the Download

- ✅ **Complete application** - Backend + Frontend
- ✅ **Start scripts** - One-click setup for Windows/Mac/Linux
- ✅ **Dependency checker** - Verify your system is ready
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

### Testing
```bash
cd backend
python test_integration.py
```

## 📚 Documentation

- **[docs/RELEASE_README.md](./docs/RELEASE_README.md)** - Complete user guide for the release package
- **[docs/TECHNICAL_DOCUMENTATION.md](./docs/TECHNICAL_DOCUMENTATION.md)** - Detailed technical documentation
- **[docs/DOCUMENTATION_INDEX.md](./docs/DOCUMENTATION_INDEX.md)** - Navigation guide for all documentation
- **[backend/API_README.md](./backend/API_README.md)** - API documentation and reference
- **[backend/UPLOAD_FEATURES_README.md](./backend/UPLOAD_FEATURES_README.md)** - Custom rankings and mock draft features

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