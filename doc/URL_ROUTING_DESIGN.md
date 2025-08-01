# 🌐 URL Routing Design & Implementation Plan

## 🎯 **Proposed URL Structure**

### **Current State**: Single Page Application
- **URL**: `http://localhost:3000/`
- **Navigation**: State-based only
- **Sharing**: Not possible
- **Bookmarking**: Not supported

### **Proposed URL Structure**:

#### **1. Home/Setup Page**:
```
/
```
- Default landing page for user setup

#### **2. User Profile Page**:
```
/user/{username}
/user/{username}?season=2025
```
- Shows all leagues for a user
- Optional season parameter
- Example: `/user/edgecdec` or `/user/edgecdec?season=2024`

#### **3. League Overview**:
```
/{platform}/league/{leagueId}
/{platform}/league/{leagueId}?user={username}
```
- Shows league details and available drafts
- Platform-specific (sleeper, espn, yahoo, etc.)
- Optional user context for personalization
- Example: `/sleeper/league/1255160696174284800?user=edgecdec`

#### **4. Draft View (Current Main Feature)**:
```
/{platform}/league/{leagueId}/draft/{draftId}
/{platform}/league/{leagueId}/draft/{draftId}?user={username}
```
- Main draft interface with rankings
- Platform and user context preserved
- Example: `/sleeper/league/1255160696174284800/draft/1255160696186880000?user=edgecdec`

#### **5. Future Platform Support**:
```
/sleeper/...     (current)
/espn/...        (future)
/yahoo/...       (future)
/fleaflicker/... (future)
```

## 🏗️ **Implementation Strategy**

### **Phase 1: Install React Router**
```bash
npm install react-router-dom
```

### **Phase 2: URL Structure Implementation**

#### **App.jsx Router Setup**:
```javascript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Home/Setup */}
          <Route path="/" element={<UserSetup />} />
          
          {/* User Profile */}
          <Route path="/user/:username" element={<UserProfile />} />
          
          {/* League Overview */}
          <Route path="/:platform/league/:leagueId" element={<LeagueOverview />} />
          
          {/* Draft View */}
          <Route path="/:platform/league/:leagueId/draft/:draftId" element={<DraftView />} />
          
          {/* Redirects for backward compatibility */}
          <Route path="/draft/:draftId" element={<Navigate to={`/sleeper/league/unknown/draft/${draftId}`} replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
```

#### **URL Parameter Hooks**:
```javascript
// hooks/useUrlParams.js
import { useParams, useSearchParams } from 'react-router-dom';

export const useUrlParams = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  
  return {
    platform: params.platform || 'sleeper',
    username: params.username,
    leagueId: params.leagueId,
    draftId: params.draftId,
    season: searchParams.get('season') || '2025',
    user: searchParams.get('user')
  };
};
```

### **Phase 3: Component Updates**

#### **UserSetup Component**:
```javascript
import { useNavigate } from 'react-router-dom';

const UserSetup = () => {
  const navigate = useNavigate();
  
  const handleDraftSelect = (league, draft) => {
    // Navigate to draft view with full context
    navigate(`/sleeper/league/${league.league_id}/draft/${draft.draft_id}?user=${username}`);
  };
  
  const handleUserSearch = (username) => {
    // Navigate to user profile
    navigate(`/user/${username}`);
  };
};
```

#### **DraftView Component**:
```javascript
import { useUrlParams } from '../hooks/useUrlParams';
import { useNavigate } from 'react-router-dom';

const DraftView = () => {
  const { platform, leagueId, draftId, user } = useUrlParams();
  const navigate = useNavigate();
  
  // Load draft data based on URL parameters
  const { data, loading, error } = useDraftData(draftId);
  
  const handleLeagueChange = (newLeagueId, newDraftId) => {
    navigate(`/${platform}/league/${newLeagueId}/draft/${newDraftId}?user=${user}`);
  };
};
```

## 🔗 **URL Examples & Use Cases**

### **Shareable URLs**:
```
# Share a specific draft
https://app.com/sleeper/league/1255160696174284800/draft/1255160696186880000?user=edgecdec

# Share user's leagues
https://app.com/user/edgecdec

# Share league overview
https://app.com/sleeper/league/1255160696174284800?user=edgecdec
```

### **Bookmarkable States**:
- **User's leagues**: Bookmark `/user/edgecdec` for quick access
- **Specific draft**: Bookmark draft URL to return to exact state
- **League overview**: Bookmark league to see all drafts

### **Deep Linking**:
- **Direct draft access**: Send draft URL to league members
- **User onboarding**: Send user profile URL for easy setup
- **Cross-platform**: URLs work across devices and browsers

## 🚀 **Benefits**

### **User Experience**:
- ✅ **Shareable links** for drafts and leagues
- ✅ **Bookmarkable pages** for quick access
- ✅ **Browser back/forward** navigation
- ✅ **Deep linking** to specific states

### **Developer Experience**:
- ✅ **Clean URL structure** that's easy to understand
- ✅ **Platform extensibility** for future integrations
- ✅ **SEO-friendly** URLs (if made public)
- ✅ **State management** through URLs

### **Future Scalability**:
- ✅ **Multi-platform support** (ESPN, Yahoo, etc.)
- ✅ **API endpoint mapping** based on platform
- ✅ **Platform-specific features** and customizations
- ✅ **Consistent URL patterns** across platforms

## 🔄 **Migration Strategy**

### **Backward Compatibility**:
```javascript
// Redirect old state-based navigation to URLs
useEffect(() => {
  if (currentDraft && !window.location.pathname.includes('/draft/')) {
    navigate(`/sleeper/league/${currentDraft.leagueId}/draft/${currentDraft.draftId}?user=${username}`);
  }
}, [currentDraft]);
```

### **Gradual Implementation**:
1. **Phase 1**: Install React Router, basic routing
2. **Phase 2**: Update components to use URL parameters
3. **Phase 3**: Add navigation helpers and URL generation
4. **Phase 4**: Implement platform abstraction layer

## 🎯 **Implementation Priority**

### **High Priority** (Immediate):
1. **Install React Router**
2. **Basic draft URL routing**: `/{platform}/league/{leagueId}/draft/{draftId}`
3. **URL parameter extraction** in DraftView
4. **Navigation updates** in UserSetup

### **Medium Priority** (Next):
1. **User profile URLs**: `/user/{username}`
2. **League overview pages**: `/{platform}/league/{leagueId}`
3. **Search parameter handling**: `?user=username&season=2025`

### **Low Priority** (Future):
1. **Platform abstraction layer**
2. **Multi-platform API routing**
3. **Advanced URL features** (filters, sorting, etc.)

## 🧪 **Testing Strategy**

### **URL Navigation Tests**:
- ✅ Direct URL access works correctly
- ✅ Browser back/forward navigation
- ✅ URL parameter parsing and validation
- ✅ Redirect handling for invalid URLs

### **State Synchronization**:
- ✅ URL changes update component state
- ✅ Component state changes update URL
- ✅ Refresh preserves current state

## 🎉 **Expected Outcome**

Users will be able to:
1. **Share draft URLs** with league members
2. **Bookmark specific drafts** for quick access
3. **Navigate with browser controls** (back/forward)
4. **Access deep links** directly to any app state
5. **Future-proof** for multiple fantasy platforms

This creates a much more professional, shareable, and user-friendly experience! 🌐
