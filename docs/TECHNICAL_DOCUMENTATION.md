# 🏈 Enhanced Fantasy Football Live Draft Rankings

An integrated system that automatically updates FantasyPros rankings, detects league formats, provides manual override functionality, and supports custom rankings uploads for optimal draft assistance.

## ✨ Features

### 🔄 Automatic Rankings Updates
- **Startup Updates**: Automatically updates all FantasyPros rankings when the app launches
- **Background Processing**: Updates run in background threads without blocking the UI
- **Smart Caching**: Only updates when rankings are stale (configurable age threshold)
- **Multiple Formats**: Supports Standard, Half PPR, and Full PPR scoring
- **League Types**: Handles both Standard and Superflex leagues

### 🎯 League Format Detection
- **Automatic Detection**: Analyzes Sleeper league settings to determine format
- **Scoring Format**: Detects PPR, Half PPR, or Standard scoring
- **League Type**: Identifies Superflex vs Standard leagues
- **Forever League Support**: Optimized for Half PPR Superflex format

### 🎛️ Manual Override System
- **Dropdown Controls**: Easy-to-use dropdowns for format selection
- **Real-time Updates**: Rankings update immediately when format is changed
- **Override Indicators**: Clear visual indicators when manual override is active
- **Fallback Options**: Manual control when auto-detection fails

### 📤 Custom Rankings Upload
- **CSV Upload**: Upload your own custom rankings in CSV format
- **File Validation**: Automatic validation of file format and content
- **Metadata Management**: Store display names, descriptions, and timestamps
- **Format Organization**: Categorize by scoring format and league type
- **File Management**: List, download, and delete custom rankings
- **Dropdown Integration**: Select custom rankings alongside FantasyPros options

### 📊 Real-time Status Monitoring
- **Update Progress**: Live status of rankings updates
- **File Availability**: Shows which ranking files are available
- **Timestamps**: Detailed timestamps for all ranking files (FantasyPros and custom)
- **Health Checks**: API endpoints for system monitoring

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install flask flask-cors pandas requests selenium
brew install chromedriver  # macOS
```

### 2. Test the System
```bash
cd Rankings
python3 test_integration.py
```

### 3. Launch the Application
```bash
python3 launch_integrated_app.py
```

### 4. Access the Interface
- **Frontend UI**: http://localhost:3000
- **Rankings Manager**: http://localhost:3000/rankings
- **Backend API**: http://localhost:5001

## 📁 File Structure

```
SleeperLiveDraftRankings/
├── Rankings/
│   ├── RankingsManager.py          # Core rankings management
│   ├── PopulateFromSites/
│   │   └── FantasyProsSeleniumV2.py # Enhanced Selenium scraper
│   ├── PopulatedFromSites/         # Generated ranking files
│   └── test_integration.py         # System tests
├── backend/
│   ├── app.py                     # Enhanced Flask application
│   └── league_format_detector.py   # League format detection
├── frontend/
│   └── src/components/
│       └── RankingsManager.js      # React rankings interface
└── launch_integrated_app.py        # Application launcher
```

## 🔧 API Endpoints

### Rankings Management
- `GET /api/rankings/status` - Get update status
- `POST /api/rankings/update` - Trigger manual update
- `GET /api/rankings/formats` - List available formats
- `GET /api/rankings` - Get current rankings (supports `custom_id` parameter)

### Custom Rankings
- `GET /api/custom-rankings` - List all custom rankings
- `POST /api/custom-rankings/upload` - Upload custom rankings file
- `DELETE /api/custom-rankings/<file_id>` - Delete custom rankings
- `GET /api/custom-rankings/<file_id>/download` - Download custom rankings file

### League Configuration
- `POST /api/league/detect` - Auto-detect league format
- `POST /api/league/override` - Manual format override
- `GET /api/league/current` - Get current settings

### System Health
- `GET /api/health` - Health check with rankings status

## 🎮 Usage Guide

### Automatic Mode (Recommended)
1. **Launch the app** - Rankings update automatically on startup
2. **Provide league ID** - System detects format automatically
3. **Start drafting** - Rankings are optimized for your league

### Manual Override Mode
1. **Open Rankings Manager** - Navigate to the rankings interface
2. **Select Format** - Choose scoring format from dropdown
3. **Select League Type** - Choose Standard or Superflex
4. **Apply Override** - Rankings update immediately

### Custom Rankings Upload
1. **Prepare CSV File** - Ensure proper format (see requirements below)
2. **Upload File** - Use the upload form in Rankings Manager
3. **Add Metadata** - Provide display name and description
4. **Select in Dropdown** - Choose your custom rankings from the selection

### Monitoring Updates
- **Status Dashboard** - View update progress and file status
- **Manual Updates** - Trigger updates when needed
- **File Browser** - See all available ranking combinations
- **Timestamps** - View when each file was last updated

## 🏆 Supported Formats

### Scoring Formats
- **Standard**: No points for receptions
- **Half PPR**: 0.5 points per reception
- **Full PPR**: 1 point per reception

### League Types
- **Standard**: Traditional QB/RB/WR/TE/K/DST lineup
- **Superflex**: QB can be played in flex position (QBs valued much higher)

### Generated Files
```
FantasyPros_Rankings_standard_standard_v2.csv
FantasyPros_Rankings_standard_superflex_v2.csv
FantasyPros_Rankings_half_ppr_standard_v2.csv
FantasyPros_Rankings_half_ppr_superflex_v2.csv
FantasyPros_Rankings_ppr_standard_v2.csv
FantasyPros_Rankings_ppr_superflex_v2.csv
```

### Custom Rankings CSV Format
Your custom rankings CSV files must meet these requirements:

#### Required Columns
- **Name/Player**: Player name (case-insensitive column matching)
- **Position/Pos**: Player position (QB, RB, WR, TE, K, DST/DEF)

#### Optional Columns
- **Team/Tm**: Player team abbreviation
- **Rank**: Overall ranking (will be auto-generated if missing)
- **Tier**: Tier grouping for players
- **Bye**: Bye week number

#### File Requirements
- **Format**: CSV (.csv) or text (.txt) files only
- **Size**: Maximum 16MB file size
- **Players**: Minimum 10 players, maximum 1000 players
- **Positions**: Must contain valid NFL positions
- **Encoding**: UTF-8 text encoding recommended

#### Example CSV Format
```csv
Name,Position,Team,Tier
Josh Allen,QB,BUF,1
Saquon Barkley,RB,PHI,1
Ja'Marr Chase,WR,CIN,1
Travis Kelce,TE,KC,2
```

## 🔍 How It Works

### 1. Startup Process
```python
# App launches
initialize_rankings()
  ├── Check if rankings are stale
  ├── Start background update if needed
  └── Load existing rankings for immediate use
```

### 2. League Detection
```python
# User provides league ID
detect_league_format(league_id)
  ├── Query Sleeper API for league settings
  ├── Analyze scoring and roster configuration
  └── Select appropriate rankings file
```

### 3. Rankings Update
```python
# Selenium scraper process
scrape_superflex_rankings(format)
  ├── Load FantasyPros page
  ├── Try clicking superflex tab
  ├── Fallback to URL parameter method
  ├── Verify data with Josh Allen rank test
  └── Generate CSV files
```

### 4. Manual Override
```python
# User changes dropdown
override_league_settings(format, type)
  ├── Update global settings
  ├── Load new rankings file
  └── Update UI immediately
```

## 🧪 Testing

### Run All Tests
```bash
python3 test_integration.py
```

### Test Individual Components
```bash
# Test rankings manager
python3 RankingsManager.py

# Test Selenium scraper
python3 PopulateFromSites/FantasyProsSeleniumV2.py

# Test league detection
python3 backend/league_format_detector.py
```

## 🐛 Troubleshooting

### ChromeDriver Issues
```bash
# Install ChromeDriver
brew install chromedriver  # macOS
# or download from https://chromedriver.chromium.org/

# Verify installation
chromedriver --version
```

### Rankings Not Updating
1. Check ChromeDriver installation
2. Verify internet connection
3. Check FantasyPros website accessibility
4. Review console logs for errors

### League Detection Failing
1. Verify league ID is correct
2. Check Sleeper API accessibility
3. Ensure league is public or accessible
4. Use manual override as fallback

### File Permission Issues
```bash
# Ensure output directory exists and is writable
mkdir -p Rankings/PopulatedFromSites
chmod 755 Rankings/PopulatedFromSites
```

## 🔮 Future Enhancements

- **Multiple Sources**: Add ESPN, Yahoo rankings
- **Custom Weights**: User-defined expert weights
- **Historical Tracking**: Track ranking changes over time
- **Mobile Interface**: Responsive mobile design
- **Push Notifications**: Alert when rankings update
- **Draft Simulation**: Mock draft functionality

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Run the test suite to identify problems
3. Review console logs for error details
4. Ensure all dependencies are properly installed

---

**🎯 Ready to dominate your draft with automatically updated, format-specific rankings!**
