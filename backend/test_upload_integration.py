#!/usr/bin/env python3
"""
Test script for upload functionality integration
"""

import requests
import json
import os

BASE_URL = "http://localhost:5001"

def test_upload_endpoints():
    """Test that upload endpoints are working"""
    print("🧪 Testing Upload Integration")
    print("=" * 50)
    
    # Test 1: Get custom rankings list (now in rankings routes)
    print("\n1. Testing GET /api/rankings/custom")
    try:
        response = requests.get(f"{BASE_URL}/api/rankings/custom")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Found {data.get('total_count', 0)} custom rankings")
            if data.get('rankings'):
                for ranking in data['rankings'][:3]:  # Show first 3
                    print(f"   - {ranking['display_name']} ({ranking['player_count']} players)")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    
    # Test 2: Get rankings formats (should include custom if any exist)
    print("\n2. Testing GET /api/rankings/formats")
    try:
        response = requests.get(f"{BASE_URL}/api/rankings/formats")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Available formats: {list(data.keys())}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    
    # Test 3: Test upload endpoint (without actually uploading)
    print("\n3. Testing POST /api/rankings/upload (validation only)")
    try:
        # Test with no file
        response = requests.post(f"{BASE_URL}/api/rankings/upload")
        print(f"   Status (no file): {response.status_code}")
        if response.status_code == 400:
            print("   ✅ Correctly rejected request with no file")
        else:
            print(f"   ❌ Unexpected response: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    
    # Test 4: Mock draft endpoints (should still work)
    print("\n4. Testing GET /api/mock-draft/config")
    try:
        response = requests.get(f"{BASE_URL}/api/mock-draft/config")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Mock draft configured: {bool(data.get('config'))}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    
    print("\n✅ Upload integration test completed!")

if __name__ == "__main__":
    test_upload_endpoints()
