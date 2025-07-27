# Advanced FantasyPros Rankings

This enhanced version of the FantasyPros scraper can automatically detect your league's scoring format and superflex settings, then fetch the appropriate rankings from FantasyPros.

## Features

### Automatic League Format Detection
The system can automatically detect:
- **Scoring Format**: Standard, Half PPR, or PPR based on your league's reception scoring
- **Superflex/2QB**: Whether your league uses superflex or 2QB positions

### Supported Ranking Types
- **Standard Scoring**: No points for receptions
- **Half PPR**: 0.5 points per reception  
- **PPR**: 1 point per reception
- **Superflex**: All above formats with superflex/2QB rankings

## How It Works

### 1. Automatic Detection (Recommended)
The backend automatically detects your league format when you load a draft:

```python
# The system checks your Sleeper league settings:
# - scoring_settings.rec = 0 → Standard
# - scoring_settings.rec = 0.5 → Half PPR  
# - scoring_settings.rec = 1.0 → PPR
# - roster_positions contains 'SUPER_FLEX' → Superflex
# - roster_positions has 2+ QB slots → 2QB (treated as superflex)
```

### 2. Manual Scraping
You can also manually scrape specific formats:

```bash
# Scrape PPR rankings (default)
python scrape_rankings_by_format.py

# Scrape Half PPR rankings
python scrape_rankings_by_format.py --scoring half_ppr

# Scrape Standard rankings
python scrape_rankings_by_format.py --scoring standard

# Scrape Superflex PPR rankings
python scrape_rankings_by_format.py --scoring ppr --superflex

# Scrape all formats at once
python scrape_rankings_by_format.py --all

# Auto-detect from your draft ID
python scrape_rankings_by_format.py --draft-id YOUR_DRAFT_ID
```

## File Structure

Rankings are saved with descriptive names:
```
Rankings/PopulatedFromSites/
├── FantasyPros_Rankings_standard_standard.csv
├── FantasyPros_Rankings_half_ppr_standard.csv
├── FantasyPros_Rankings_ppr_standard.csv
├── FantasyPros_Rankings_standard_superflex.csv
├── FantasyPros_Rankings_half_ppr_superflex.csv
└── FantasyPros_Rankings_ppr_superflex.csv
```

## Backend Integration

### Enhanced App (app_enhanced.py)
The enhanced backend automatically:
1. Detects your league format from Sleeper API
2. Loads the appropriate rankings file
3. Falls back to scraping if rankings don't exist
4. Caches rankings for 1 hour to avoid excessive API calls

### API Endpoints
- `GET /api/draft/<draft_id>?refresh_rankings=true` - Force refresh rankings
- `POST /api/refresh-rankings` - Refresh rankings for current league format
- `GET /api/health` - Shows which rankings file is currently loaded

## Usage Examples

### For PPR League
```bash
# Your league has 1.0 points per reception
python scrape_rankings_by_format.py --scoring ppr
```

### For Half PPR Superflex League  
```bash
# Your league has 0.5 points per reception and superflex
python scrape_rankings_by_format.py --scoring half_ppr --superflex
```

### For Standard 2QB League
```bash
# Your league has no PPR and 2 QB slots
python scrape_rankings_by_format.py --scoring standard --superflex
```

### Auto-Detection from Sleeper
```bash
# Let the system detect your league format
python scrape_rankings_by_format.py --draft-id 1255128178175791104
```

## FantasyPros URLs Used

The scraper uses these specific FantasyPros URLs:

| Format | URL |
|--------|-----|
| Standard | `/nfl/rankings/consensus-cheatsheets.php` |
| Half PPR | `/nfl/rankings/half-point-ppr-cheatsheets.php` |
| PPR | `/nfl/rankings/ppr-cheatsheets.php` |
| Superflex Standard | `/nfl/rankings/superflex-cheatsheets.php` |
| Superflex Half PPR | `/nfl/rankings/superflex-half-point-ppr-cheatsheets.php` |
| Superflex PPR | `/nfl/rankings/superflex-ppr-cheatsheets.php` |

## Migration from Original Script

### Option 1: Use Enhanced Backend
1. Replace `backend/app.py` with `backend/app_enhanced.py`
2. The system will automatically detect and use appropriate rankings

### Option 2: Manual Migration
1. Run `python scrape_rankings_by_format.py --all` to generate all formats
2. Use the appropriate file for your league type
3. Update your `EditMe.py` to point to the correct file:
   ```python
   FILE_NAME = 'Rankings/PopulatedFromSites/FantasyPros_Rankings_ppr_superflex.csv'
   ```

## Troubleshooting

### Rankings Not Loading
1. Check if the rankings file exists: `ls Rankings/PopulatedFromSites/FantasyPros_Rankings_*.csv`
2. Try manual scraping: `python scrape_rankings_by_format.py --all`
3. Check the health endpoint: `curl http://localhost:5000/api/health`

### Wrong Rankings Being Used
1. Verify league detection: Check the console output when loading a draft
2. Force refresh: Add `?refresh_rankings=true` to your API call
3. Manual override: Scrape specific format and update `EditMe.py`

### Scraping Failures
1. Check internet connection
2. FantasyPros may have changed their website structure
3. Try different formats to isolate the issue
4. Check the console for detailed error messages

## Advanced Configuration

### Custom League Detection
You can modify the detection logic in `backend/league_format_detector.py`:

```python
def detect_league_format(self, league_info=None, draft_info=None):
    # Add custom logic here
    # For example, detect dynasty leagues differently
    pass
```

### Custom Rankings Sources
Extend `FantasyProsAdvanced.py` to add new ranking sources:

```python
URLS = {
    'custom_format': 'https://www.fantasypros.com/custom-url',
    # Add your custom URLs here
}
```

## Performance Notes

- Rankings are cached for 1 hour to reduce API calls
- The system only scrapes when rankings are missing or stale
- Use `--all` sparingly as it makes 6 separate requests to FantasyPros
- Consider running a daily cron job to refresh rankings

## Support

If you encounter issues:
1. Check the console output for detailed error messages
2. Verify your league settings in Sleeper match the expected format
3. Try manual scraping to isolate API vs detection issues
4. Check that FantasyPros URLs are still accessible
