import React, { useRef } from 'react';
import { Upload, Download } from 'lucide-react';

/**
 * Component for uploading custom rankings CSV files
 * Currently disabled - Coming Soon
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
    // Disabled for now
    window.alert('Custom rankings upload is coming soon! Please use FantasyPros rankings for now.');
    return;
    // fileInputRef.current?.click();
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <Upload className="w-5 h-5 mr-2 text-gray-400 dark:text-gray-500" />
        Upload Custom Rankings
        <span className="ml-3 text-sm font-normal text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
          Coming Soon
        </span>
      </h3>
      
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4 opacity-60">
        {/* Coming Soon Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
            <h4 className="text-lg font-medium text-blue-800 dark:text-blue-200">
              Custom Rankings Upload
            </h4>
          </div>
          <p className="text-blue-700 dark:text-blue-300 mb-2">
            This feature is currently under development and will be available soon!
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            For now, please use the FantasyPros rankings below which are automatically updated and ready to use.
          </p>
        </div>

        {/* Disabled form elements */}
        <div className="space-y-4 pointer-events-none opacity-50">
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
                className="flex items-center space-x-2 px-3 py-1 text-xs bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors pointer-events-none opacity-50"
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
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
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
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
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
              disabled
            />
            <button
              onClick={handleFileSelect}
              disabled={true}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors w-full justify-center bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              <span>Coming Soon - Choose CSV File</span>
            </button>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p className="font-medium mb-1">Required CSV columns:</p>
            <p>Overall Rank, Name, Position, Team, Bye, Position Rank, Tier</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingsUploadForm;