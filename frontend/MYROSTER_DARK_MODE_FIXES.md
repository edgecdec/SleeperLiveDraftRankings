# MyRoster Dark Mode Fixes

## Issue Identified
Individual player rows in the MyRoster component were missing dark mode styling, causing poor visibility and inconsistent theming in dark mode.

## Areas Fixed

### 1. **Player Status Colors** (`getStatusColor`)
Updated status-based styling for different player states:

#### **Before** (Light mode only):
```css
drafted: text-green-700 bg-green-50 border-green-200
taxi: text-blue-600 bg-blue-50 border-blue-200  
reserve: text-red-600 bg-red-50 border-red-200
rostered: text-gray-700 bg-white border-gray-200
```

#### **After** (Light + Dark mode):
```css
drafted: text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800
taxi: text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800
reserve: text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800
rostered: text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700
```

### 2. **Position Colors** (`getPositionColor`)
Enhanced position-based text colors for player names:

#### **Before** (Light mode only):
```css
red: text-red-700
green: text-green-700
blue: text-blue-700
yellow: text-yellow-700
purple: text-purple-700
gray: text-gray-700
```

#### **After** (Light + Dark mode):
```css
red: text-red-700 dark:text-red-400
green: text-green-700 dark:text-green-400
blue: text-blue-700 dark:text-blue-400
yellow: text-yellow-700 dark:text-yellow-400
purple: text-purple-700 dark:text-purple-400
gray: text-gray-700 dark:text-gray-300
```

### 3. **Position Badges in Bench Section**
Fixed position badge styling logic that was causing color conflicts:

#### **Before** (Problematic logic):
```javascript
getPositionColor(player.originalPosition).replace('text-', 'text-')
```

#### **After** (Clean implementation):
```javascript
getPositionColor(player.originalPosition)
```

## Player Row Elements Now Supporting Dark Mode

### **Starters Section**
- ✅ Player name colors (position-based)
- ✅ Team name text
- ✅ Status backgrounds and borders
- ✅ Rank badges
- ✅ Pick number text
- ✅ Status icons (already supported)

### **Bench Section**  
- ✅ Player name colors (position-based)
- ✅ Position badges with proper backgrounds
- ✅ Team name text
- ✅ Status backgrounds and borders
- ✅ Rank badges
- ✅ Pick number text

### **Empty Slots**
- ✅ Empty starter slots (already supported)
- ✅ Empty bench slots (already supported)

## Status Legend Colors

### **Player Status Types**:
- **Drafted** (Green): Recently drafted players
- **Taxi** (Blue): Taxi squad players (Dynasty leagues)
- **Reserve** (Red): Injured Reserve players
- **Rostered** (Gray): Regular rostered players

### **Dark Mode Adaptations**:
- **Backgrounds**: Semi-transparent overlays (`/20` opacity)
- **Text Colors**: Lighter variants for better contrast
- **Borders**: Darker variants to maintain definition

## Visual Improvements

### **Better Contrast**
- Player names now properly visible in dark mode
- Status indicators have appropriate contrast ratios
- Position badges maintain readability

### **Consistent Theming**
- All player elements follow the same dark mode patterns
- Colors harmonize with the overall app theme
- Status colors remain intuitive across themes

## Testing Checklist

- [ ] Player names visible in both light and dark modes
- [ ] Status backgrounds show appropriate colors
- [ ] Position badges have proper contrast
- [ ] Rank badges are readable
- [ ] Team names are clearly visible
- [ ] Pick numbers display correctly
- [ ] All status types (drafted, taxi, reserve, rostered) work properly

## Result

Individual players in the MyRoster component now have complete dark mode support, providing:
- **Better readability** in dark environments
- **Consistent visual hierarchy** across themes  
- **Proper contrast ratios** for accessibility
- **Seamless theme switching** without visual artifacts
