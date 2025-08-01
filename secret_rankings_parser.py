#!/usr/bin/env python3
"""
Secret Rankings Parser

This script converts rankings files from ~/Downloads into the standard format
used by the Fantasy Football Draft API. It automatically detects common
column formats and maps them to our standard structure.

KEEP THIS FILE SECRET - IT'S IN .GITIGNORE
"""

import pandas as pd
import os
import glob
from datetime import datetime
import re

# Standard output columns
OUTPUT_COLUMNS = ['Overall Rank', 'Name', 'Position', 'Team', 'Bye', 'Position Rank', 'Tier', 'Value']

# Common column name mappings (case-insensitive)
COLUMN_MAPPINGS = {
    # Rank columns
    'rank': 'Overall Rank',
    'overall rank': 'Overall Rank',
    'overall_rank': 'Overall Rank',
    'rk': 'Overall Rank',
    'ranking': 'Overall Rank',
    'overall': 'Overall Rank',
    
    # Name columns
    'name': 'Name',
    'player': 'Name',
    'player name': 'Name',
    'player_name': 'Name',
    'full name': 'Name',
    'full_name': 'Name',
    
    # Position columns
    'position': 'Position',
    'pos': 'Position',
    'positions': 'Position',
    
    # Team columns
    'team': 'Team',
    'tm': 'Team',
    'nfl team': 'Team',
    'nfl_team': 'Team',
    
    # Tier columns
    'tier': 'Tier',
    'tiers': 'Tier',
    'tier rank': 'Tier',
    'tier_rank': 'Tier',
    
    # Value columns
    'value': 'Value',
    'points': 'Value',
    'fantasy points': 'Value',
    'fantasy_points': 'Value',
    'projected points': 'Value',
    'projected_points': 'Value',
    'auction value': 'Value',
    'auction_value': 'Value',
    'salary': 'Value',
    'price': 'Value',
    
    # Position rank columns
    'position rank': 'Position Rank',
    'position_rank': 'Position Rank',
    'pos rank': 'Position Rank',
    'pos_rank': 'Position Rank',
    'positional rank': 'Position Rank',
    'positional_rank': 'Position Rank',
    
    # Bye week columns
    'bye': 'Bye',
    'bye week': 'Bye',
    'bye_week': 'Bye',
    'byeweek': 'Bye',
}

def find_downloads_files():
    """Find potential rankings files in Downloads folder."""
    downloads_path = os.path.expanduser("~/Downloads")
    
    # Common file patterns for rankings
    patterns = [
        "*.csv",
        "*ranking*.csv",
        "*rankings*.csv", 
        "*fantasy*.csv",
        "*draft*.csv",
        "*cheat*.csv",
        "*ppr*.csv",
        "*half*.csv"
    ]
    
    files = []
    for pattern in patterns:
        files.extend(glob.glob(os.path.join(downloads_path, pattern)))
    
    # Remove duplicates and sort by modification time (newest first)
    files = list(set(files))
    files.sort(key=lambda x: os.path.getmtime(x), reverse=True)
    
    return files

def detect_column_mapping(df):
    """Detect which columns map to our standard format."""
    mapping = {}
    df_columns_lower = [col.lower().strip() for col in df.columns]
    
    for i, col_lower in enumerate(df_columns_lower):
        original_col = df.columns[i]
        
        # Direct mapping
        if col_lower in COLUMN_MAPPINGS:
            mapping[original_col] = COLUMN_MAPPINGS[col_lower]
        else:
            # Fuzzy matching for partial matches
            for key, value in COLUMN_MAPPINGS.items():
                if key in col_lower or col_lower in key:
                    mapping[original_col] = value
                    break
    
    return mapping

def clean_position(position):
    """Clean and standardize position names."""
    if pd.isna(position):
        return None
        
    pos = str(position).upper().strip()
    
    # Remove numbers and special characters
    pos = re.sub(r'[0-9\-\(\)]', '', pos).strip()
    
    # Handle common variations
    position_mappings = {
        'DEF': 'DST',
        'D/ST': 'DST',
        'DEFENSE': 'DST',
        'KICKER': 'K',
        'QUARTERBACK': 'QB',
        'RUNNING BACK': 'RB',
        'RUNNINGBACK': 'RB',
        'WIDE RECEIVER': 'WR',
        'WIDERECEIVER': 'WR',
        'TIGHT END': 'TE',
        'TIGHTEND': 'TE'
    }
    
    return position_mappings.get(pos, pos)

def calculate_position_rank(df):
    """Calculate position rank for each player."""
    df['Position Rank'] = df.groupby('Position').cumcount() + 1
    return df

def convert_rankings_file(input_file, output_name=None):
    """Convert a rankings file to our standard format."""
    try:
        print(f"📊 Processing: {os.path.basename(input_file)}")
        
        # Read the CSV file
        df = pd.read_csv(input_file)
        print(f"   Found {len(df)} rows and {len(df.columns)} columns")
        
        # Detect column mappings
        mapping = detect_column_mapping(df)
        print(f"   Detected mappings: {mapping}")
        
        # Check for required columns
        required_mappings = ['Overall Rank', 'Name', 'Position']
        missing_required = []
        for req in required_mappings:
            if req not in mapping.values():
                missing_required.append(req)
        
        if missing_required:
            print(f"❌ Missing required columns: {missing_required}")
            return False
        
        # Create new dataframe with mapped columns
        new_df = pd.DataFrame()
        
        # Map existing columns
        for original_col, standard_col in mapping.items():
            new_df[standard_col] = df[original_col]
        
        # Clean position column
        if 'Position' in new_df.columns:
            new_df['Position'] = new_df['Position'].apply(clean_position)
        
        # Add missing columns with defaults
        for col in OUTPUT_COLUMNS:
            if col not in new_df.columns:
                if col == 'Tier':
                    new_df[col] = 999  # Default tier
                elif col == 'Value':
                    new_df[col] = 0    # Default value
                elif col == 'Team':
                    new_df[col] = 'N/A'  # Default team
                elif col == 'Bye':
                    new_df[col] = 0    # Default bye week
                elif col == 'Position Rank':
                    pass  # Will calculate below
                else:
                    new_df[col] = ''
        
        # Calculate position ranks
        new_df = calculate_position_rank(new_df)
        
        # Filter valid positions only
        valid_positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DST']
        initial_count = len(new_df)
        new_df = new_df[new_df['Position'].isin(valid_positions)]
        filtered_count = initial_count - len(new_df)
        
        if filtered_count > 0:
            print(f"   Filtered out {filtered_count} players with invalid positions")
        
        # Sort by overall rank
        new_df = new_df.sort_values('Overall Rank').reset_index(drop=True)
        
        # Reorder columns
        new_df = new_df[OUTPUT_COLUMNS]
        
        # Generate output filename
        if not output_name:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_name = f"Custom_Rankings_half_ppr_superflex_{timestamp}.csv"
        
        # Ensure .csv extension
        if not output_name.endswith('.csv'):
            output_name += '.csv'
        
        # Output to rankings directory
        output_path = os.path.join('backend', 'rankings', output_name)
        new_df.to_csv(output_path, index=False)
        
        print(f"✅ Successfully converted {len(new_df)} players")
        print(f"   Output: {output_path}")
        
        # Show position breakdown
        pos_counts = new_df['Position'].value_counts()
        print(f"   Position breakdown: {dict(pos_counts)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error processing {input_file}: {e}")
        return False

def main():
    """Main function to find and convert rankings files."""
    print("🔒 Secret Rankings Parser")
    print("=" * 50)
    
    # Find potential files
    files = find_downloads_files()
    
    if not files:
        print("❌ No CSV files found in ~/Downloads")
        return
    
    print(f"📁 Found {len(files)} potential files in Downloads:")
    for i, file in enumerate(files[:10]):  # Show first 10
        mod_time = datetime.fromtimestamp(os.path.getmtime(file))
        print(f"   {i+1}. {os.path.basename(file)} ({mod_time.strftime('%Y-%m-%d %H:%M')})")
    
    if len(files) > 10:
        print(f"   ... and {len(files) - 10} more files")
    
    print()
    
    # Interactive selection
    try:
        choice = input("Enter file number to convert (or 'q' to quit): ").strip()
        
        if choice.lower() == 'q':
            print("👋 Goodbye!")
            return
        
        file_index = int(choice) - 1
        if file_index < 0 or file_index >= len(files):
            print("❌ Invalid file number")
            return
        
        selected_file = files[file_index]
        
        # Ask for output name
        output_name = input("Enter output filename (or press Enter for auto-generated): ").strip()
        if not output_name:
            output_name = None
        
        # Convert the file
        print()
        success = convert_rankings_file(selected_file, output_name)
        
        if success:
            print()
            print("🎉 Conversion completed successfully!")
            print("   The file is now ready to use in the Fantasy Football Draft API")
        else:
            print()
            print("💥 Conversion failed. Check the error messages above.")
            
    except (ValueError, KeyboardInterrupt):
        print("❌ Invalid input or cancelled")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    main()
