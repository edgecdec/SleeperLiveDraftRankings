import React from 'react';
import { X, Moon, Sun, Monitor, Sparkles, Bug } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';

const SettingsModal = ({ isOpen, onClose }) => {
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const { rainbowEffectsEnabled, toggleRainbowEffects, debugModeEnabled, toggleDebugMode } = useSettings();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Theme Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Appearance
            </h3>
            <div className="space-y-2">
              {/* Light Mode */}
              <button
                onClick={() => !isDarkMode || toggleTheme()}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors duration-200 ${
                  !isDarkMode
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Sun className="w-5 h-5" />
                  <span className="font-medium">Light</span>
                </div>
                {!isDarkMode && (
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                )}
              </button>

              {/* Dark Mode */}
              <button
                onClick={() => isDarkMode || toggleTheme()}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors duration-200 ${
                  isDarkMode
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Moon className="w-5 h-5" />
                  <span className="font-medium">Dark</span>
                </div>
                {isDarkMode && (
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                )}
              </button>
            </div>
          </div>

          {/* Draft Settings Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Draft Settings
            </h3>
            <div className="space-y-2">
              {/* Rainbow Effects Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">Rainbow Effects</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Animated rainbow borders for top-tier players
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleRainbowEffects}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    rainbowEffectsEnabled
                      ? 'bg-primary-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      rainbowEffectsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Debug Mode Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center space-x-3">
                  <Bug className="w-5 h-5 text-orange-500" />
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">Debug Mode</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Show debug information panel
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleDebugMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    debugModeEnabled
                      ? 'bg-primary-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      debugModeEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors duration-200"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
