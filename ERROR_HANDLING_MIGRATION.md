# Error Handling Migration Guide

## 🎯 **Migration Summary**

This document outlines the complete migration of the Fantasy Football Draft API from inconsistent error handling to a standardized error handling system with toast notifications.

---

## 📊 **What Was Changed**

### **Before (Inconsistent Error Patterns):**
```python
# Inconsistent error responses
return jsonify({'error': 'User not found'}), 404
return jsonify({'error': str(e)}), 500
print(f"Error getting user: {e}")  # Just logging
```

### **After (Standardized Error Handling):**
```python
# Standardized error responses with toast support
return jsonify(not_found_error(
    resource="User",
    resource_id=username,
    context=generate_request_context()
)), 404

# Automatic error handling with decorators
@handle_api_errors
def my_endpoint():
    # Exceptions automatically converted to standardized responses
```

---

## 🔄 **Files Updated**

### **New Error Handling System:**
- ✅ `services/error_service.py` - Core error handling service
- ✅ `services/error_middleware.py` - Decorators and middleware
- ✅ `frontend/src/services/toastService.js` - Toast notification service
- ✅ `frontend/src/hooks/useApiWithToast.js` - API hooks with error handling
- ✅ `frontend/src/styles/toast.css` - Toast styling

### **Updated Backend Files:**
- ✅ `routes/user_routes_updated.py` - User routes with error handling
- ✅ `routes/draft_routes_updated.py` - Draft routes with error handling  
- ✅ `routes/rankings_routes_updated.py` - Rankings routes with error handling
- ✅ `services/sleeper_api_updated.py` - Sleeper API with error handling
- ✅ `app.py` - Main application with full integration

### **Frontend Integration:**
- ✅ `components/ToastExample.jsx` - Integration example
- ✅ Error handling hooks for automatic toast display
- ✅ Retry functionality and user guidance

---

## 🚀 **Migration Steps**

### **Step 1: Backend Migration**
```bash
# 1. Copy new error handling services
cp services/error_service.py services/error_middleware.py ./services/

# 2. Replace route files
cp routes/*_updated.py ./routes/

# 3. Update main application
cp app.py ./app.py

# 4. Update service files
cp services/sleeper_api_updated.py ./services/sleeper_api.py
```

### **Step 2: Frontend Migration**
```bash
# 1. Install dependencies
npm install react-toastify

# 2. Copy toast service and hooks
cp frontend/src/services/toastService.js ./frontend/src/services/
cp frontend/src/hooks/useApiWithToast.js ./frontend/src/hooks/
cp frontend/src/styles/toast.css ./frontend/src/styles/

# 3. Update your main App component
```

### **Step 3: Integration**
```jsx
// Add to your main App.jsx
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

---

## 📋 **Error Pattern Changes**

### **1. Route Error Handling**

**Before:**
```python
@app.route('/api/user/<username>')
def get_user_info(username):
    user_info = SleeperAPI.get_user(username)
    if user_info:
        return jsonify(user_info)
    else:
        return jsonify({'error': 'User not found'}), 404
```

**After:**
```python
@user_bp.route('/api/user/<username>')
@handle_api_errors
def get_user_info(username):
    context = generate_request_context()
    
    if not validate_username(username):
        return jsonify(validation_error(
            field="username",
            message="Invalid username format",
            value=username,
            context=context
        )), 400
    
    user_info = SleeperAPI.get_user(username)
    
    if not user_info:
        return jsonify(not_found_error(
            resource="User",
            resource_id=username,
            context=context
        )), 404
    
    return jsonify(user_info)
```

### **2. Service Error Handling**

**Before:**
```python
def get_user(username):
    try:
        response = requests.get(f"{BASE_URL}/user/{username}")
        if response.status_code == 200:
            return response.json()
        return None
    except Exception as e:
        print(f"Error getting user: {e}")
        return None
```

**After:**
```python
@handle_service_errors("SleeperAPI")
def get_user(username):
    if not username or not isinstance(username, str):
        raise ValueError("Username must be a non-empty string")
    
    try:
        response = requests.get(f"{BASE_URL}/user/{username}", timeout=10)
        
        if response.status_code == 404:
            return None  # User not found is not an error
        
        response.raise_for_status()
        return response.json()
        
    except requests.exceptions.Timeout:
        raise TimeoutError(f"Timeout while fetching user {username}")
    except requests.exceptions.ConnectionError:
        raise ConnectionError("Unable to connect to Sleeper API")
```

### **3. Frontend Error Handling**

**Before:**
```jsx
const handleApiCall = async () => {
  try {
    const response = await fetch('/api/endpoint');
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || 'Something went wrong');
    }
  } catch (error) {
    alert('Network error');
  }
};
```

**After:**
```jsx
const api = useDraftApi();

const handleApiCall = async () => {
  try {
    const data = await api.getDraftData(draftId);
    // Success toast automatically shown if configured
  } catch (error) {
    // Error automatically displayed as toast with retry option
  }
};
```

---

## 🎯 **Key Improvements**

### **1. Consistent Error Responses**
- All errors now follow the same JSON structure
- Toast notification data included in every error
- Context tracking for better debugging
- Suggestions provided for user guidance

### **2. Better User Experience**
- Automatic toast notifications for all errors
- Retry functionality for recoverable errors
- Loading states and success notifications
- Clear, actionable error messages

### **3. Developer Experience**
- Decorators for automatic error handling
- Centralized error logic
- Structured logging with context
- Easy integration with existing code

### **4. Monitoring & Debugging**
- Error statistics endpoint
- Request tracking with IDs
- Comprehensive logging
- Error frequency monitoring

---

## 🧪 **Testing the Migration**

### **Backend Testing**
```bash
# 1. Start the updated server
python app.py

# 2. Test health check
curl http://localhost:5001/api/health

# 3. Test error types
curl http://localhost:5001/api/demo/errors/validation
curl http://localhost:5001/api/demo/errors/not_found
curl http://localhost:5001/api/demo/errors/external_api

# 4. Test real endpoints
curl http://localhost:5001/api/user/nonexistent_user
curl http://localhost:5001/api/draft/invalid_draft_id
```

### **Frontend Testing**
```jsx
// Use the ToastExample component to test integration
import ToastExample from './components/ToastExample';

function App() {
  return (
    <div>
      <ToastExample />
      <ToastContainer position="top-right" />
    </div>
  );
}
```

---

## 📊 **Error Statistics**

### **Before Migration:**
- ❌ Inconsistent error formats
- ❌ No user guidance
- ❌ Poor debugging information
- ❌ No retry functionality
- ❌ Alert-based error display

### **After Migration:**
- ✅ Standardized error responses
- ✅ Toast notifications with actions
- ✅ Context tracking and suggestions
- ✅ Automatic retry functionality
- ✅ Beautiful, accessible error display

---

## 🔧 **Configuration Options**

### **Backend Configuration**
```python
# config.py
ERROR_HANDLING_ENABLED = True
TOAST_NOTIFICATIONS_ENABLED = True
ERROR_CONTEXT_TRACKING = True
ERROR_STATISTICS_ENABLED = True
```

### **Frontend Configuration**
```javascript
// Toast service configuration
const toastConfig = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true
};
```

---

## 🚨 **Breaking Changes**

### **API Response Format**
- Error responses now include `error` object with toast data
- Success responses remain unchanged
- HTTP status codes remain the same

### **Frontend Integration**
- Must install `react-toastify` dependency
- Must add `<ToastContainer />` to app
- Recommended to use new API hooks for automatic error handling

---

## 🎯 **Next Steps**

1. **Test thoroughly** - Verify all endpoints work with new error handling
2. **Update frontend** - Integrate toast notifications in your components
3. **Monitor errors** - Use `/api/error-stats` endpoint for monitoring
4. **Customize styling** - Adjust toast.css to match your design
5. **Add more error types** - Extend error service as needed

---

## 📞 **Support**

If you encounter issues during migration:

1. Check the error logs for specific error messages
2. Test individual endpoints with curl
3. Verify toast container is properly configured
4. Review the ToastExample component for integration patterns
5. Check error statistics endpoint for debugging information

The migration provides a robust foundation for consistent error handling across the entire Fantasy Football Draft API! 🏈🚨⚡
