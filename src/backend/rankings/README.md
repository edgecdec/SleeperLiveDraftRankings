# Rankings Directory

This directory contains all player rankings files used by the Fantasy Football Draft API.

## Directory Structure

```
backend/rankings/
├── README.md                                    # This file
├── Custom/                                      # Custom uploaded rankings
│   └── custom_rankings_metadata.json          # Metadata for custom rankings
├── FantasyPros_Rankings_standard_standard.csv  # Standard scoring, 1 QB
├── FantasyPros_Rankings_standard_superflex.csv # Standard scoring, Superflex
├── FantasyPros_Rankings_half_ppr_standard.csv  # Half PPR, 1 QB
├── FantasyPros_Rankings_half_ppr_superflex.csv # Half PPR, Superflex
├── FantasyPros_Rankings_ppr_standard.csv       # Full PPR, 1 QB
└── FantasyPros_Rankings_ppr_superflex.csv      # Full PPR, Superflex
```

## File Naming Convention

Rankings files follow this pattern:
```
FantasyPros_Rankings_{scoring_format}_{league_type}.csv
```

Where:
- **scoring_format**: `standard`, `half_ppr`, or `ppr`
- **league_type**: `standard` (1 QB) or `superflex` (2 QB/flexible)

## File Format

Each CSV file contains player rankings with these columns:
- `Overall Rank`: Player's overall ranking (1 = best)
- `Name`: Player's full name
- `Team`: NFL team abbreviation
- `Position`: Player position (QB, RB, WR, TE, K, DST)
- `Tier`: Tier grouping (1 = highest tier)
- `Position Rank`: Rank within position

## Git Ignore

This entire directory is excluded from git via `.gitignore` because:
1. Rankings files are generated/downloaded content
2. They change frequently during fantasy season
3. They can be large files
4. Custom rankings may contain personal data

## Custom Rankings

The `Custom/` subdirectory stores user-uploaded rankings files with associated metadata. These are managed through the API's custom rankings endpoints.

## Automatic Updates

Rankings files are automatically updated by the `RankingsManager` service, which:
1. Scrapes current data from FantasyPros
2. Generates files for all scoring/league combinations
3. Stores them in this directory
4. Updates metadata and timestamps

## Development Notes

- The `Constants.py` file defines `RANKINGS_OUTPUT_DIRECTORY = "backend/rankings/"`
- The `RankingsService` searches multiple paths for backward compatibility
- File existence is checked before loading to handle missing files gracefully
- Rankings are cached in memory for performance

## Migration from PopulatedFromSites

This directory replaces the previous `PopulatedFromSites/` structure:
- **Old**: `backend/PopulatedFromSites/`
- **New**: `backend/rankings/`

The migration maintains full backward compatibility while providing a cleaner, more organized structure.
