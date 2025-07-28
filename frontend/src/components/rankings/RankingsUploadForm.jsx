import React, { useRef } from 'react';
import { Upload, Download } from 'lucide-react';
import clsx from 'clsx';

/**
 * Component for uploading custom rankings CSV files
 */
const RankingsUploadForm = ({
  uploadName,
  setUploadName,
  uploadDescription,
  setUploadDescription,
  uploadProgress,
  onFileUpload
}) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <Upload className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
        Upload Custom Rankings
      </h3>
      
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
        {/* Example CSV Download */}
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                Need help formatting your CSV?
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                Download our example CSV with the correct headers and format
              </p>
            </div>
            <a
              href="/example_rankings.csv"
              download="example_rankings.csv"
              className="flex items-center space-x-2 px-3 py-1 text-xs bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>Download Example</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rankings Name *
            </label>
            <input
              type="text"
              value={uploadName}
              onChange={(e) => setUploadName(e.target.value)}
              placeholder="e.g., My Custom Rankings"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              placeholder="e.g., Week 1 rankings with injury updates"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileUpload}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={handleFileSelect}
            disabled={uploadProgress}
            className={clsx(
              'flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors w-full justify-center',
              uploadProgress
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600'
            )}
          >
            <Upload className="w-4 h-4" />
            <span>{uploadProgress ? 'Uploading...' : 'Choose CSV File'}</span>
          </button>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p className="font-medium mb-1">Required CSV columns:</p>
          <p>Overall Rank, Name, Position, Team, Bye, Position Rank, Tier</p>
        </div>
      </div>
    </div>
  );
};

export default RankingsUploadForm;