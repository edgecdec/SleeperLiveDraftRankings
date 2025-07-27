# FantasyPros Consensus Rankings Scraper

This tool automatically scrapes the latest consensus rankings from FantasyPros and formats them for use with your Sleeper draft tool.

## Quick Start

### 1. Scrape the Latest Rankings
```bash
python3 scrape_fantasypros.py
```

### 2. Use the Rankings with Your Draft Tool
```bash
python3 use_fantasypros_rankings.py
```

### 3. Run Your Draft Tool
```bash
python3 RunMe.py
```

## What It Does

The scraper:
- ✅ Fetches the latest consensus rankings from FantasyPros
- ✅ Extracts player data including name, position, team, bye week, and tier
- ✅ Formats the data to match your existing CSV structure
- ✅ Saves rankings in the correct format for your draft tool
- ✅ Skips DST players (as mentioned in your README)
- ✅ Calculates position ranks automatically

## Files Created

- `Rankings/PopulatedFromSites/FantasyPros_Rankings.csv` - Raw scraped data
- `Rankings.csv` - Main rankings file used by your draft tool (after running use script)
- `Rankings_backup.csv` - Backup of your previous rankings

## Data Format

The scraper creates a CSV with these columns:
- **Overall Rank**: Player's overall draft ranking
- **Name**: Player's full name
- **Position**: QB, RB, WR, TE, K
- **Team**: NFL team abbreviation
- **Bye**: Bye week number
- **Position Rank**: Rank within position (QB1, RB1, etc.)
- **Tier**: Draft tier (1 = elite, 2 = very good, etc.)

## Example Output

```
Overall Rank,Name,Position,Team,Bye,Position Rank,Tier
1,Ja'Marr Chase,WR,CIN,10,1,1
2,Saquon Barkley,RB,PHI,9,1,1
3,Bijan Robinson,RB,ATL,5,2,1
4,Justin Jefferson,WR,MIN,6,2,1
5,Jahmyr Gibbs,RB,DET,8,3,2
```

## Automation Options

### Option 1: Manual Update Before Each Draft
```bash
python3 scrape_fantasypros.py && python3 use_fantasypros_rankings.py
```

### Option 2: Create a Combined Script
You can create a single script that does both steps:

```python
#!/usr/bin/env python3
import subprocess
import sys

def update_rankings():
    print("🔄 Scraping latest FantasyPros rankings...")
    result1 = subprocess.run([sys.executable, "scrape_fantasypros.py"])
    
    if result1.returncode == 0:
        print("🔄 Setting up rankings for draft tool...")
        result2 = subprocess.run([sys.executable, "use_fantasypros_rankings.py"])
        
        if result2.returncode == 0:
            print("🎯 Ready for draft!")
        else:
            print("❌ Failed to setup rankings")
    else:
        print("❌ Failed to scrape rankings")

if __name__ == "__main__":
    update_rankings()
```

## Troubleshooting

### If scraping fails:
1. **Check your internet connection**
2. **Website might be temporarily down** - try again later
3. **Website structure changed** - the scraper may need updates
4. **Use the manual method** from cheatsheetking.com as described in the main README

### If you get import errors:
```bash
pip install requests beautifulsoup4 pandas
```

### If you want to verify the data:
The scraper shows a preview of the first 10 players and position breakdown when it runs successfully.

## Customization

### Change the source URL:
Edit the `url` variable in `scrape_fantasypros.py` to use different FantasyPros rankings (e.g., PPR vs Standard).

### Modify the output format:
The scraper can be easily modified to include additional fields available in the FantasyPros data, such as:
- `player_owned_avg` - Average ownership percentage
- `rank_ave` - Average expert rank
- `rank_std` - Standard deviation of expert ranks

## Technical Details

- **Data Source**: FantasyPros consensus cheatsheet page
- **Method**: Extracts JSON data embedded in the webpage
- **Format**: Matches your existing CSV structure exactly
- **Updates**: Rankings reflect the latest expert consensus when scraped
- **Reliability**: Uses the same data source as the FantasyPros website

## Integration with Existing Workflow

This scraper is designed to work seamlessly with your existing draft tool:

1. Your existing `EditMe.py` settings remain unchanged
2. The `RunMe.py` script works exactly the same
3. All existing functionality is preserved
4. You can switch back to manual rankings anytime by replacing `Rankings.csv`

## Comparison with Manual Method

| Method | Pros | Cons |
|--------|------|------|
| **FantasyPros Scraper** | ✅ Always up-to-date<br>✅ No manual work<br>✅ Consistent format<br>✅ Expert consensus | ❌ Depends on website<br>❌ Less customizable |
| **Manual (CheatsheetKing)** | ✅ Fully customizable<br>✅ Your personal rankings<br>✅ Always works | ❌ Manual effort required<br>❌ May become outdated<br>❌ Time-consuming |

## Support

If you encounter issues:
1. Check that the required Python packages are installed
2. Verify your internet connection
3. Try running the scraper again (websites can be temporarily unavailable)
4. Fall back to the manual method described in the main README

The scraper is designed to be robust, but websites can change their structure. If it stops working, you can always use the manual method as a backup.
