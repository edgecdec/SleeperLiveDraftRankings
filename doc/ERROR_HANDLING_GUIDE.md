# Error Handling & Toast Notification System

## 🎯 **Overview**

This system provides standardized error handling across the Fantasy Football Draft API with automatic frontend toast notifications. It creates consistent error responses that integrate seamlessly with a React-based toast notification system.

---

## 🏗️ **Architecture**

### **Backend Components**
```
services/
├── error_service.py        # Core error handling and response formatting
├── error_middleware.py     # Decorators and middleware for automatic error handling
└── error_context.py        # Error context and tracking
```

### **Frontend Components**
```
frontend/src/
├── services/toastService.js    # Toast notification service
├── hooks/useApiWithToast.js    # API hooks with automatic error handling
├── styles/toast.css            # Toast styling
└── components/ToastExample.jsx # Integration examples
```

---

## 🚀 **Quick Start**

### **Backend Integration**

1. **Add error handling to routes:**
```python
from services.error_middleware import handle_api_errors, validate_required_params
from services.error_service import validation_error, not_found_error

@app.route('/api/endpoint')
@handle_api_errors
def my_endpoint():
    # Your logic here
    return jsonify(result)
```

2. **Use standardized error responses:**
```python
# Validation error
return jsonify(validation_error(
    field="username",
    message="Username is required",
    context=generate_request_context()
)), 400

# Not found error
return jsonify(not_found_error(
    resource="User",
    resource_id=username,
    context=generate_request_context()
)), 404
```

### **Frontend Integration**

1. **Install dependencies:**
```bash
npm install react-toastify
```

2. **Add toast container to your app:**
```jsx
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/toast.css';

function App() {
  return (
    <div>
      {/* Your app content */}
      <ToastContainer position="top-right" />
    </div>
  );
}
```

3. **Use API hooks with automatic error handling:**
```jsx
import { useDraftApi } from './hooks/useApiWithToast';

function MyComponent() {
  const draftApi = useDraftApi();
  
  const handleGetDraft = async () => {
    try {
      const data = await draftApi.getDraftData(draftId);
      // Success handling
    } catch (error) {
      // Error automatically displayed as toast
    }
  };
}
```

---

## 📊 **Error Response Format**

### **Standardized Error Response**
```json
{
  "error": {
    "id": "err_a1b2c3d4",
    "type": "validation_error",
    "severity": "medium",
    "message": "Username is required",
    "timestamp": "2025-01-27T22:00:00.000Z",
    "details": "Field 'username' validation failed",
    "context": {
      "user_id": null,
      "draft_id": "1255160696186880000",
      "league_id": null,
      "endpoint": "/api/user/info",
      "request_id": "req_x1y2z3w4"
    },
    "suggestions": [
      "Please provide a valid username",
      "Check the API documentation for format requirements"
    ],
    "toast": {
      "show": true,
      "title": "Invalid Input",
      "message": "Username is required",
      "type": "warning",
      "duration": 5000,
      "actions": [
        {
          "label": "Dismiss",
          "action": "dismiss",
          "style": "secondary"
        },
        {
          "label": "Help",
          "action": "show_help",
          "style": "secondary"
        }
      ]
    }
  }
}
```

---

## 🎨 **Error Types & Severities**

### **Error Types**
- `validation_error` - Input validation failures
- `not_found_error` - Resource not found
- `authentication_error` - Authentication failures
- `authorization_error` - Permission denied
- `external_api_error` - External service failures
- `internal_error` - Server-side errors
- `rate_limit_error` - Rate limiting
- `timeout_error` - Request timeouts
- `conflict_error` - Resource conflicts
- `business_logic_error` - Business rule violations

### **Severity Levels**
- `low` - Info-level, user can continue (3s toast)
- `medium` - Warning-level, user should be aware (5s toast)
- `high` - Error-level, blocks user action (8s toast)
- `critical` - System-level, requires attention (persistent toast)

---

## 🔧 **Backend Usage**

### **Using Decorators**
```python
from services.error_middleware import handle_api_errors, validate_required_params, validate_json_body

# Automatic error handling
@app.route('/api/endpoint')
@handle_api_errors
def my_endpoint():
    # Exceptions automatically converted to standardized responses
    raise ValueError("This becomes a validation error")

# Parameter validation
@app.route('/api/endpoint')
@validate_required_params('username', 'draft_id')
@handle_api_errors
def my_endpoint():
    # Parameters guaranteed to exist
    username = request.args.get('username')
    draft_id = request.args.get('draft_id')

# JSON body validation
@app.route('/api/endpoint', methods=['POST'])
@validate_json_body(['name', 'email'])
@handle_api_errors
def my_endpoint():
    data = request.get_json()
    # JSON body guaranteed to have required fields
```

### **Manual Error Creation**
```python
from services.error_service import (
    validation_error, not_found_error, external_api_error,
    business_logic_error, internal_error
)

# Validation error
return jsonify(validation_error(
    field="draft_id",
    message="Invalid draft ID format",
    value=draft_id,
    context=generate_request_context()
)), 400

# Business logic error with suggestions
return jsonify(business_logic_error(
    message="No active draft selected",
    details="Please select a draft before accessing draft data",
    context=generate_request_context(),
    suggestions=[
        "Use the draft selection interface",
        "Call /api/draft/set with a draft_id",
        "Check your available drafts"
    ]
)), 400

# External API error with retry
return jsonify(external_api_error(
    service="Sleeper",
    message="Unable to connect to Sleeper API",
    status_code=503,
    context=generate_request_context()
)), 503
```

### **Service Error Handling**
```python
from services.error_middleware import handle_service_errors

class MyService:
    @handle_service_errors("MyService")
    def my_method(self, param):
        # Service logic with automatic error logging
        if not param:
            raise ValueError("param is required")
        return self.process(param)
```

---

## 🎨 **Frontend Usage**

### **API Hooks**
```jsx
import { useDraftApi, useUserApi, useApiWithToast } from './hooks/useApiWithToast';

// Specialized hooks with automatic error handling
const draftApi = useDraftApi();
const userApi = useUserApi();

// Generic hook with custom options
const api = useApiWithToast({
  showSuccessToast: true,
  successMessage: 'Operation completed!',
  showLoadingToast: true,
  loadingMessage: 'Processing...'
});

// Usage
const handleApiCall = async () => {
  try {
    const data = await draftApi.getDraftData(draftId);
    // Success - toast automatically shown if configured
  } catch (error) {
    // Error automatically displayed as toast with retry option
  }
};
```

### **Manual Toast Control**
```jsx
import toastService from './services/toastService';

// Show different toast types
toastService.showSuccess('Operation completed!');
toastService.showError('Something went wrong');
toastService.showWarning('Please check your input');
toastService.showInfo('Information message');

// Handle API errors manually
const handleManualApiCall = async () => {
  try {
    const response = await fetch('/api/endpoint');
    const data = await response.json();
    
    if (!response.ok) {
      // This will show standardized error toast
      toastService.handleApiError(data, () => handleManualApiCall());
    }
  } catch (error) {
    toastService.showError('Network error occurred');
  }
};

// Loading toasts
const loadingId = toastService.showLoading('Processing...');
// Later...
toastService.updateToSuccess(loadingId, 'Completed!');
// or
toastService.updateToError(loadingId, 'Failed!');
```

### **Toast Customization**
```jsx
// Custom toast with actions
toastService.showToast({
  type: 'warning',
  title: 'Custom Warning',
  message: 'This is a custom message',
  duration: 8000,
  actions: [
    { label: 'Retry', action: 'retry', style: 'primary' },
    { label: 'Cancel', action: 'dismiss', style: 'secondary' }
  ],
  suggestions: [
    'Try refreshing the page',
    'Check your connection'
  ]
});
```

---

## 🎨 **Styling**

### **CSS Classes**
```css
/* Toast types */
.toast-success { /* Green gradient */ }
.toast-error { /* Red gradient */ }
.toast-warning { /* Orange gradient */ }
.toast-info { /* Blue gradient */ }
.toast-loading { /* Gray gradient */ }

/* Action buttons */
.toast-action-primary { /* Primary button style */ }
.toast-action-secondary { /* Secondary button style */ }

/* Content areas */
.toast-title { /* Bold title */ }
.toast-message { /* Main message */ }
.toast-suggestions { /* Collapsible help */ }
```

### **Customization**
```css
/* Override default styles */
.Toastify__toast-container {
  width: 400px;
  font-family: 'Your Font';
}

.toast-error {
  background: your-custom-gradient;
}
```

---

## 🧪 **Testing**

### **Backend Testing**
```python
# Test error responses
def test_validation_error():
    response = client.get('/api/endpoint?invalid=param')
    assert response.status_code == 400
    data = response.get_json()
    assert data['error']['type'] == 'validation_error'
    assert data['error']['toast']['show'] == True

# Test error middleware
def test_error_middleware():
    with app.test_client() as client:
        response = client.get('/api/nonexistent')
        assert response.status_code == 404
        data = response.get_json()
        assert 'error' in data
```

### **Frontend Testing**
```jsx
// Test toast integration
import { render, screen, waitFor } from '@testing-library/react';
import { ToastContainer } from 'react-toastify';
import toastService from './services/toastService';

test('shows error toast on API failure', async () => {
  render(<ToastContainer />);
  
  const errorResponse = {
    error: {
      message: 'Test error',
      toast: { show: true, type: 'error', title: 'Error' }
    }
  };
  
  toastService.handleApiError(errorResponse);
  
  await waitFor(() => {
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });
});
```

---

## 📊 **Monitoring**

### **Error Statistics**
```bash
# Get error statistics
curl http://localhost:5001/api/error-stats

# Response
{
  "total_errors": 42,
  "error_counts": {
    "validation_error": 15,
    "not_found_error": 12,
    "external_api_error": 8,
    "internal_error": 7
  },
  "timestamp": "2025-01-27T22:00:00.000Z"
}
```

### **Logging**
```
🚨 ERROR [err_a1b2c3d4] validation_error: Username is required
   📋 Details: Field 'username' validation failed
   🔍 Context: endpoint=/api/user/info, draft_id=1255160696186880000
```

---

## 🔧 **Configuration**

### **Backend Configuration**
```python
# config.py
ERROR_HANDLING_ENABLED = True
TOAST_NOTIFICATIONS_ENABLED = True
ERROR_LOGGING_LEVEL = 'INFO'
ERROR_TRACKING_ENABLED = True
```

### **Frontend Configuration**
```javascript
// Toast service configuration
const toastService = new ToastService({
  defaultDuration: 5000,
  maxToasts: 5,
  position: 'top-right',
  enableRetry: true,
  enableSuggestions: true
});
```

---

## 🚀 **Best Practices**

### **Backend**
1. **Use decorators** for automatic error handling
2. **Provide context** for better debugging
3. **Include suggestions** for user guidance
4. **Categorize errors** appropriately
5. **Log errors** with structured data

### **Frontend**
1. **Use API hooks** for automatic error handling
2. **Provide retry callbacks** for recoverable errors
3. **Show loading states** for better UX
4. **Handle network errors** gracefully
5. **Clear toasts** when appropriate

### **User Experience**
1. **Clear error messages** that users understand
2. **Actionable suggestions** for problem resolution
3. **Appropriate toast duration** based on severity
4. **Retry functionality** for transient errors
5. **Help links** for complex issues

---

This error handling system provides a robust foundation for consistent error management across the Fantasy Football Draft API, with seamless integration between backend error responses and frontend toast notifications! 🏈🚨⚡
