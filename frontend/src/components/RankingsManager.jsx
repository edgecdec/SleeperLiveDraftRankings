import React, { useState, useEffect } from 'react';
import { Settings, X } from 'lucide-react';

// Custom hook
import { useRankingsData } from '../hooks/useRankingsData';

// Components
import RankingsUploadForm from './rankings/RankingsUploadForm';
import CustomRankingsList from './rankings/CustomRankingsList';
import FantasyProsRankings from './rankings/FantasyProsRankings';
import RankingsStatus from './rankings/RankingsStatus';
import DeleteConfirmationModal from './rankings/DeleteConfirmationModal';

/**
 * Main Rankings Manager component - now much cleaner and focused
 */
const RankingsManager = ({ isOpen, onClose, currentDraft }) => {
  // Use custom hook for data management
  const {
    rankingsStatus,
    availableFormats,
    currentFormat,
    customRankings,
    currentRankings,
    loading,
    updateInProgress,
    fetchAllData,
    handleUpdateRankings
  } = useRankingsData(currentDraft);

  // Local component state
  const [selectedRankingType, setSelectedRankingType] = useState('fantasypros');
  const [selectedFormatKey, setSelectedFormatKey] = useState('');
  const [selectedCustomId, setSelectedCustomId] = useState('');
  const [uploadName, setUploadName] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteRankingId, setDeleteRankingId] = useState(null);

  // Fetch data when component opens
  useEffect(() => {
    if (isOpen) {
      fetchAllData();
    }
  }, [isOpen, fetchAllData]);

  // Debug log
  useEffect(() => {
    console.log('RankingsManager - customRankings updated:', customRankings);
  }, [customRankings]);

  // Update selected format when current format changes
  useEffect(() => {
    if (currentFormat?.format_key) {
      setSelectedFormatKey(currentFormat.format_key);
    }
  }, [currentFormat]);

  // Utility functions
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

  // Event handlers
  const handleSelectRankings = async (type, id) => {
    console.log('Selecting rankings:', { type, id });
    try {
      const response = await fetch('/api/rankings/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: type,
          format_key: type === 'fantasypros' ? id : null,
          custom_id: type === 'custom' ? id : null,
          draft_id: currentDraft?.draft_id
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setSelectedRankingType(type);
        if (type === 'fantasypros') {
          setSelectedFormatKey(id);
          setSelectedCustomId('');
        } else {
          setSelectedCustomId(id);
          setSelectedFormatKey('');
        }
        
        // Refresh current format
        await fetchAllData();
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
      formData.append('display_name', uploadName);
      formData.append('description', uploadDescription);
      formData.append('scoring_format', 'half_ppr');
      formData.append('league_type', 'standard');

      const response = await fetch('/api/rankings/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Upload successful, refreshing data...');
        await fetchAllData();
        console.log('Data refreshed, customRankings:', customRankings);
        setUploadName('');
        setUploadDescription('');
        event.target.value = '';
        window.alert('Rankings uploaded successfully!');
      } else {
        window.alert(`Upload failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      window.alert('Failed to upload file');
    } finally {
      setUploadProgress(false);
    }
  };

  const handleDeleteCustomRankings = (rankingId) => {
    setDeleteRankingId(rankingId);
    setShowDeleteConfirmation(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setDeleteRankingId(null);
  };

  const executeDelete = async () => {
    if (!deleteRankingId) return;

    try {
      const response = await fetch(`/api/rankings/custom/${deleteRankingId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        await fetchAllData();
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

  const handleEnableAutoDetection = async () => {
    try {
      const response = await fetch('/api/rankings/auto-detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          draft_id: currentDraft?.draft_id
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        await fetchAllData();
      } else {
        window.alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error enabling auto-detection:', error);
      window.alert('Failed to enable auto-detection');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Rankings Manager</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">Loading rankings data...</p>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-8">
              {/* Upload Form */}
              <RankingsUploadForm
                uploadName={uploadName}
                setUploadName={setUploadName}
                uploadDescription={uploadDescription}
                setUploadDescription={setUploadDescription}
                uploadProgress={uploadProgress}
                onFileUpload={handleFileUpload}
              />

              {/* Custom Rankings List */}
              <CustomRankingsList
                customRankings={customRankings}
                selectedRankingType={selectedRankingType}
                selectedCustomId={selectedCustomId}
                currentFormat={currentFormat}
                onSelectRankings={handleSelectRankings}
                onDeleteRankings={handleDeleteCustomRankings}
              />

              {/* FantasyPros Rankings */}
              <FantasyProsRankings
                availableFormats={availableFormats}
                currentFormat={currentFormat}
                selectedRankingType={selectedRankingType}
                selectedFormatKey={selectedFormatKey}
                onSelectRankings={handleSelectRankings}
                onEnableAutoDetection={handleEnableAutoDetection}
                getFormatDisplayName={getFormatDisplayName}
              />

              {/* Status */}
              <RankingsStatus
                rankingsStatus={rankingsStatus}
                currentRankings={currentRankings}
                updateInProgress={updateInProgress}
                onUpdateRankings={handleUpdateRankings}
              />
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={showDeleteConfirmation}
          onCancel={cancelDelete}
          onConfirm={executeDelete}
        />
      </div>
    </div>
  );
};

export default RankingsManager;