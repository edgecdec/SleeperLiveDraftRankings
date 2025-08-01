# 🔧 Dynasty/Keeper League Detection Fix

## 🐛 Problem Identified

**Issue**: All leagues were being incorrectly classified as "Dynasty/Keeper" even when they had 0 keepers, including the Guillotine league which is clearly a redraft league.

## 🔍 Root Cause Analysis

### **Backend Issues**:
1. **Overly Broad `max_keepers` Check**: Any league with `max_keepers > 0` was classified as keeper, but Sleeper sets `max_keepers = 1` as a default even for redraft leagues
2. **Incorrect `previous_league_id` Logic**: Any league with a previous league ID was assumed to be dynasty/keeper, but this could just be annual league continuation
3. **No Actual Keeper Verification**: The system didn't check if keepers were actually being used

### **Frontend Issues**:
- Same flawed logic as backend: `max_keepers > 0` triggered "Dynasty/Keeper" badge

## ✅ Solution Implemented

### **1. Backend Fix (`app.py`)**

#### **Improved Dynasty Detection**:
```python
# Check for dynasty indicators
league_type = settings.get('type', 0)
if league_type == 2:  # Dynasty league type
    return True

# Check for taxi squad (dynasty feature)  
taxi_slots = settings.get('taxi_slots', 0)
if taxi_slots > 0:
    return True
```

#### **Smarter Previous League Logic**:
```python
# Only consider previous_league_id as dynasty/keeper if combined with other indicators
if prev_league:
    if max_keepers > 1 or taxi_slots > 0 or league_type == 2:
        return True  # Has previous league + other dynasty indicators
    else:
        # Likely just annual redraft continuation
        return False
```

#### **Actual Keeper Verification**:
```python
# Check for ACTUAL keepers being used
if max_keepers > 0 and league_id:
    rosters = SleeperAPI.get_league_rosters(league_id)
    actual_keepers = 0
    for roster in rosters:
        keepers = roster.get('keepers', [])
        if keepers and len(keepers) > 0:
            actual_keepers += len(keepers)
    
    if actual_keepers > 0:
        return True  # Found actual keepers
    else:
        return False  # No actual keepers despite max_keepers setting
```

### **2. Frontend Fix (`LeagueSelector.jsx`)**

#### **Conservative Keeper Detection**:
```javascript
// Only consider it a keeper league if max_keepers > 1
// This helps avoid false positives from default Sleeper settings
if (settings.max_keepers > 1) return true;
```

## 🧪 Test Results

### **Before Fix**:
```json
{
  "is_dynasty_keeper": true,
  "league_name": "Guillotine League"
}
```

### **After Fix**:
```json
{
  "is_dynasty_keeper": false,
  "league_name": "Guillotine League"
}
```

### **Debug Output Shows Correct Logic**:
```
🔍 DEBUG: League type = 0 (redraft)
🔍 DEBUG: Taxi slots = 0 (no taxi)
🔍 DEBUG: Max keepers = 1 (default setting)
🔍 DEBUG: Previous league ID = 1121616321009070080
📝 Previous league found but no keeper/dynasty indicators - likely annual redraft continuation
🏈 Redraft league detected: no dynasty/keeper indicators found
```

## 🎯 Detection Logic Summary

### **Dynasty League Indicators** (Definitive):
- ✅ `league_type == 2` (Sleeper dynasty type)
- ✅ `taxi_slots > 0` (Dynasty-specific feature)

### **Keeper League Indicators** (Verified):
- ✅ `actual_keepers > 0` (Players actually kept)
- ✅ `max_keepers > 1` (If can't verify actual keepers)

### **Continuation Indicators** (Context-Dependent):
- ⚠️ `previous_league_id` + other dynasty/keeper indicators = Dynasty/Keeper
- ✅ `previous_league_id` alone = Annual redraft continuation

### **False Positives Eliminated**:
- ❌ `max_keepers = 1` (Default Sleeper setting)
- ❌ `previous_league_id` alone (Could be annual redraft)

## 🚀 Impact

### **Accurate Classification**:
- **Redraft leagues** (like Guillotine) correctly show as redraft
- **Dynasty leagues** with `type=2` or taxi slots correctly detected
- **Keeper leagues** with actual keepers correctly identified
- **Annual continuations** no longer misclassified

### **User Experience**:
- No more confusing "Dynasty/Keeper" badges on redraft leagues
- Accurate league type display in UI
- Proper rankings filtering (dynasty leagues filter rostered players)

### **System Reliability**:
- Robust detection logic with fallbacks
- Comprehensive debug logging for troubleshooting
- Handles edge cases and API errors gracefully

## 🔄 Verification Steps

1. **Guillotine League**: ✅ Now correctly shows as redraft
2. **Dynasty Leagues**: ✅ Still correctly detected (type=2, taxi slots)
3. **Keeper Leagues**: ✅ Verified by actual keeper usage
4. **Annual Redrafts**: ✅ Previous league ID doesn't trigger false positive

## 🎉 Result

The dynasty/keeper detection system now accurately distinguishes between:
- **True Dynasty leagues** (type=2, taxi squads)
- **True Keeper leagues** (actual keepers in use)
- **Annual Redraft continuations** (previous league but no keepers)
- **Standard Redraft leagues** (no dynasty/keeper indicators)

Users will now see accurate league classifications without false "Dynasty/Keeper" labels on their redraft leagues! 🏈
