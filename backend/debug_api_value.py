#!/usr/bin/env python3
"""
Debug script to test API response with value column
"""

import requests
import json

BASE_URL = "http://localhost:5001"

def test_api_value_column():
    """Test if the API is returning value column data"""
    print("🔍 Testing API Value Column Response")
    print("=" * 50)
    
    # First, let's check if we have any custom rankings
    print("\n1. Checking custom rankings...")
    try:
        response = requests.get(f"{BASE_URL}/api/rankings/custom")
        if response.status_code == 200:
            data = response.json()
            rankings = data.get('rankings', [])
            if rankings:
                print(f"   Found {len(rankings)} custom rankings")
                for ranking in rankings[:2]:  # Show first 2
                    print(f"   - {ranking['display_name']} ({ranking['id']})")
            else:
                print("   No custom rankings found")
        else:
            print(f"   Error: {response.status_code}")
    except Exception as e:
        print(f"   Exception: {e}")
    
    # Try to get draft data (this will require a draft ID)
    print("\n2. Testing draft data API...")
    try:
        # Try a mock draft ID
        response = requests.get(f"{BASE_URL}/api/draft/123456789")
        print(f"   Draft API status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            # Check if we have available players
            available_players = data.get('available_players', [])
            print(f"   Available players: {len(available_players)}")
            
            if available_players:
                # Check first few players for value attribute
                print("\n   Checking first 3 players for value attribute:")
                for i, player in enumerate(available_players[:3]):
                    print(f"   Player {i+1}: {player.get('name', 'NO NAME')}")
                    print(f"     Position: {player.get('position', 'NO POS')}")
                    print(f"     Team: {player.get('team', 'NO TEAM')}")
                    print(f"     Rank: {player.get('rank', 'NO RANK')}")
                    print(f"     Tier: {player.get('tier', 'NO TIER')}")
                    print(f"     Value: {player.get('value', 'NO VALUE')}")
                    print(f"     Has value key: {'value' in player}")
                    print()
            else:
                print("   No available players in response")
                
        else:
            print(f"   Draft API error: {response.text}")
            
    except Exception as e:
        print(f"   Exception: {e}")
    
    print("\n✅ API value column test completed!")

if __name__ == "__main__":
    test_api_value_column()
