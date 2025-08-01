/**
 * Toast Notification Service
 * 
 * This service handles displaying toast notifications for API errors and other messages.
 * It integrates with the backend error service to automatically display standardized error messages.
 */

import { toast } from 'react-toastify';

class ToastService {
  constructor() {
    this.activeToasts = new Map();
    this.retryCallbacks = new Map();
  }

  /**
   * Process API error response and display appropriate toast
   * @param {Object} errorResponse - Standardized error response from backend
   * @param {Function} retryCallback - Optional callback for retry action
   */
  handleApiError(errorResponse, retryCallback = null) {
    if (!errorResponse?.error?.toast) {
      // Fallback for non-standardized errors
      this.showError('An unexpected error occurred');
      return;
    }

    const { error } = errorResponse;
    const toastConfig = error.toast;

    // Store retry callback if provided
    if (retryCallback && error.id) {
      this.retryCallbacks.set(error.id, retryCallback);
    }

    // Show toast based on configuration
    this.showToast({
      type: toastConfig.type,
      title: toastConfig.title,
      message: toastConfig.message,
      duration: toastConfig.duration,
      actions: toastConfig.actions,
      errorId: error.id,
      suggestions: error.suggestions,
      retryAfter: error.retry_after
    });

    // Log error for debugging
    console.error(`[${error.id}] ${error.type}:`, error.message);
    if (error.details) {
      console.error('Details:', error.details);
    }
  }

  /**
   * Show a toast notification
   * @param {Object} config - Toast configuration
   */
  showToast(config) {
    const {
      type = 'info',
      title,
      message,
      duration = 5000,
      actions = [],
      errorId,
      suggestions = [],
      retryAfter
    } = config;

    // Create toast content with actions
    const toastContent = this.createToastContent({
      title,
      message,
      actions,
      errorId,
      suggestions,
      retryAfter
    });

    const toastOptions = {
      autoClose: duration === 0 ? false : duration,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      position: 'top-right',
      hideProgressBar: false,
      closeButton: true,
      className: `toast-${type}`,
      bodyClassName: 'toast-body',
      progressClassName: `toast-progress-${type}`
    };

    let toastId;
    
    // Show appropriate toast type
    switch (type) {
      case 'error':
        toastId = toast.error(toastContent, toastOptions);
        break;
      case 'warning':
        toastId = toast.warn(toastContent, toastOptions);
        break;
      case 'success':
        toastId = toast.success(toastContent, toastOptions);
        break;
      case 'info':
      default:
        toastId = toast.info(toastContent, toastOptions);
        break;
    }

    // Store toast reference
    if (errorId) {
      this.activeToasts.set(errorId, toastId);
    }

    return toastId;
  }

  /**
   * Create toast content with actions and suggestions
   */
  createToastContent({ title, message, actions, errorId, suggestions, retryAfter }) {
    return (
      <div className="toast-content">
        {title && <div className="toast-title">{title}</div>}
        <div className="toast-message">{message}</div>
        
        {retryAfter && (
          <div className="toast-retry-info">
            <small>You can retry in {retryAfter} seconds</small>
          </div>
        )}
        
        {actions && actions.length > 0 && (
          <div className="toast-actions">
            {actions.map((action, index) => (
              <button
                key={index}
                className={`toast-action-btn toast-action-${action.style}`}
                onClick={() => this.handleToastAction(action, errorId)}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
        
        {suggestions && suggestions.length > 0 && (
          <div className="toast-suggestions">
            <details>
              <summary>Need help?</summary>
              <ul>
                {suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </details>
          </div>
        )}
      </div>
    );
  }

  /**
   * Handle toast action button clicks
   */
  handleToastAction(action, errorId) {
    switch (action.action) {
      case 'dismiss':
        this.dismissToast(errorId);
        break;
        
      case 'retry':
        this.handleRetry(errorId);
        break;
        
      case 'show_help':
        this.showHelp(errorId);
        break;
        
      default:
        console.warn('Unknown toast action:', action.action);
    }
  }

  /**
   * Dismiss a specific toast
   */
  dismissToast(errorId) {
    if (errorId && this.activeToasts.has(errorId)) {
      const toastId = this.activeToasts.get(errorId);
      toast.dismiss(toastId);
      this.activeToasts.delete(errorId);
      this.retryCallbacks.delete(errorId);
    }
  }

  /**
   * Handle retry action
   */
  handleRetry(errorId) {
    if (errorId && this.retryCallbacks.has(errorId)) {
      const retryCallback = this.retryCallbacks.get(errorId);
      this.dismissToast(errorId);
      
      // Show loading toast
      this.showInfo('Retrying...', { duration: 2000 });
      
      // Execute retry callback
      if (typeof retryCallback === 'function') {
        retryCallback();
      }
    }
  }

  /**
   * Show help information
   */
  showHelp(errorId) {
    // This could open a help modal, navigate to docs, etc.
    this.showInfo('For more help, check the documentation or contact support');
  }

  // Convenience methods for different toast types
  showSuccess(message, options = {}) {
    return this.showToast({
      type: 'success',
      message,
      duration: options.duration || 3000,
      ...options
    });
  }

  showError(message, options = {}) {
    return this.showToast({
      type: 'error',
      message,
      duration: options.duration || 8000,
      ...options
    });
  }

  showWarning(message, options = {}) {
    return this.showToast({
      type: 'warning',
      message,
      duration: options.duration || 5000,
      ...options
    });
  }

  showInfo(message, options = {}) {
    return this.showToast({
      type: 'info',
      message,
      duration: options.duration || 3000,
      ...options
    });
  }

  /**
   * Clear all active toasts
   */
  clearAll() {
    toast.dismiss();
    this.activeToasts.clear();
    this.retryCallbacks.clear();
  }

  /**
   * Show loading toast
   */
  showLoading(message = 'Loading...') {
    return toast.loading(message, {
      position: 'top-right',
      className: 'toast-loading'
    });
  }

  /**
   * Update a loading toast to success
   */
  updateToSuccess(toastId, message) {
    toast.update(toastId, {
      render: message,
      type: 'success',
      isLoading: false,
      autoClose: 3000
    });
  }

  /**
   * Update a loading toast to error
   */
  updateToError(toastId, message) {
    toast.update(toastId, {
      render: message,
      type: 'error',
      isLoading: false,
      autoClose: 8000
    });
  }
}

// Create singleton instance
const toastService = new ToastService();

export default toastService;
