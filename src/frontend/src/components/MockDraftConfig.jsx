import React, { useState, useEffect } from 'react';
import './MockDraftConfig.css';

const MockDraftConfig = ({ onConfigChange, onError, onSuccess }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    draft_id: '',
    description: '',
    auto_refresh: true,
    refresh_interval: 30,
    validate_draft: true
  });
  const [draftStatus, setDraftStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    if (config && config.is_active) {
      loadDraftStatus();
      // Set up auto-refresh if enabled
      if (config.auto_refresh) {
        const interval = setInterval(loadDraftStatus, config.refresh_interval * 1000);
        return () => clearInterval(interval);
      }
    }
  }, [config]);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/mock-draft/config');
      const result = await response.json();
      
      if (result.success) {
        setConfig(result.config);
        if (result.config && Object.keys(result.config).length > 0) {
          setFormData({
            draft_id: result.config.draft_id || '',
            description: result.config.description || '',
            auto_refresh: result.config.auto_refresh !== false,
            refresh_interval: result.config.refresh_interval || 30,
            validate_draft: true
          });
        }
      }
    } catch (error) {
      console.error('Error loading config:', error);
      onError && onError('Failed to load mock draft configuration');
    } finally {
      setLoading(false);
    }
  };

  const loadDraftStatus = async () => {
    if (!config || !config.is_active) return;
    
    setStatusLoading(true);
    try {
      const response = await fetch('/api/mock-draft/status');
      const result = await response.json();
      
      if (result.success) {
        setDraftStatus(result);
      }
    } catch (error) {
      console.error('Error loading draft status:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    if (!formData.draft_id.trim()) {
      onError && onError('Please enter a draft ID');
      return;
    }

    if (!formData.draft_id.match(/^\d+$/)) {
      onError && onError('Draft ID must be numeric');
      return;
    }

    if (formData.refresh_interval < 5 || formData.refresh_interval > 300) {
      onError && onError('Refresh interval must be between 5 and 300 seconds');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/mock-draft/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setConfig(result.config);
        onSuccess && onSuccess('Mock draft configuration saved successfully!');
        onConfigChange && onConfigChange(result.config);
        // Load draft status after successful save
        setTimeout(loadDraftStatus, 1000);
      } else {
        onError && onError(result.message || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Save error:', error);
      onError && onError('Network error while saving configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Are you sure you want to clear the mock draft configuration?')) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/mock-draft/config', {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setConfig(null);
        setDraftStatus(null);
        setFormData({
          draft_id: '',
          description: '',
          auto_refresh: true,
          refresh_interval: 30,
          validate_draft: true
        });
        onSuccess && onSuccess('Mock draft configuration cleared');
        onConfigChange && onConfigChange(null);
      } else {
        onError && onError(result.message || 'Failed to clear configuration');
      }
    } catch (error) {
      console.error('Clear error:', error);
      onError && onError('Network error while clearing configuration');
    } finally {
      setSaving(false);
    }
  };

  const formatTimestamp = (isoString) => {
    if (!isoString) return 'Unknown';
    try {
      return new Date(isoString).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  const getDraftStatusColor = (status) => {
    switch (status) {
      case 'pre_draft': return '#6c757d';
      case 'drafting': return '#007bff';
      case 'complete': return '#28a745';
      case 'paused': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getDraftStatusText = (status) => {
    switch (status) {
      case 'pre_draft': return 'Not Started';
      case 'drafting': return 'In Progress';
      case 'complete': return 'Completed';
      case 'paused': return 'Paused';
      default: return status || 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="mock-draft-config loading">
        <div className="spinner"></div>
        <p>Loading configuration...</p>
      </div>
    );
  }

  return (
    <div className="mock-draft-config">
      <h3>Mock Draft Configuration</h3>
      
      {/* Current Status */}
      {config && config.is_active && (
        <div className="current-status">
          <h4>Current Mock Draft</h4>
          <div className="status-grid">
            <div className="status-item">
              <label>Draft ID:</label>
              <span className="draft-id">{config.draft_id}</span>
            </div>
            <div className="status-item">
              <label>Description:</label>
              <span>{config.description}</span>
            </div>
            <div className="status-item">
              <label>Created:</label>
              <span>{formatTimestamp(config.created_at)}</span>
            </div>
            <div className="status-item">
              <label>Auto Refresh:</label>
              <span className={config.auto_refresh ? 'enabled' : 'disabled'}>
                {config.auto_refresh ? `Every ${config.refresh_interval}s` : 'Disabled'}
              </span>
            </div>
          </div>

          {/* Live Draft Status */}
          {draftStatus && (
            <div className="live-status">
              <div className="status-header">
                <h5>Live Draft Status</h5>
                <button 
                  className="refresh-btn"
                  onClick={loadDraftStatus}
                  disabled={statusLoading}
                >
                  {statusLoading ? '⟳' : '🔄'} Refresh
                </button>
              </div>
              
              {draftStatus.draft_info ? (
                <div className="draft-info">
                  <div className="status-badge" style={{ backgroundColor: getDraftStatusColor(draftStatus.draft_status) }}>
                    {getDraftStatusText(draftStatus.draft_status)}
                  </div>
                  <div className="draft-details">
                    <span>Players Drafted: <strong>{draftStatus.drafted_players_count}</strong></span>
                    {draftStatus.last_pick_time && (
                      <span>Last Pick: {formatTimestamp(draftStatus.last_pick_time)}</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="draft-error">
                  <span>⚠️ Could not load draft data</span>
                  {draftStatus.error && <p>{draftStatus.error}</p>}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Configuration Form */}
      <div className="config-form">
        <div className="form-group">
          <label htmlFor="draft_id">Sleeper Draft ID *</label>
          <input
            type="text"
            id="draft_id"
            name="draft_id"
            value={formData.draft_id}
            onChange={handleInputChange}
            placeholder="e.g., 123456789"
            required
          />
          <small>Enter the numeric ID from your Sleeper mock draft URL</small>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="e.g., My Mock Draft 2025"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="refresh_interval">Refresh Interval (seconds)</label>
            <input
              type="number"
              id="refresh_interval"
              name="refresh_interval"
              value={formData.refresh_interval}
              onChange={handleInputChange}
              min="5"
              max="300"
              disabled={!formData.auto_refresh}
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="auto_refresh"
                checked={formData.auto_refresh}
                onChange={handleInputChange}
              />
              Auto Refresh
            </label>
            <small>Automatically update draft status</small>
          </div>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="validate_draft"
              checked={formData.validate_draft}
              onChange={handleInputChange}
            />
            Validate Draft Exists
          </label>
          <small>Check if draft exists in Sleeper before saving</small>
        </div>

        <div className="form-actions">
          <button 
            type="button"
            className="save-btn"
            onClick={handleSave}
            disabled={saving || !formData.draft_id.trim()}
          >
            {saving ? (
              <>
                <span className="spinner"></span>
                Saving...
              </>
            ) : (
              config && config.is_active ? 'Update Configuration' : 'Save Configuration'
            )}
          </button>

          {config && config.is_active && (
            <button 
              type="button"
              className="clear-btn"
              onClick={handleClear}
              disabled={saving}
            >
              Clear Configuration
            </button>
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="help-section">
        <h4>How to find your Draft ID:</h4>
        <ol>
          <li>Go to your Sleeper mock draft</li>
          <li>Look at the URL: <code>https://sleeper.app/draft/nfl/123456789</code></li>
          <li>The Draft ID is the number at the end: <code>123456789</code></li>
        </ol>
        <p><strong>Note:</strong> This only works with Sleeper mock drafts, not live league drafts.</p>
      </div>
    </div>
  );
};

export default MockDraftConfig;