import React from 'react';
import { X, Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const SettingsModal = ({ isOpen, onClose }) => {
  const { isDarkMode, toggleTheme, theme } = useTheme();

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

          {/* Additional Settings Section (placeholder for future features) */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Draft Settings
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Additional draft settings will be available here in future updates.
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
