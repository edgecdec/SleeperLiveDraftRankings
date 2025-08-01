import React, { useState, useEffect } from 'react';
import FileUpload from './FileUpload';
import MockDraftConfig from './MockDraftConfig';
import './ManagementPanel.css';

const ManagementPanel = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [message, setMessage] = useState(null);
  const [customRankings, setCustomRankings] = useState([]);
  const [loadingCustom, setLoadingCustom] = useState(false);

  useEffect(() => {
    if (activeTab === 'upload') {
      loadCustomRankings();
    }
  }, [activeTab]);

  const loadCustomRankings = async () => {
    setLoadingCustom(true);
    try {
      const response = await fetch('/api/rankings/custom');
      const result = await response.json();
      
      if (result.success) {
        setCustomRankings(result.custom_rankings || []);
      }
    } catch (error) {
      console.error('Error loading custom rankings:', error);
    } finally {
      setLoadingCustom(false);
    }
  };

  const handleUploadSuccess = (data) => {
    setMessage({
      type: 'success',
      text: `Successfully uploaded "${data.display_name}" with ${data.player_count} players!`
    });
    loadCustomRankings(); // Refresh the list
    setTimeout(() => setMessage(null), 5000);
  };

  const handleError = (error) => {
    setMessage({
      type: 'error',
      text: error
    });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSuccess = (successMsg) => {
    setMessage({
      type: 'success',
      text: successMsg
    });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleDeleteCustom = async (fileId, displayName) => {
    if (!window.confirm(`Are you sure you want to delete "${displayName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/rankings/custom/${fileId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        handleSuccess(`Deleted "${displayName}" successfully`);
        loadCustomRankings();
      } else {
        handleError(result.message || 'Failed to delete rankings');
      }
    } catch (error) {
      console.error('Delete error:', error);
      handleError('Network error while deleting rankings');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="management-panel">
      <div className="panel-header">
        <h2>Draft Management</h2>
        <p>Upload custom rankings and configure mock draft connections</p>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`message ${message.type}`}>
          <span>{message.text}</span>
          <button 
            className="message-close"
            onClick={() => setMessage(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          📁 Custom Rankings
        </button>
        <button 
          className={`tab-btn ${activeTab === 'mock-draft' ? 'active' : ''}`}
          onClick={() => setActiveTab('mock-draft')}
        >
          🎯 Mock Draft
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'upload' && (
          <div className="upload-tab">
            <FileUpload 
              onUploadSuccess={handleUploadSuccess}
              onError={handleError}
            />
            
            {/* Custom Rankings List */}
            <div className="custom-rankings-section">
              <h3>Your Custom Rankings</h3>
              
              {loadingCustom ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading custom rankings...</p>
                </div>
              ) : customRankings.length === 0 ? (
                <div className="empty-state">
                  <p>No custom rankings uploaded yet.</p>
                  <p>Upload your first CSV file above to get started!</p>
                </div>
              ) : (
                <div className="rankings-grid">
                  {customRankings.map((ranking) => (
                    <div key={ranking.id} className="ranking-card">
                      <div className="card-header">
                        <h4>{ranking.display_name}</h4>
                        <div className="card-actions">
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteCustom(ranking.id, ranking.display_name)}
                            title="Delete rankings"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      
                      <div className="card-content">
                        {ranking.description && (
                          <p className="description">{ranking.description}</p>
                        )}
                        
                        <div className="ranking-details">
                          <div className="detail-item">
                            <span className="label">Players:</span>
                            <span className="value">{ranking.player_count}</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">Format:</span>
                            <span className="value">
                              {ranking.scoring_format.replace('_', ' ').toUpperCase()} / 
                              {ranking.league_type.toUpperCase()}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="label">Size:</span>
                            <span className="value">{formatFileSize(ranking.current_file_size)}</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">Uploaded:</span>
                            <span className="value">{formatDate(ranking.upload_time)}</span>
                          </div>
                        </div>
                        
                        <div className="card-status">
                          {ranking.exists ? (
                            <span className="status-badge success">✅ Available</span>
                          ) : (
                            <span className="status-badge error">❌ File Missing</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'mock-draft' && (
          <div className="mock-draft-tab">
            <MockDraftConfig 
              onConfigChange={(config) => {
                // Handle config change if needed
                console.log('Mock draft config changed:', config);
              }}
              onError={handleError}
              onSuccess={handleSuccess}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagementPanel;