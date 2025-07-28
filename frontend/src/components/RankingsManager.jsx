import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
  Upload, 
  Download, 
  RefreshCw, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  FileText,
  Star,
  TrendingUp,
  Users,
  X
} from 'lucide-react';
import clsx from 'clsx';

const RankingsManager = ({ isOpen, onClose, currentDraft }) => {
  const [rankingsStatus, setRankingsStatus] = useState(null);
  const [availableFormats, setAvailableFormats] = useState(null);
  const [currentFormat, setCurrentFormat] = useState(null);
  const [customRankings, setCustomRankings] = useState([]);
  const [currentRankings, setCurrentRankings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updateInProgress, setUpdateInProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [selectedRankingType, setSelectedRankingType] = useState('fantasypros');
  const [selectedFormatKey, setSelectedFormatKey] = useState('');
  const [selectedCustomId, setSelectedCustomId] = useState('');
  const [uploadName, setUploadName] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteRankingId, setDeleteRankingId] = useState(null);
  
  const fileInputRef = useRef(null);

  // Fetch initial data when component opens
  useEffect(() => {
    if (isOpen) {
      fetchAllData();
    }
  }, [isOpen]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchRankingsStatus(),
        fetchAvailableFormats(),
        fetchCurrentFormat(),
        fetchCustomRankings(),
        fetchCurrentRankings()
      ]);
    } catch (error) {
      console.error('Error fetching rankings data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRankingsStatus = async () => {
    try {
      const response = await fetch('/api/rankings/status');
      const data = await response.json();
      setRankingsStatus(data);
      setUpdateInProgress(data.update_in_progress);
    } catch (error) {
      console.error('Error fetching rankings status:', error);
    }
  };

  const fetchAvailableFormats = async () => {
    try {
      const response = await fetch('/api/rankings/formats');
      const data = await response.json();
      setAvailableFormats(data);
    } catch (error) {
      console.error('Error fetching available formats:', error);
    }
  };

  const fetchCurrentFormat = async () => {
    try {
      const draftId = currentDraft?.draft_id;
      const url = draftId ? `/api/rankings/current-format?draft_id=${draftId}` : '/api/rankings/current-format';
      const response = await fetch(url);
      const data = await response.json();
      setCurrentFormat(data);
      
      // Set the selected format key based on current format
      if (data.format_key) {
        setSelectedFormatKey(data.format_key);
      }
    } catch (error) {
      console.error('Error fetching current format:', error);
    }
  };

  const fetchCustomRankings = async () => {
    try {
      const response = await fetch('/api/rankings/custom');
      const data = await response.json();
      setCustomRankings(data);
    } catch (error) {
      console.error('Error fetching custom rankings:', error);
    }
  };

  const fetchCurrentRankings = async () => {
    try {
      const response = await fetch('/api/rankings/current');
      const data = await response.json();
      setCurrentRankings(data);
    } catch (error) {
      console.error('Error fetching current rankings:', error);
    }
  };

  const handleUpdateRankings = async () => {
    setUpdateInProgress(true);
    try {
      const response = await fetch('/api/rankings/update', {
        method: 'POST',
      });
      const result = await response.json();
      
      if (response.ok) {
        if (result.success) {
          // Update started successfully
          // Wait a bit for the update to process, then refresh data
          setTimeout(async () => {
            await fetchAllData();
          }, 5000); // Wait 5 seconds then refresh
        } else if (result.in_progress) {
          // Update already in progress
          window.alert('Rankings update is already in progress. Please wait...');
          // Still refresh data after a delay in case it completes
          setTimeout(async () => {
            await fetchAllData();
          }, 10000); // Wait 10 seconds then refresh
        } else {
          window.alert(`Error: ${result.message || 'Unknown error'}`);
        }
      } else {
        window.alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating rankings:', error);
      window.alert('Failed to update rankings');
    } finally {
      setUpdateInProgress(false);
    }
  };

  const handleSelectRankings = async (type, id) => {
    try {
      const response = await fetch('/api/rankings/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, id }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        await fetchAllData();
        setSelectedRankingType(type);
        if (type === 'fantasypros') {
          setSelectedFormatKey(id);
        } else {
          setSelectedCustomId(id);
        }
        
        // Close modal and trigger roster refresh
        onClose();
        
        // Trigger a custom event to notify other components to refresh
        window.dispatchEvent(new CustomEvent('rankingsChanged', { 
          detail: { type, id } 
        }));
      } else {
        window.alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error selecting rankings:', error);
      window.alert('Failed to select rankings');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!uploadName.trim()) {
      window.alert('Please enter a name for your rankings');
      return;
    }

    setUploadProgress(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', uploadName);
      formData.append('description', uploadDescription);

      const response = await fetch('/api/rankings/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        await fetchCustomRankings();
        setUploadName('');
        setUploadDescription('');
        fileInputRef.current.value = '';
        window.alert('Rankings uploaded successfully!');
      } else {
        window.alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      window.alert('Failed to upload rankings');
    } finally {
      setUploadProgress(false);
    }
  };

  const handleDeleteCustomRankings = async (rankingId) => {
    setDeleteRankingId(rankingId);
    setShowDeleteConfirmation(true);
  };

  const executeDelete = async () => {
    if (!deleteRankingId) return;

    try {
      const response = await fetch(`/api/rankings/delete/${deleteRankingId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        await fetchCustomRankings();
      } else {
        window.alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting rankings:', error);
      window.alert('Failed to delete rankings');
    } finally {
      setShowDeleteConfirmation(false);
      setDeleteRankingId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setDeleteRankingId(null);
  };

  const getFormatDisplayName = (scoring, formatType) => {
    const scoringNames = {
      'standard': 'Standard',
      'half_ppr': 'Half PPR',
      'ppr': 'PPR'
    };
    const formatNames = {
      'standard': 'Standard',
      'superflex': 'Superflex'
    };
    return `${scoringNames[scoring]} ${formatNames[formatType]}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'updating':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Rankings Manager</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Manage your draft rankings and formats
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-blue-500 dark:text-blue-400 animate-spin" />
              <span className="ml-3 text-gray-600 dark:text-gray-300">Loading rankings data...</span>
            </div>
          ) : (
            <div className="p-6 space-y-8">
              {/* Custom Rankings Upload - Moved to top */}
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
                      onChange={handleFileUpload}
                      accept=".csv"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
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

                {/* Custom Rankings List */}
                {customRankings.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Your Custom Rankings</h4>
                    <div className="space-y-2">
                      {customRankings.map((ranking) => {
                        const isSelected = selectedRankingType === 'custom' && selectedCustomId === ranking.id;
                        const isCurrentFormat = currentFormat && currentFormat.source === 'custom' && currentFormat.rankings_filename === ranking.filename;
                        
                        return (
                          <div
                            key={ranking.id}
                            className={clsx(
                              'border rounded-lg p-3 transition-all relative',
                              isSelected
                                ? 'border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/30 ring-2 ring-purple-200 dark:ring-purple-400/50'
                                : isCurrentFormat
                                ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/30 ring-2 ring-green-200 dark:ring-green-400/50'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div 
                                className="flex-1 cursor-pointer"
                                onClick={() => handleSelectRankings('custom', ranking.id)}
                              >
                                <div className="flex items-center space-x-3">
                                  <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white">{ranking.name}</h4>
                                    {ranking.description && (
                                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{ranking.description}</p>
                                    )}
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      Uploaded: {ranking.upload_time_formatted || 'Unknown'}
                                    </p>
                                  </div>
                                  {isSelected && (
                                    <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                  )}
                                </div>
                              </div>
                              
                              <button
                                onClick={() => handleDeleteCustomRankings(ranking.id)}
                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                title="Delete custom rankings"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Current Status */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Current Rankings Status
                  </h3>
                  <button
                    onClick={handleUpdateRankings}
                    disabled={updateInProgress}
                    className={clsx(
                      'flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors',
                      updateInProgress
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
                    )}
                  >
                    <RefreshCw className={clsx('w-4 h-4', updateInProgress && 'animate-spin')} />
                    <span>{updateInProgress ? 'Updating...' : 'Update Rankings'}</span>
                  </button>
                </div>

                {rankingsStatus && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Rankings Status</span>
                        {getStatusIcon(rankingsStatus.update_in_progress ? 'updating' : 
                                     rankingsStatus.needs_update ? 'error' : 'success')}
                      </div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                        {rankingsStatus.needs_update ? 'Needs Update' : 'Current'}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Last Updated</span>
                        <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                        {rankingsStatus.last_update_time ? 
                          new Date(rankingsStatus.last_update_time).toLocaleString() : 
                          'Never'
                        }
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Players</span>
                        <Users className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                        {currentRankings.length || 0}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Your Custom Rankings - Show First */}
              {customRankings.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Upload className="w-5 h-5 mr-2 text-purple-500 dark:text-purple-400" />
                    Your Custom Rankings
                  </h3>
                  <div className="space-y-3">
                    {customRankings.map((ranking) => {
                      const isSelected = selectedRankingType === 'custom' && selectedCustomId === ranking.id;
                      const isCurrentFormat = currentFormat && currentFormat.source === 'custom' && currentFormat.rankings_filename === ranking.filename;
                      
                      return (
                        <div
                          key={ranking.id}
                          className={clsx(
                            'border rounded-lg p-4 transition-all relative cursor-pointer',
                            isSelected
                              ? 'border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/30 ring-2 ring-purple-200 dark:ring-purple-400/50'
                              : isCurrentFormat
                              ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/30 ring-2 ring-green-200 dark:ring-green-400/50'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                          )}
                          onClick={() => handleSelectRankings('custom', ranking.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {ranking.display_name || ranking.name}
                                  {isCurrentFormat && (
                                    <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-medium">
                                      (Active)
                                    </span>
                                  )}
                                </h4>
                                <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                                  Custom
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {ranking.description || 'Custom uploaded rankings'}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                <span>{ranking.player_count || 'Unknown'} players</span>
                                <span>Uploaded: {ranking.upload_time ? new Date(ranking.upload_time).toLocaleDateString() : 'Unknown'}</span>
                                {ranking.scoring_format && ranking.league_type && (
                                  <span>{ranking.scoring_format} • {ranking.league_type}</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCustomRankings(ranking.id);
                                }}
                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                title="Delete custom rankings"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* FantasyPros Rankings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500 dark:text-yellow-400" />
                  FantasyPros Rankings
                  {currentFormat && (
                    <span className="ml-3 text-sm font-normal text-gray-600 dark:text-gray-300">
                      Current: {getFormatDisplayName(currentFormat.scoring_format, currentFormat.league_type)}
                      {currentFormat.is_manual ? (
                        <span className="ml-1 text-blue-600 dark:text-blue-400">(Manual)</span>
                      ) : (
                        <span className="ml-1 text-green-600 dark:text-green-400">(Auto-detected)</span>
                      )}
                    </span>
                  )}
                </h3>
                
                {availableFormats && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(availableFormats).map(([scoring, formats]) => (
                      Object.entries(formats).map(([formatType, formatInfo]) => {
                        const formatKey = `${scoring}_${formatType}`;
                        const isSelected = selectedRankingType === 'fantasypros' && selectedFormatKey === formatKey;
                        const isCurrentFormat = currentFormat && currentFormat.format_key === formatKey;
                        
                        return (
                          <div
                            key={formatKey}
                            className={clsx(
                              'border rounded-lg p-4 cursor-pointer transition-all relative',
                              isSelected
                                ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-200 dark:ring-blue-400/50'
                                : isCurrentFormat
                                ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/30 ring-2 ring-green-200 dark:ring-green-400/50'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700',
                              !formatInfo.exists && 'opacity-60'
                            )}
                            onClick={() => handleSelectRankings('fantasypros', formatKey)}
                          >
                            {isCurrentFormat && (
                              <div className="absolute top-2 right-2">
                                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {getFormatDisplayName(scoring, formatType)}
                                  {isCurrentFormat && (
                                    <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-medium">
                                      {currentFormat.is_manual ? '(Active - Manual)' : '(Active - Auto)'}
                                    </span>
                                  )}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                  {formatInfo.filename}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className={clsx(
                                    'text-xs px-2 py-1 rounded-full',
                                    formatInfo.exists 
                                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                  )}>
                                    {formatInfo.exists ? 'Available' : 'Not Downloaded'}
                                  </span>
                                  {(formatInfo.timestamp || formatInfo.last_modified) && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      Updated: {formatInfo.timestamp ? 
                                        new Date(formatInfo.timestamp).toLocaleString() : 
                                        formatInfo.last_modified
                                      }
                                    </span>
                                  )}
                                </div>
                              </div>
                              {isSelected && (
                                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              )}
                            </div>
                          </div>
                        );
                      })
                    ))}
                  </div>
                )}
                
                {/* Auto-detection toggle */}
                {currentFormat && currentFormat.is_manual && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          Manual ranking selection is active. 
                          <span className="font-medium"> Current: {getFormatDisplayName(currentFormat.scoring_format, currentFormat.league_type)}</span>
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                          Switch back to automatic detection based on league settings?
                        </p>
                      </div>
                      <button
                        onClick={() => handleSelectRankings('auto', null)}
                        className="ml-3 px-3 py-1 text-xs bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                      >
                        Use Auto-Detection
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-red-500 dark:text-red-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Rankings</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Are you sure you want to delete these rankings? This action cannot be undone.
                </p>
                <div className="flex space-x-3 justify-end">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeDelete}
                    className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RankingsManager;
