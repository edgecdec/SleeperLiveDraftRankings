import React, { useState, useEffect } from 'react';
import { X, Upload, Trash2, FileText, Check } from 'lucide-react';
import './RankingsManagerModal.css';

const RankingsManagerModal = ({ isOpen, onClose, onRankingSelected }) => {
  const [activeTab, setActiveTab] = useState('select');
  const [customRankings, setCustomRankings] = useState([]);
  const [fantasyProRankings, setFantasyProRankings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    display_name: '',
    description: ''
  });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadCustomRankings();
      loadFantasyProRankings();
    }
  }, [isOpen]);

  const loadCustomRankings = async () => {
    try {
      const response = await fetch('/api/rankings/custom');
      const result = await response.json();
      
      if (result.success) {
        setCustomRankings(result.rankings || []);
      } else {
        showMessage('error', 'Failed to load custom rankings');
      }
    } catch (error) {
      console.error('Error loading custom rankings:', error);
      showMessage('error', 'Network error loading rankings');
    }
  };

  const loadFantasyProRankings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/rankings/formats');
      const result = await response.json();
      
      if (result.success) {
        // Convert the formats object to an array
        const formats = [];
        Object.entries(result.formats || {}).forEach(([scoring, types]) => {
          Object.entries(types).forEach(([leagueType, filename]) => {
            formats.push({
              id: `${scoring}_${leagueType}`,
              display_name: `${scoring.replace('_', ' ').toUpperCase()} ${leagueType.toUpperCase()}`,
              description: `FantasyPros ${scoring.replace('_', ' ')} ${leagueType} rankings`,
              filename: filename,
              type: 'fantasypros',
              scoring_format: scoring,
              league_type: leagueType,
              exists: true
            });
          });
        });
        setFantasyProRankings(formats);
      } else {
        showMessage('error', 'Failed to load FantasyPros rankings');
      }
    } catch (error) {
      console.error('Error loading FantasyPros rankings:', error);
      showMessage('error', 'Network error loading FantasyPros rankings');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file);
      if (!uploadForm.display_name) {
        setUploadForm(prev => ({
          ...prev,
          display_name: file.name.replace('.csv', '').replace(/_/g, ' ')
        }));
      }
    } else {
      showMessage('error', 'Please select a CSV file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showMessage('error', 'Please select a file');
      return;
    }

    if (!uploadForm.display_name.trim()) {
      showMessage('error', 'Please enter a display name');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('display_name', uploadForm.display_name.trim());
      formData.append('description', uploadForm.description.trim());

      const response = await fetch('/api/rankings/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        showMessage('success', `Successfully uploaded "${result.data.display_name}"`);
        setSelectedFile(null);
        setUploadForm({ display_name: '', description: '' });
        loadCustomRankings();
        setActiveTab('select');
      } else {
        showMessage('error', result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showMessage('error', 'Network error during upload');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRanking = async (ranking) => {
    setLoading(true);
    try {
      let response;
      
      if (ranking.type === 'fantasypros') {
        // Use the existing select endpoint for FantasyPros
        response = await fetch('/api/rankings/select', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'fantasypros',
            id: ranking.id
          })
        });
      } else {
        // Use the simple file endpoint for custom rankings
        response = await fetch('/api/rankings/use-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: ranking.filename,
            display_name: ranking.display_name
          })
        });
      }

      const result = await response.json();

      if (result.success) {
        showMessage('success', `Now using: ${ranking.display_name}`);
        onRankingSelected && onRankingSelected(ranking);
        setTimeout(() => onClose(), 1500);
      } else {
        showMessage('error', result.error || 'Failed to select rankings');
      }
    } catch (error) {
      console.error('Selection error:', error);
      showMessage('error', 'Network error selecting rankings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRanking = async (ranking) => {
    if (!window.confirm(`Delete "${ranking.display_name}"?`)) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/rankings/custom/${ranking.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        showMessage('success', `Deleted "${ranking.display_name}"`);
        loadCustomRankings();
      } else {
        showMessage('error', result.error || 'Failed to delete rankings');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showMessage('error', 'Network error deleting rankings');
    } finally {
      setLoading(false);
    }
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="rankings-modal-overlay">
      <div className="rankings-modal">
        <div className="rankings-modal-header">
          <h2>Rankings Manager</h2>
          <button className="close-btn" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="rankings-modal-tabs">
          <button 
            className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <Upload className="w-4 h-4" />
            Upload New
          </button>
          <button 
            className={`tab-btn ${activeTab === 'select' ? 'active' : ''}`}
            onClick={() => setActiveTab('select')}
          >
            <FileText className="w-4 h-4" />
            Select Rankings
          </button>
        </div>

        <div className="rankings-modal-content">
          {activeTab === 'upload' && (
            <div className="upload-section">
              <h3>Upload Custom Rankings</h3>
              
              <div className="file-input-section">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="file-input"
                />
                {selectedFile && (
                  <div className="selected-file">
                    <FileText className="w-4 h-4" />
                    <span>{selectedFile.name}</span>
                    <span className="file-size">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                )}
              </div>

              <div className="form-section">
                <div className="form-group">
                  <label>Display Name *</label>
                  <input
                    type="text"
                    value={uploadForm.display_name}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="e.g., My Custom Rankings 2025"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description..."
                    rows={3}
                  />
                </div>

                <button 
                  className="upload-btn"
                  onClick={handleUpload}
                  disabled={!selectedFile || !uploadForm.display_name.trim() || loading}
                >
                  {loading ? 'Uploading...' : 'Upload Rankings'}
                </button>
              </div>

              <div className="format-help">
                <h4>CSV Format:</h4>
                <ul>
                  <li>Required: <code>name</code>, <code>position</code></li>
                  <li>Optional: <code>rank</code>, <code>tier</code>, <code>team</code>, <code>value</code></li>
                  <li>Example: Josh Allen,QB,1,1,BUF,25.5</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'select' && (
            <div className="select-section">
              <h3>Select Rankings to Use</h3>
              
              {loading ? (
                <div className="loading">Loading rankings...</div>
              ) : (
                <div className="rankings-list">
                  {/* FantasyPros Rankings */}
                  {fantasyProRankings.length > 0 && (
                    <div className="rankings-section">
                      <h4 className="section-title">📊 FantasyPros Rankings</h4>
                      {fantasyProRankings.map((ranking) => (
                        <div key={ranking.id} className="ranking-card fantasypros">
                          <div className="ranking-info">
                            <h4>{ranking.display_name}</h4>
                            <p className="description">{ranking.description}</p>
                            <div className="ranking-meta">
                              <span>FantasyPros Official</span>
                              <span className="status available">✅ Available</span>
                            </div>
                          </div>
                          <div className="ranking-actions">
                            <button 
                              className="select-btn"
                              onClick={() => handleSelectRanking(ranking)}
                              disabled={loading}
                            >
                              <Check className="w-4 h-4" />
                              Use This
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Custom Rankings */}
                  {customRankings.length > 0 && (
                    <div className="rankings-section">
                      <h4 className="section-title">📁 Custom Rankings</h4>
                      {customRankings.map((ranking) => (
                        <div key={ranking.id} className="ranking-card custom">
                          <div className="ranking-info">
                            <h4>{ranking.display_name}</h4>
                            {ranking.description && <p className="description">{ranking.description}</p>}
                            <div className="ranking-meta">
                              <span>{ranking.player_count} players</span>
                              <span>{formatFileSize(ranking.current_file_size)}</span>
                              <span>{formatDate(ranking.upload_time)}</span>
                              <span className={`status ${ranking.exists ? 'available' : 'missing'}`}>
                                {ranking.exists ? '✅ Available' : '❌ Missing'}
                              </span>
                            </div>
                          </div>
                          <div className="ranking-actions">
                            <button 
                              className="select-btn"
                              onClick={() => handleSelectRanking(ranking)}
                              disabled={!ranking.exists || loading}
                            >
                              <Check className="w-4 h-4" />
                              Use This
                            </button>
                            <button 
                              className="delete-btn"
                              onClick={() => handleDeleteRanking(ranking)}
                              disabled={loading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Empty State */}
                  {fantasyProRankings.length === 0 && customRankings.length === 0 && (
                    <div className="empty-state">
                      <p>No rankings available.</p>
                      <button onClick={() => setActiveTab('upload')}>Upload custom rankings</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RankingsManagerModal;
