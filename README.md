# 🏈 Fantasy Football Draft Assistant

A real-time draft tool that helps you make better picks during your fantasy football draft by providing live player rankings, tier analysis, and custom rankings support.

## 🚀 Installation Options - Choose What Works for You!

### **🖥️ Option 1: Desktop App (Recommended)**

**Best for**: Most users who want the easiest experience

**[📥 Download Desktop Apps](https://github.com/edgecdec/SleeperLiveDraftRankings/releases/latest)**

- **Windows**: Download `Fantasy Football Draft Assistant Setup 1.0.0.exe` → Run installer → Launch from desktop
- **macOS**: Download `Fantasy Football Draft Assistant-1.0.0.dmg` → Open → Drag to Applications → Launch
- **Linux**: Download `Fantasy Football Draft Assistant-1.0.0.AppImage` → Make executable → Run

**Features**: ✅ No dependencies ✅ Desktop shortcuts ✅ One-click install ✅ Native feel

---

### **🐳 Option 2: Docker (Super Easy)**

**Best for**: Users comfortable with Docker, or those wanting isolated installation

**Prerequisites**: [Docker Desktop](https://www.docker.com/products/docker-desktop/)

**One-Line Install**:
```bash
curl -sSL https://raw.githubusercontent.com/edgecdec/SleeperLiveDraftRankings/main/docker-install.sh | bash
```

**Or with docker-compose**:
```bash
git clone https://github.com/edgecdec/SleeperLiveDraftRankings.git
cd SleeperLiveDraftRankings
docker-compose up
```

**Features**: ✅ Zero setup ✅ Isolated environment ✅ Easy updates ✅ Cross-platform

---

### **💻 Option 3: Enhanced Traditional Setup**

**Best for**: Developers or users who want full control

#### **📥 Quick Start**

**[📥 Download Latest Release](https://github.com/edgecdec/SleeperLiveDraftRankings/releases/latest)**

1. **Download** the ZIP file
2. **Extract** to your desired location
3. **Check dependencies** (optional but recommended):
   - **Windows**: Double-click `check_dependencies.bat`
   - **Mac**: Double-click `check_dependencies.command`
   - **Linux**: Run `./check_dependencies.sh`
4. **Start application**:
   - **Windows**: Double-click `start.bat`
   - **Mac**: Double-click `start.command`
   - **Linux**: Run `./start.sh`
5. **Open** http://localhost:3000 in your browser

#### **📋 System Requirements**
- **Python 3.7+** - [Download](https://python.org)
- **Node.js 16+** - [Download](https://nodejs.org)
- **Internet connection** - For live draft data

#### **🔍 Enhanced Dependency Checker**
The dependency checker will:
- ✅ Verify all required software is installed
- ⚠️ Show version warnings if updates are recommended
- 🔧 Provide installation instructions for missing dependencies
- 📊 Give you a clear summary of what's ready

---

### **🌐 Option 4: Try Online (No Download Required)**

[![Open in Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/edgecdec/SleeperLiveDraftRankings)

---

### **🔧 Option 5: Clone & Build (Developers)**

```bash
git clone https://github.com/edgecdec/SleeperLiveDraftRankings.git
cd SleeperLiveDraftRankings
./start.sh  # Mac/Linux
# or
start.bat   # Windows
```

---

## 📊 **Installation Comparison**

| Method | Ease | Dependencies | File Size | Best For |
|--------|------|--------------|-----------|----------|
| **Desktop App** | ⭐⭐⭐⭐⭐ | None | ~200MB | Most users |
| **Docker** | ⭐⭐⭐⭐ | Docker only | ~500MB | Tech-savvy users |
| **Traditional** | ⭐⭐⭐ | Python + Node.js | ~50MB | Developers |
| **Online** | ⭐⭐⭐⭐⭐ | None | 0MB | Quick testing |

---

## ✨ **What's Included**

- ✅ **Complete application** - Backend + Frontend + Data
- ✅ **Multiple installation methods** - Choose what works for you
- ✅ **Smart start scripts** - Automatic dependency installation
- ✅ **Enhanced dependency checker** - Detailed system validation
- ✅ **Docker containerization** - Isolated, consistent environment
- ✅ **Build tools** - Create your own executables
- ✅ **Sample rankings** - Ready-to-use CSV examples
- ✅ **Comprehensive documentation** - Setup guides and troubleshooting

---

## 🎯 **Key Features**

### **🏈 Live Draft Integration**
- **Real-time sync** with Sleeper drafts
- **Automatic updates** as picks are made
- **Multi-league support** and mock drafts
- **Draft history** and analytics

### **📊 Smart Rankings System**
- **FantasyPros Integration** - Expert consensus rankings
- **Custom Rankings Upload** - Use your own CSV files
- **Value Column Analysis** - See projected player values
- **Visual Tier Groupings** - Easy-to-read tier system
- **Multiple Scoring Formats** - PPR, Half-PPR, Standard

### **🎨 Advanced Interface**
- **Position Filtering** - Focus on QB, RB, WR, TE, K, DST
- **Drag & Drop Reordering** - Customize your preferences
- **Dark/Light Mode Toggle** - Comfortable viewing
- **Responsive Design** - Works on desktop, tablet, mobile
- **Real-time Updates** - Live draft board

### **🔧 Customization Options**
- **League Types** - Standard, Superflex, Dynasty, Keeper
- **Custom Rankings Manager** - Upload and manage multiple ranking sets
- **Flexible CSV Support** - Multiple column name formats
- **Mock Draft Configuration** - Practice with different scenarios
- **Team Management** - Track your roster in real-time

---

## 🔧 **Quick Setup Guide**

### **First Time Setup**
1. **Choose your installation method** from the options above
2. **Follow the installation steps** for your chosen method
3. **Wait for servers to start** (30-60 seconds for traditional setup)
4. **Open your browser** to http://localhost:3000
5. **Enter your Sleeper username** to get started

### **Using the Application**
1. **Select your league** from the dropdown
2. **Choose your draft** (live or mock)
3. **Upload custom rankings** (optional)
4. **Start drafting** with real-time assistance!

---

## 📁 **Custom Rankings Format**

Upload CSV files with your own player rankings:

```csv
name,position,rank,tier,team,value
Josh Allen,QB,1,1,BUF,25.5
Christian McCaffrey,RB,2,1,SF,24.8
Cooper Kupp,WR,3,1,LAR,23.2
Travis Kelce,TE,4,1,KC,18.7
Justin Tucker,K,5,2,BAL,8.2
San Francisco,DST,6,2,SF,7.8
```

**Required columns:** `name`, `position`  
**Optional columns:** `rank`, `tier`, `team`, `value`, `adp`, `notes`

**Supported formats:**
- Standard CSV with headers
- Multiple naming conventions (rank/ranking, pos/position, etc.)
- Custom value columns for auction drafts
- Tier-based rankings for positional analysis

---

## 🏗️ **Architecture & Technology**

### **Application Stack**
- **Frontend**: React 18 SPA with modern hooks
- **Backend**: Python Flask REST API
- **Data Sources**: Sleeper API + FantasyPros rankings
- **Storage**: Local file system for custom rankings
- **Deployment**: Multi-platform (Windows, macOS, Linux)

### **Key Technologies**
- **React**: Component-based UI with real-time updates
- **Flask**: Lightweight Python web framework
- **Docker**: Containerized deployment option
- **Electron**: Desktop application framework
- **PyInstaller**: Standalone executable creation

---

## 🛠️ **Advanced Options**

### **Build Your Own Desktop App**
```bash
# Create Electron desktop app
python3 create_electron_app.py
cd electron-app && ./build.sh
```

### **Create Standalone Executable**
```bash
# Create Python executable
python3 build_executables.py
```

### **Docker Development**
```bash
# Build custom Docker image
docker build -t fantasy-football-draft-assistant .
docker run -p 3000:3000 -p 5001:5001 fantasy-football-draft-assistant
```

---

## 🛠️ **Development Setup**

### **Manual Development Installation**

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

### **Testing**
```bash
cd test
python test_dst_roster.py
```

### **Building Release Package**
```bash
./build_release.sh
```

---

## 📚 **Documentation**

### **User Guides**
- **[INSTALLATION_OPTIONS.md](./INSTALLATION_OPTIONS.md)** - Complete installation guide with all methods
- **[doc/RELEASE_README.md](./doc/RELEASE_README.md)** - User guide for the release package
- **[doc/ENHANCED_START_SCRIPTS.md](./doc/ENHANCED_START_SCRIPTS.md)** - Technical details on start scripts

### **Technical Documentation**
- **[doc/TECHNICAL_DOCUMENTATION.md](./doc/TECHNICAL_DOCUMENTATION.md)** - Detailed technical documentation
- **[src/backend/API_README.md](./src/backend/API_README.md)** - API documentation and reference
- **[src/backend/UPLOAD_FEATURES_README.md](./src/backend/UPLOAD_FEATURES_README.md)** - Custom rankings features
- **[DESKTOP_APP_INSTRUCTIONS.md](./DESKTOP_APP_INSTRUCTIONS.md)** - Desktop app build instructions

### **Navigation**
- **[doc/DOCUMENTATION_INDEX.md](./doc/DOCUMENTATION_INDEX.md)** - Complete documentation index

---

## 🆘 **Troubleshooting**

### **Common Issues**

#### **Traditional Setup**
- **"Connection refused"** → Make sure both servers are running
- **"Python not found"** → Install Python 3.7+ from python.org
- **"Node not found"** → Install Node.js 16+ from nodejs.org
- **"Permission denied"** → Run `chmod +x start.sh` on Mac/Linux

#### **Docker Issues**
- **"Port already in use"** → Stop other applications using ports 3000/5001
- **"Docker not running"** → Start Docker Desktop
- **"Permission denied"** → Run with `sudo` on Linux

#### **Desktop App Issues**
- **"App won't start"** → Check antivirus software settings
- **"Missing features"** → Ensure you have the latest version
- **"Performance issues"** → Close other resource-intensive applications

### **Getting Help**
1. **Run the dependency checker** - Identifies and fixes most issues automatically
2. **Check the documentation** - Comprehensive guides for all scenarios
3. **Try Docker** - Often the easiest method if you have Docker installed
4. **Open a GitHub issue** - We're here to help with specific problems

---

## 🔄 **Updating**

### **Traditional Setup**
1. Download the latest release ZIP
2. Extract to a new folder (or backup and replace)
3. Run the start script

### **Docker**
```bash
docker-compose pull
docker-compose up
```

### **Desktop App**
- Auto-update notifications (coming soon)
- Or download and install the latest version

---

## 🤝 **Contributing**

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Add tests** if applicable
5. **Update documentation** as needed
6. **Submit a pull request** with a clear description

### **Development Guidelines**
- Follow existing code style and patterns
- Add tests for new features
- Update documentation for user-facing changes
- Test across multiple platforms when possible

---

## 📄 **License**

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 **Acknowledgments**

- **[Sleeper API](https://docs.sleeper.app/)** - For providing excellent fantasy football data and APIs
- **[FantasyPros](https://www.fantasypros.com/)** - For expert consensus rankings and analysis
- **[React](https://reactjs.org/)** - For the excellent frontend framework
- **[Flask](https://flask.palletsprojects.com/)** - For the lightweight backend framework
- **Community Contributors** - For feedback, bug reports, and feature suggestions

---

## 🎯 **Ready to Dominate Your Draft?**

Choose your installation method above and get started in minutes!

*Built for Sleeper fantasy football leagues. Works with standard, PPR, half-PPR, superflex, dynasty, and keeper formats.*

**🏈 Transform your draft experience with real-time rankings, smart analysis, and professional-grade tooling!**