# 🚀 Fantasy Football Draft Assistant - Installation Options

Choose the installation method that works best for you:

## 📦 Option 1: One-Click Desktop App (Recommended)

**Best for**: Most users who want the easiest experience

### Download & Install
1. **Download** the installer for your platform:
   - **Windows**: `FantasyFootballDraftAssistant-Setup.exe`
   - **macOS**: `FantasyFootballDraftAssistant.dmg`
   - **Linux**: `FantasyFootballDraftAssistant.AppImage`

2. **Install**:
   - **Windows**: Run the `.exe` installer
   - **macOS**: Open `.dmg` and drag to Applications
   - **Linux**: Make `.AppImage` executable and run

3. **Launch**: Click desktop shortcut or find in Applications menu

### Features
- ✅ **No dependencies** - Everything bundled
- ✅ **Desktop shortcuts** - Easy access
- ✅ **Auto-updates** - Stay current automatically
- ✅ **Native feel** - Integrated with your OS
- ✅ **Offline capable** - Works without internet (except live drafts)

---

## 🐳 Option 2: Docker (Super Easy)

**Best for**: Users comfortable with Docker, or those wanting isolated installation

### Prerequisites
- **Docker Desktop**: [Download here](https://www.docker.com/products/docker-desktop/)

### Quick Start
```bash
# Download and run
docker run -p 3000:3000 -p 5001:5001 fantasyfootball/draft-assistant

# Or with docker-compose
docker-compose up
```

### One-Line Install
```bash
curl -sSL https://raw.githubusercontent.com/edgecdec/SleeperLiveDraftRankings/main/docker-install.sh | bash
```

### Features
- ✅ **Zero setup** - Just install Docker
- ✅ **Isolated** - Doesn't affect your system
- ✅ **Consistent** - Same environment everywhere
- ✅ **Easy updates** - `docker pull` to update
- ✅ **Cross-platform** - Works on any Docker-supported OS

---

## 💻 Option 3: Traditional Setup (Current Method)

**Best for**: Developers or users who want full control

### Prerequisites
- **Python 3.7+**: [Download](https://python.org)
- **Node.js 16+**: [Download](https://nodejs.org)

### Quick Start
1. **Download** the ZIP file
2. **Extract** to your desired location
3. **Run dependency checker**:
   - Windows: `check_dependencies.bat`
   - Mac: `check_dependencies.command`
   - Linux: `./check_dependencies.sh`
4. **Start application**:
   - Windows: `start.bat`
   - Mac: `start.command`
   - Linux: `./start.sh`

### Features
- ✅ **Full control** - Modify and customize
- ✅ **Lightweight** - Only installs what you need
- ✅ **Transparent** - See exactly what's running
- ✅ **Developer-friendly** - Easy to modify and extend

---

## 🌐 Option 4: Web-Based (Coming Soon)

**Best for**: Users who prefer browser-based applications

### Features (Planned)
- ✅ **No installation** - Run in any browser
- ✅ **Always updated** - Latest version automatically
- ✅ **Cross-device** - Access from anywhere
- ✅ **Shareable** - Send links to friends

---

## 📊 Comparison

| Feature | Desktop App | Docker | Traditional | Web-Based |
|---------|-------------|--------|-------------|-----------|
| **Ease of Install** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **No Dependencies** | ✅ | ✅ | ❌ | ✅ |
| **Offline Use** | ✅ | ✅ | ✅ | ❌ |
| **Auto Updates** | ✅ | ✅ | ❌ | ✅ |
| **Customizable** | ❌ | ⚠️ | ✅ | ❌ |
| **File Size** | ~200MB | ~500MB | ~50MB | 0MB |
| **Performance** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 🛠️ Building Your Own

### Desktop App
```bash
# Create Electron desktop app
python create_electron_app.py
cd electron-app
./build.sh
```

### Python Executable
```bash
# Create standalone executable
python build_executables.py
```

### Docker Image
```bash
# Build Docker image
docker build -t fantasy-football-draft-assistant .
```

---

## 🆘 Troubleshooting

### Desktop App Issues
- **Won't start**: Check antivirus software
- **Missing features**: Ensure you have the latest version
- **Performance issues**: Close other applications

### Docker Issues
- **Port conflicts**: Change ports in docker-compose.yml
- **Permission errors**: Run with `sudo` on Linux
- **Image won't build**: Check Docker Desktop is running

### Traditional Setup Issues
- **Dependencies missing**: Run the dependency checker
- **Port conflicts**: Check if ports 3000/5001 are free
- **Permission errors**: Run as administrator/sudo

---

## 📞 Support

- **GitHub Issues**: [Report bugs](https://github.com/edgecdec/SleeperLiveDraftRankings/issues)
- **Documentation**: Check the included README files
- **Community**: Join discussions in GitHub Discussions

---

## 🎯 Recommendations

- **New Users**: Start with the **Desktop App**
- **Tech-Savvy**: Try **Docker** for easy management
- **Developers**: Use **Traditional Setup** for customization
- **Casual Users**: Wait for **Web-Based** version

Choose the method that fits your comfort level and needs. All options provide the same great Fantasy Football Draft Assistant experience! 🏈