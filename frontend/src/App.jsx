import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import EnhancedUserSetup from './components/EnhancedUserSetup';
import DraftView from './components/DraftView';
import { ThemeProvider } from './contexts/ThemeContext';
import { SettingsProvider } from './contexts/SettingsContext';

// Component to handle backward compatibility redirect
const LegacyDraftRedirect = () => {
  const { draftId } = useParams();
  return <Navigate to={`/sleeper/league/unknown/draft/${draftId}`} replace />;
};

const App = () => {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <Router>
          <Routes>
            {/* Home/Setup Page */}
            <Route path="/" element={<EnhancedUserSetup />} />
            
            {/* User Profile Page */}
            <Route path="/user/:username" element={<EnhancedUserSetup />} />
            
            {/* Draft View - Main Feature */}
            <Route path="/:platform/league/:leagueId/draft/:draftId" element={<DraftView />} />
            
            {/* League Overview (Future) - redirect to home for now */}
            <Route path="/:platform/league/:leagueId" element={<Navigate to="/" replace />} />
            
            {/* Backward Compatibility Redirects */}
            <Route path="/draft/:draftId" element={<LegacyDraftRedirect />} />
            
            {/* Catch-all redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </SettingsProvider>
    </ThemeProvider>
  );
};

export default App;
