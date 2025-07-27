# 🏷️ Redraft League Banner Addition

## 🎯 **Enhancement Added**
Added a "Redraft" banner for redraft leagues to provide clear visual distinction from Dynasty/Keeper leagues.

## ✅ **Implementation Details**

### **Visual Design**:
- **Dynasty/Keeper Badge**: Purple theme with Crown icon
- **Redraft Badge**: Green theme with RefreshCw icon
- **Consistent styling** with rounded corners and proper dark mode support

### **Code Changes**:

#### **1. Updated League Badge Logic** (`LeagueSelector.jsx`):
```javascript
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
```

#### **2. Added Icon Import**:
```javascript
import { ChevronDown, Trophy, Users, Calendar, Zap, Crown, RefreshCw } from 'lucide-react';
```

## 🎨 **Visual Comparison**

### **Dynasty/Keeper Leagues**:
- **Background**: Purple (`bg-purple-100` / `dark:bg-purple-900/30`)
- **Text**: Purple (`text-purple-800` / `dark:text-purple-300`)
- **Icon**: Crown 👑
- **Label**: "Dynasty/Keeper"

### **Redraft Leagues**:
- **Background**: Green (`bg-green-100` / `dark:bg-green-900/30`)
- **Text**: Green (`text-green-800` / `dark:text-green-300`)
- **Icon**: RefreshCw 🔄
- **Label**: "Redraft"

## 🌙 **Dark Mode Support**
Both badges include full dark mode styling:
- **Light backgrounds** become **semi-transparent dark variants**
- **Dark text colors** become **lighter variants** for proper contrast
- **Consistent visual hierarchy** maintained in both themes

## 📋 **Expected Results**

### **edgecdec's Leagues**:
- 🔄 **Guillotine League** → Green "Redraft" badge
- 👑 **Forever League** → Purple "Dynasty/Keeper" badge  
- 🔄 **Graham's Football Fantasy** → Green "Redraft" badge
- 👑 **Graham's Duplicate Dynasty** → Purple "Dynasty/Keeper" badge
- 🔄 **$AMZN #OneRSU 2025** → Green "Redraft" badge

## 🎯 **User Benefits**

### **Clear Visual Distinction**:
- **Immediate identification** of league type
- **Color-coded system** for quick recognition
- **Consistent iconography** (Crown for Dynasty, Refresh for Redraft)

### **Better User Experience**:
- **No more guessing** about league format
- **Visual consistency** with the app's design system
- **Accessible color choices** that work in both light and dark modes

### **Professional Appearance**:
- **Polished UI** with proper badge styling
- **Semantic color usage** (purple for premium/dynasty, green for standard/redraft)
- **Consistent spacing and typography**

## 🚀 **Result**

The league selector now provides clear visual feedback for all league types:

```
🏈 League Dropdown:
🔄 Guillotine League [Redraft]
👑 Forever League [Dynasty/Keeper]  
🔄 Graham's Football Fantasy [Redraft]
👑 Graham's Duplicate Dynasty [Dynasty/Keeper]
🔄 $AMZN #OneRSU 2025 [Redraft]
```

Users can now instantly distinguish between redraft and dynasty/keeper leagues with clear, color-coded badges! 🎉
