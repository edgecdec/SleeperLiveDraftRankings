import React, { useState, useRef } from 'react';
import './FileUpload.css';

const FileUpload = ({ onUploadSuccess, onError }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showManagement, setShowManagement] = useState(false);
  const [customRankings, setCustomRankings] = useState([]);
  const [loadingCustom, setLoadingCustom] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    description: '',
    scoring_format: 'half_ppr',
    league_type: 'standard'
  });
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        if (!formData.display_name) {
          setFormData(prev => ({
            ...prev,
            display_name: droppedFile.name.replace('.csv', '').replace(/_/g, ' ')
          }));
        }
      } else {
        onError && onError('Please upload a CSV file');
      }
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        if (!formData.display_name) {
          setFormData(prev => ({
            ...prev,
            display_name: selectedFile.name.replace('.csv', '').replace(/_/g, ' ')
          }));
        }
      } else {
        onError && onError('Please upload a CSV file');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const loadCustomRankings = async () => {
    setLoadingCustom(true);
    try {
      const response = await fetch('/api/rankings/custom');
      const result = await response.json();
      
      if (result.success) {
        setCustomRankings(result.rankings || []);
      }
    } catch (error) {
      console.error('Error loading custom rankings:', error);
    } finally {
      setLoadingCustom(false);
    }
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
        onUploadSuccess && onUploadSuccess({ display_name: displayName, message: 'Deleted successfully' });
        loadCustomRankings();
      } else {
        onError && onError(result.message || 'Failed to delete rankings');
      }
    } catch (error) {
      console.error('Delete error:', error);
      onError && onError('Network error while deleting rankings');
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

  const handleUpload = async () => {
    if (!file) {
      onError && onError('Please select a file to upload');
      return;
    }

    if (!formData.display_name.trim()) {
      onError && onError('Please enter a display name for your rankings');
      return;
    }

    setUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('display_name', formData.display_name.trim());
      uploadFormData.append('description', formData.description.trim());
      uploadFormData.append('scoring_format', formData.scoring_format);
      uploadFormData.append('league_type', formData.league_type);

      const response = await fetch('/api/rankings/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onUploadSuccess && onUploadSuccess(result.data);
        // Reset form
        setFile(null);
        setFormData({
          display_name: '',
          description: '',
          scoring_format: 'half_ppr',
          league_type: 'standard'
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // Reload custom rankings if management is shown
        if (showManagement) {
          loadCustomRankings();
        }
      } else {
        onError && onError(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      onError && onError('Network error during upload');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="file-upload-container">
      <h3>Upload Custom Rankings</h3>
      
      {/* File Drop Zone */}
      <div 
        className={`file-drop-zone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        {file ? (
          <div className="file-selected">
            <div className="file-info">
              <span className="file-icon">📄</span>
              <div className="file-details">
                <div className="file-name">{file.name}</div>
                <div className="file-size">{(file.size / 1024).toFixed(1)} KB</div>
              </div>
              <button 
                type="button" 
                className="remove-file-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <div className="file-drop-content">
            <span className="upload-icon">📁</span>
            <p>Drop your CSV file here or click to browse</p>
            <p className="file-requirements">CSV files only, max 5MB</p>
          </div>
        )}
      </div>

      {/* Form Fields */}
      <div className="upload-form">
        <div className="form-group">
          <label htmlFor="display_name">Display Name *</label>
          <input
            type="text"
            id="display_name"
            name="display_name"
            value={formData.display_name}
            onChange={handleInputChange}
            placeholder="e.g., My Custom Rankings 2025"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Optional description of your rankings..."
            rows={3}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="scoring_format">Scoring Format</label>
            <select
              id="scoring_format"
              name="scoring_format"
              value={formData.scoring_format}
              onChange={handleInputChange}
            >
              <option value="standard">Standard</option>
              <option value="half_ppr">Half PPR</option>
              <option value="ppr">Full PPR</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="league_type">League Type</label>
            <select
              id="league_type"
              name="league_type"
              value={formData.league_type}
              onChange={handleInputChange}
            >
              <option value="standard">Standard</option>
              <option value="superflex">Superflex</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>

        <button 
          type="button"
          className={`upload-btn ${uploading ? 'uploading' : ''}`}
          onClick={handleUpload}
          disabled={!file || uploading || !formData.display_name.trim()}
        >
          {uploading ? (
            <>
              <span className="spinner"></span>
              Uploading...
            </>
          ) : (
            'Upload Rankings'
          )}
        </button>
      </div>

      {/* Management Section */}
      <div className="management-section">
        <button 
          type="button"
          className="management-toggle-btn"
          onClick={() => {
            setShowManagement(!showManagement);
            if (!showManagement) {
              loadCustomRankings();
            }
          }}
        >
          {showManagement ? '📁 Hide' : '📁 Manage'} Custom Rankings
        </button>
        
        {showManagement && (
          <div className="custom-rankings-management">
            <h4>Your Custom Rankings</h4>
            
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
              <div className="rankings-list">
                {customRankings.map((ranking) => (
                  <div key={ranking.id} className="ranking-item">
                    <div className="ranking-info">
                      <h5>{ranking.display_name}</h5>
                      {ranking.description && (
                        <p className="description">{ranking.description}</p>
                      )}
                      <div className="ranking-meta">
                        <span>{ranking.player_count} players</span>
                        <span>{formatFileSize(ranking.current_file_size)}</span>
                        <span>{formatDate(ranking.upload_time)}</span>
                        {ranking.exists ? (
                          <span className="status-success">✅ Available</span>
                        ) : (
                          <span className="status-error">❌ Missing</span>
                        )}
                      </div>
                    </div>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteCustom(ranking.id, ranking.display_name)}
                      title="Delete rankings"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CSV Format Help */}
      <div className="format-help">
        <h4>CSV Format Requirements:</h4>
        <ul>
          <li>Required columns: <code>name</code>, <code>position</code></li>
          <li>Optional columns: <code>rank</code>, <code>tier</code>, <code>team</code>, <code>value</code></li>
          <li>Positions: QB, RB, WR, TE, K, DST/DEF</li>
          <li>10-1000 players recommended</li>
        </ul>
        <details>
          <summary>Example CSV format</summary>
          <pre>{`name,position,rank,tier,team,value
Josh Allen,QB,1,1,BUF,25.5
Christian McCaffrey,RB,2,1,SF,24.8
Cooper Kupp,WR,3,1,LAR,23.2
Travis Kelce,TE,4,1,KC,18.7`}</pre>
        </details>
      </div>
    </div>
  );
};

export default FileUpload;