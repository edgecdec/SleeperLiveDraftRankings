#!/usr/bin/env python3
"""
Test script to verify duplicate player fix
"""

import requests
import json

def test_roster_duplicates():
    """Test if roster API returns duplicate players"""
    
    # Test with a league that might have drafted players
    league_id = "1255160696174284800"  # Guillotine league
    username = "edgecdec"
    
    url = f"http://localhost:5001/api/league/{league_id}/my-roster?username={username}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            
            print("🏈 Testing MyRoster Duplicate Fix")
            print("=" * 40)
            print(f"Username: {data.get('username')}")
            print(f"Total players: {data.get('total_players')}")
            print(f"Drafted this draft: {data.get('drafted_this_draft')}")
            
            # Check for duplicates by collecting all player_ids
            all_player_ids = []
            positions = data.get('positions', {})
            
            for position, players in positions.items():
                print(f"\n{position} ({len(players)} players):")
                for player in players:
                    player_id = player.get('player_id')
                    name = player.get('name')
                    status = player.get('status', 'unknown')
                    print(f"  - {name} ({player_id}) [{status}]")
                    all_player_ids.append(player_id)
            
            # Check for duplicates
            unique_ids = set(all_player_ids)
            if len(all_player_ids) != len(unique_ids):
                print(f"\n❌ DUPLICATES FOUND!")
                print(f"Total player entries: {len(all_player_ids)}")
                print(f"Unique players: {len(unique_ids)}")
                
                # Find which players are duplicated
                from collections import Counter
                id_counts = Counter(all_player_ids)
                duplicates = {pid: count for pid, count in id_counts.items() if count > 1}
                print(f"Duplicated player IDs: {duplicates}")
            else:
                print(f"\n✅ NO DUPLICATES FOUND!")
                print(f"All {len(all_player_ids)} player entries are unique")
                
        else:
            print(f"❌ API Error: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    test_roster_duplicates()
