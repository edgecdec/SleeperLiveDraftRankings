#!/usr/bin/env python3
"""
Debug script to test value column parsing
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from Rankings.ParseRankings import parseCSV
import tempfile

def test_value_column_parsing():
    """Test if value column is being parsed correctly"""
    print("🔍 Testing Value Column Parsing")
    print("=" * 50)
    
    # Create a test CSV with value column
    test_csv_content = """name,position,rank,tier,team,value
Josh Allen,QB,1,1,BUF,25.5
Christian McCaffrey,RB,2,1,SF,24.8
Cooper Kupp,WR,3,1,LAR,23.2
Travis Kelce,TE,4,1,KC,18.7"""
    
    # Write to temp file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as temp_file:
        temp_file.write(test_csv_content)
        temp_file_path = temp_file.name
    
    try:
        print(f"📁 Parsing test CSV: {temp_file_path}")
        print(f"📄 CSV Content:\n{test_csv_content}")
        print()
        
        # Parse the CSV
        players = parseCSV(temp_file_path)
        
        print(f"✅ Parsed {len(players)} players")
        print()
        
        # Check each player for value attribute
        for i, player in enumerate(players[:4]):  # Just check first 4
            print(f"Player {i+1}: {player.name}")
            print(f"  Position: {player.pos}")
            print(f"  Team: {player.team}")
            print(f"  Rank: {player.rank}")
            print(f"  Tier: {getattr(player, 'tier', 'NOT SET')}")
            print(f"  Value: {getattr(player, 'value', 'NOT SET')}")
            print(f"  Has value attribute: {hasattr(player, 'value')}")
            if hasattr(player, 'value'):
                print(f"  Value type: {type(player.value)}")
                print(f"  Value repr: {repr(player.value)}")
            print()
        
    except Exception as e:
        print(f"❌ Error parsing CSV: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Clean up temp file
        os.unlink(temp_file_path)

if __name__ == "__main__":
    test_value_column_parsing()
