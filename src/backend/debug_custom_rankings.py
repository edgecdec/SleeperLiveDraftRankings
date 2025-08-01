#!/usr/bin/env python3
"""
Debug script for custom rankings issues
"""

import requests
import json

BASE_URL = "http://localhost:5001"

def debug_custom_rankings():
    """Debug custom rankings functionality"""
    print("🔍 Debugging Custom Rankings Issues")
    print("=" * 50)
    
    # Test 1: Check debug endpoint
    print("\n1. Testing DEBUG endpoint")
    try:
        response = requests.get(f"{BASE_URL}/api/rankings/debug")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            debug_info = data.get('debug_info', {})
            print(f"   Custom rankings count: {debug_info.get('custom_rankings_count', 0)}")
            print(f"   Available format keys: {debug_info.get('available_formats_keys', [])}")
            print(f"   Manual override: {debug_info.get('manual_override')}")
            
            sample = debug_info.get('custom_rankings_sample', [])
            if sample:
                print(f"   Sample ranking fields: {list(sample[0].keys())}")
                print(f"   Sample display_name: {sample[0].get('display_name', 'MISSING')}")
                print(f"   Sample id: {sample[0].get('id', 'MISSING')}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    
    # Test 2: Check custom rankings list
    print("\n2. Testing custom rankings list")
    try:
        response = requests.get(f"{BASE_URL}/api/rankings/custom")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Success: {data.get('success')}")
            print(f"   Total count: {data.get('total_count', 0)}")
            rankings = data.get('rankings', [])
            if rankings:
                print(f"   First ranking: {rankings[0].get('display_name', 'NO NAME')}")
                print(f"   First ranking ID: {rankings[0].get('id', 'NO ID')}")
        else:
            print(f"   Error response: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    
    # Test 3: Test selection (if we have rankings)
    print("\n3. Testing custom rankings selection")
    try:
        # First get the list to find an ID
        response = requests.get(f"{BASE_URL}/api/rankings/custom")
        if response.status_code == 200:
            data = response.json()
            rankings = data.get('rankings', [])
            if rankings:
                test_id = rankings[0].get('id')
                print(f"   Testing selection with ID: {test_id}")
                
                # Try to select it
                select_data = {
                    'type': 'custom',
                    'id': test_id
                }
                response = requests.post(f"{BASE_URL}/api/rankings/select", 
                                       json=select_data,
                                       headers={'Content-Type': 'application/json'})
                print(f"   Selection status: {response.status_code}")
                print(f"   Selection response: {response.text}")
            else:
                print("   No custom rankings found to test selection")
        else:
            print("   Could not get rankings list for selection test")
    except Exception as e:
        print(f"   Exception: {e}")
    
    print("\n✅ Debug completed!")

if __name__ == "__main__":
    debug_custom_rankings()
