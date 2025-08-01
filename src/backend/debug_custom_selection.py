#!/usr/bin/env python3
"""
Debug script to test custom rankings selection flow
"""

import requests
import json

BASE_URL = "http://localhost:5001"

def debug_custom_selection():
    """Debug the custom rankings selection process"""
    print("🔍 Debugging Custom Rankings Selection")
    print("=" * 50)
    
    # Step 1: Get available custom rankings
    print("\n1. Getting available custom rankings...")
    try:
        response = requests.get(f"{BASE_URL}/api/rankings/custom")
        if response.status_code == 200:
            data = response.json()
            rankings = data.get('rankings', [])
            if rankings:
                test_ranking = rankings[0]
                print(f"   Found ranking: {test_ranking['display_name']}")
                print(f"   ID: {test_ranking['id']}")
                print(f"   Exists: {test_ranking['exists']}")
                
                # Step 2: Try to select it
                print(f"\n2. Selecting custom ranking: {test_ranking['id']}")
                select_data = {
                    'type': 'custom',
                    'id': test_ranking['id']
                }
                
                response = requests.post(f"{BASE_URL}/api/rankings/select", 
                                       json=select_data,
                                       headers={'Content-Type': 'application/json'})
                
                print(f"   Selection status: {response.status_code}")
                result = response.json()
                print(f"   Selection result: {json.dumps(result, indent=2)}")
                
                if result.get('success'):
                    # Step 3: Check if it's reflected in draft data
                    print(f"\n3. Checking draft data to see if custom rankings are used...")
                    
                    # Try to get draft data (you'll need a draft ID for this)
                    # For now, let's just check the rankings status
                    response = requests.get(f"{BASE_URL}/api/rankings/status")
                    if response.status_code == 200:
                        status_data = response.json()
                        print(f"   Rankings status: {json.dumps(status_data, indent=2)}")
                    
                    # Check debug endpoint
                    response = requests.get(f"{BASE_URL}/api/rankings/debug")
                    if response.status_code == 200:
                        debug_data = response.json()
                        manual_override = debug_data.get('debug_info', {}).get('manual_override')
                        print(f"   Manual override: {manual_override}")
                        
                        if manual_override and manual_override[0] == 'custom':
                            print("   ✅ Custom rankings override is set correctly!")
                        else:
                            print("   ❌ Custom rankings override is not set correctly")
                else:
                    print(f"   ❌ Selection failed: {result.get('error')}")
            else:
                print("   No custom rankings found to test")
        else:
            print(f"   Error getting custom rankings: {response.status_code}")
    except Exception as e:
        print(f"   Exception: {e}")
    
    print("\n✅ Debug completed!")

if __name__ == "__main__":
    debug_custom_selection()
