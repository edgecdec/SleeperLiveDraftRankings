/**
 * Toast Integration Example Component
 * 
 * This component demonstrates how to integrate the toast notification system
 * with the backend error handling for automatic error display.
 */

import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { useDraftApi, useUserApi } from '../hooks/useApiWithToast';
import toastService from '../services/toastService';
import '../styles/toast.css';

const ToastExample = () => {
  const [username, setUsername] = useState('edgecdec');
  const [draftId, setDraftId] = useState('1255160696186880000');
  const [selectedFormat, setSelectedFormat] = useState('ppr_superflex');
  
  const draftApi = useDraftApi();
  const userApi = useUserApi();

  // Example: Get user info with automatic error handling
  const handleGetUser = async () => {
    try {
      const userData = await userApi.getUserInfo(username);
      toastService.showSuccess(`User ${userData.username} found!`);
      console.log('User data:', userData);
    } catch (error) {
      // Error is automatically handled by the hook and displayed as toast
      console.error('Failed to get user:', error);
    }
  };

  // Example: Get draft data with loading and error handling
  const handleGetDraft = async () => {
    try {
      const draftData = await draftApi.getDraftData(draftId);
      toastService.showSuccess(`Draft loaded! ${draftData.total_available} players available`);
      console.log('Draft data:', draftData);
    } catch (error) {
      // Error automatically displayed as toast with retry option
      console.error('Failed to get draft:', error);
    }
  };

  // Example: Set current draft with success notification
  const handleSetDraft = async () => {
    try {
      await draftApi.setCurrentDraft(draftId);
      // Success toast is automatically shown by the hook
    } catch (error) {
      console.error('Failed to set draft:', error);
    }
  };

  // Example: Select rankings format
  const handleSelectRankings = async () => {
    try {
      await draftApi.selectRankings('fantasypros', selectedFormat);
      // Success toast automatically shown
    } catch (error) {
      console.error('Failed to select rankings:', error);
    }
  };

  // Example: Trigger different error types for testing
  const handleTestError = async (errorType) => {
    try {
      const response = await fetch(`http://localhost:5001/api/demo/errors/${errorType}`);
      const data = await response.json();
      
      if (!response.ok) {
        // This will trigger the error handling
        toastService.handleApiError(data);
      }
    } catch (error) {
      toastService.showError('Network error occurred');
    }
  };

  // Example: Manual toast notifications
  const handleManualToasts = () => {
    toastService.showSuccess('This is a success message!');
    
    setTimeout(() => {
      toastService.showWarning('This is a warning message!');
    }, 1000);
    
    setTimeout(() => {
      toastService.showError('This is an error message!');
    }, 2000);
    
    setTimeout(() => {
      toastService.showInfo('This is an info message!');
    }, 3000);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Toast Notification System Demo</h2>
      
      {/* API Integration Examples */}
      <div style={{ marginBottom: '30px' }}>
        <h3>API Integration Examples</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label>Username: </label>
            <input 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter Sleeper username"
            />
            <button onClick={handleGetUser} disabled={userApi.loading}>
              {userApi.loading ? 'Loading...' : 'Get User Info'}
            </button>
          </div>
          
          <div>
            <label>Draft ID: </label>
            <input 
              value={draftId} 
              onChange={(e) => setDraftId(e.target.value)}
              placeholder="Enter draft ID"
            />
            <button onClick={handleGetDraft} disabled={draftApi.loading}>
              {draftApi.loading ? 'Loading...' : 'Get Draft Data'}
            </button>
            <button onClick={handleSetDraft} disabled={draftApi.loading}>
              Set as Current Draft
            </button>
          </div>
          
          <div>
            <label>Rankings Format: </label>
            <select 
              value={selectedFormat} 
              onChange={(e) => setSelectedFormat(e.target.value)}
            >
              <option value="standard_standard">Standard - Standard</option>
              <option value="standard_superflex">Standard - Superflex</option>
              <option value="half_ppr_standard">Half PPR - Standard</option>
              <option value="half_ppr_superflex">Half PPR - Superflex</option>
              <option value="ppr_standard">PPR - Standard</option>
              <option value="ppr_superflex">PPR - Superflex</option>
            </select>
            <button onClick={handleSelectRankings} disabled={draftApi.loading}>
              Select Rankings
            </button>
          </div>
        </div>
      </div>

      {/* Error Testing Examples */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Error Type Testing</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => handleTestError('validation')}>
            Test Validation Error
          </button>
          <button onClick={() => handleTestError('not_found')}>
            Test Not Found Error
          </button>
          <button onClick={() => handleTestError('external_api')}>
            Test External API Error
          </button>
          <button onClick={() => handleTestError('business_logic')}>
            Test Business Logic Error
          </button>
          <button onClick={() => handleTestError('internal')}>
            Test Internal Error
          </button>
        </div>
      </div>

      {/* Manual Toast Examples */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Manual Toast Examples</h3>
        <button onClick={handleManualToasts}>
          Show All Toast Types
        </button>
        <button onClick={() => toastService.clearAll()}>
          Clear All Toasts
        </button>
      </div>

      {/* Loading Example */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Loading Toast Example</h3>
        <button onClick={() => {
          const loadingId = toastService.showLoading('Processing...');
          
          setTimeout(() => {
            if (Math.random() > 0.5) {
              toastService.updateToSuccess(loadingId, 'Operation completed!');
            } else {
              toastService.updateToError(loadingId, 'Operation failed!');
            }
          }, 3000);
        }}>
          Show Loading Toast
        </button>
      </div>

      {/* Status Display */}
      {(userApi.loading || draftApi.loading) && (
        <div style={{ 
          padding: '10px', 
          background: '#f0f0f0', 
          borderRadius: '4px',
          marginTop: '20px'
        }}>
          Loading API request...
        </div>
      )}

      {/* Toast Container - Required for toasts to display */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default ToastExample;
