#!/usr/bin/env python3

import requests
import json

# Test the my-roster endpoint with a league that has DST players
def test_dst_roster():
    # You'll need to replace these with actual values from your league
    league_id = "YOUR_LEAGUE_ID"  # Replace with actual league ID
    username = "YOUR_USERNAME"    # Replace with actual username
    
    url = f"http://localhost:5000/api/league/{league_id}/my-roster"
    params = {
        'username': username
    }
    
    try:
        response = requests.get(url, params=params)
        if response.status_code == 200:
            data = response.json()
            
            print("=== MY ROSTER TEST ===")
            print(f"Total players: {len(data.get('all_players', []))}")
            
            # Look for DST players specifically
            dst_players = [p for p in data.get('all_players', []) if p.get('position') == 'DST']
            print(f"DST players found: {len(dst_players)}")
            
            for dst in dst_players:
                print(f"  - {dst.get('name')} ({dst.get('team')}) - Status: {dst.get('status')}")
                
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"Error testing roster: {e}")

# Test Sleeper API directly to see DST data
def test_sleeper_dst_data():
    print("\n=== SLEEPER DST DATA TEST ===")
    
    # Get all players from Sleeper
    response = requests.get("https://api.sleeper.app/v1/players/nfl")
    if response.status_code == 200:
        all_players = response.json()
        
        # Find DST players
        dst_players = {k: v for k, v in all_players.items() if v.get('position') == 'DEF'}
        
        print(f"Total DST players in Sleeper: {len(dst_players)}")
        
        # Show a few examples
        for i, (player_id, player_data) in enumerate(list(dst_players.items())[:5]):
            first_name = player_data.get('first_name', '')
            last_name = player_data.get('last_name', '')
            full_name = f"{first_name} {last_name}" if first_name and last_name else "N/A"
            
            print(f"  {i+1}. ID: {player_id}")
            print(f"     Team: {player_data.get('team', 'N/A')}")
            print(f"     Constructed Name: {full_name}")
            print(f"     Position: {player_data.get('position', 'N/A')}")
            print()

if __name__ == "__main__":
    test_sleeper_dst_data()
    # Uncomment and fill in your league details to test roster
    # test_dst_roster()
