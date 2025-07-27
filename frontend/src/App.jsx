import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import UserSetup from './components/UserSetup';
import DraftView from './components/DraftView';
import { ThemeProvider } from './contexts/ThemeContext';

// Component to handle backward compatibility redirect
const LegacyDraftRedirect = () => {
  const { draftId } = useParams();
  return <Navigate to={`/sleeper/league/unknown/draft/${draftId}`} replace />;
};

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Home/Setup Page */}
          <Route path="/" element={<UserSetup />} />
          
          {/* User Profile Page */}
          <Route path="/user/:username" element={<UserSetup />} />
          
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
    </ThemeProvider>
  );
};

export default App;
