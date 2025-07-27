# 🏷️ Dynasty/Keeper Badges in "Select a League & Draft"

## 🎯 **Enhancement Added**
Added Dynasty/Keeper and Redraft badges to the "Select a League & Draft" section in UserSetup component for consistent visual identification across the entire app.

## ✅ **Implementation Details**

### **Location**: UserSetup.jsx - League Selection Cards
The badges now appear next to each league name in the league selection cards, providing immediate visual feedback about league type.

### **Code Changes**:

#### **1. Added Icon Imports**:
```javascript
import { Search, User, Trophy, Calendar, Users, Zap, AlertCircle, Crown, RefreshCw } from 'lucide-react';
```

#### **2. Added Dynasty/Keeper Detection Function**:
```javascript
const isDynastyOrKeeperLeague = (league) => {
  const settings = league.settings || {};
  
  // Dynasty league type
  if (settings.type === 2) return true;
  
  // Has taxi squad (dynasty feature)
  if (settings.taxi_slots > 0) return true;
  
  // Conservative keeper detection (max_keepers > 1)
  if (settings.max_keepers > 1) return true;
  
  // Previous league + other indicators
  if (league.previous_league_id) {
    if (settings.max_keepers > 1 || settings.taxi_slots > 0 || settings.type === 2) {
      return true;
    }
  }
  
  // Check draft metadata for dynasty scoring
  if (league.drafts && league.drafts.length > 0) {
    const draft = league.drafts[0];
    if (draft.metadata && draft.metadata.scoring_type && 
        draft.metadata.scoring_type.includes('dynasty')) {
      return true;
    }
  }
  
  return false;
};
```

#### **3. Updated League Display with Badges**:
```javascript
<div className="flex items-center space-x-3">
  <h4 className="text-lg font-medium text-gray-900 dark:text-white">{league.name}</h4>
  {isDynastyOrKeeperLeague(league) ? (
    // Dynasty/Keeper Badge (Purple)
    <div className="flex items-center space-x-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-xs font-medium">
      <Crown className="w-3 h-3" />
      <span>Dynasty/Keeper</span>
    </div>
  ) : (
    // Redraft Badge (Green)
    <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">
      <RefreshCw className="w-3 h-3" />
      <span>Redraft</span>
    </div>
  )}
</div>
```

## 🎨 **Visual Design**

### **Consistent Styling**:
- **Same badge design** as LeagueSelector dropdown
- **Purple theme** for Dynasty/Keeper leagues (Crown icon)
- **Green theme** for Redraft leagues (RefreshCw icon)
- **Full dark mode support** with proper contrast

### **Layout Integration**:
- **Positioned next to league name** for immediate identification
- **Proper spacing** with other league information
- **Responsive design** that works on all screen sizes

## 📋 **Expected User Experience**

### **Before Enhancement**:
```
🏈 Select a League & Draft:
┌─────────────────────────────────────┐
│ Guillotine League              12 teams │
│ Standard • Season 2025                  │
│ Available Drafts: Snake Draft          │
└─────────────────────────────────────┘
```

### **After Enhancement**:
```
🏈 Select a League & Draft:
┌─────────────────────────────────────┐
│ Guillotine League [🔄 Redraft]  12 teams │
│ Standard • Season 2025                  │
│ Available Drafts: Snake Draft          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Forever League [👑 Dynasty/Keeper] 12 teams │
│ Standard • Season 2025                  │
│ Available Drafts: Snake Draft          │
└─────────────────────────────────────┘
```

## 🎯 **User Benefits**

### **Consistent Experience**:
- **Same visual language** across league selector dropdown and setup page
- **Immediate league type identification** without needing to remember
- **Professional, polished appearance**

### **Better Decision Making**:
- **Clear distinction** between league types when selecting
- **Visual confirmation** of league format before entering draft
- **Reduced confusion** about league rules and expectations

### **Accessibility**:
- **Color-coded system** with meaningful icons
- **High contrast** in both light and dark modes
- **Semantic color usage** (purple = premium, green = standard)

## 🔄 **Consistency Across Components**

### **LeagueSelector Dropdown**:
- ✅ Dynasty/Keeper and Redraft badges
- ✅ Purple and green color scheme
- ✅ Crown and RefreshCw icons

### **UserSetup League Cards**:
- ✅ Dynasty/Keeper and Redraft badges
- ✅ Purple and green color scheme  
- ✅ Crown and RefreshCw icons
- ✅ Same detection logic

## 🚀 **Result**

Users now see consistent dynasty/keeper vs redraft identification in both:
1. **League selection dropdown** (when switching leagues)
2. **Initial league setup page** (when first selecting a league)

This provides a seamless, professional experience with clear visual feedback about league types throughout the entire app! 🎉

### **Expected Display for edgecdec's leagues**:
- 🔄 **Guillotine League** [Redraft]
- 👑 **Forever League** [Dynasty/Keeper]
- 🔄 **Graham's Football Fantasy** [Redraft]
- 👑 **Graham's Duplicate Dynasty** [Dynasty/Keeper]
- 🔄 **$AMZN #OneRSU 2025** [Redraft]
