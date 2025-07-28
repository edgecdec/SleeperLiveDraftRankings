import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  // Initialize settings from localStorage or defaults
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('draftAppSettings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {
        console.warn('Failed to parse saved settings:', e);
      }
    }
    
    // Default settings
    return {
      rainbowEffectsEnabled: true, // Default to enabled
      debugModeEnabled: false, // Default to disabled
    };
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('draftAppSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleRainbowEffects = () => {
    updateSetting('rainbowEffectsEnabled', !settings.rainbowEffectsEnabled);
  };

  const toggleDebugMode = () => {
    updateSetting('debugModeEnabled', !settings.debugModeEnabled);
  };

  const value = {
    settings,
    updateSetting,
    toggleRainbowEffects,
    toggleDebugMode,
    rainbowEffectsEnabled: settings.rainbowEffectsEnabled,
    debugModeEnabled: settings.debugModeEnabled
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};