"""
Error Service

This module provides standardized error handling and response formatting for the Fantasy Football Draft API.
It creates consistent error responses that can be easily consumed by the frontend toast notification system.
"""

import traceback
from datetime import datetime
from enum import Enum
from typing import Dict, Any, Optional, List
from dataclasses import dataclass


class ErrorType(Enum):
    """Standardized error types for consistent categorization"""
    VALIDATION = "validation_error"
    NOT_FOUND = "not_found_error"
    AUTHENTICATION = "authentication_error"
    AUTHORIZATION = "authorization_error"
    EXTERNAL_API = "external_api_error"
    INTERNAL = "internal_error"
    RATE_LIMIT = "rate_limit_error"
    TIMEOUT = "timeout_error"
    CONFLICT = "conflict_error"
    BUSINESS_LOGIC = "business_logic_error"


class ErrorSeverity(Enum):
    """Error severity levels for frontend display"""
    LOW = "low"          # Info-level, user can continue
    MEDIUM = "medium"    # Warning-level, user should be aware
    HIGH = "high"        # Error-level, blocks user action
    CRITICAL = "critical" # System-level, requires immediate attention


@dataclass
class ErrorContext:
    """Additional context information for errors"""
    user_id: Optional[str] = None
    draft_id: Optional[str] = None
    league_id: Optional[str] = None
    endpoint: Optional[str] = None
    request_id: Optional[str] = None
    user_agent: Optional[str] = None


class ErrorService:
    """Service for standardized error handling and response formatting"""
    
    def __init__(self):
        self.error_counts = {}  # For tracking error frequency
        
    def create_error_response(
        self,
        error_type: ErrorType,
        message: str,
        severity: ErrorSeverity = ErrorSeverity.MEDIUM,
        details: Optional[str] = None,
        context: Optional[ErrorContext] = None,
        suggestions: Optional[List[str]] = None,
        retry_after: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Create a standardized error response for API endpoints.
        
        Args:
            error_type: Type of error from ErrorType enum
            message: User-friendly error message
            severity: Error severity level
            details: Technical details for debugging (optional)
            context: Additional context information (optional)
            suggestions: List of suggested actions for the user (optional)
            retry_after: Seconds to wait before retrying (optional)
            
        Returns:
            Standardized error response dictionary
        """
        error_id = self._generate_error_id()
        timestamp = datetime.now().isoformat()
        
        # Track error frequency
        self._track_error(error_type, context)
        
        # Build base error response
        error_response = {
            "error": {
                "id": error_id,
                "type": error_type.value,
                "severity": severity.value,
                "message": message,
                "timestamp": timestamp,
                "toast": {
                    "show": True,
                    "title": self._get_toast_title(error_type, severity),
                    "message": message,
                    "type": self._get_toast_type(severity),
                    "duration": self._get_toast_duration(severity),
                    "actions": self._get_toast_actions(error_type, suggestions)
                }
            }
        }
        
        # Add optional fields
        if details:
            error_response["error"]["details"] = details
            
        if context:
            error_response["error"]["context"] = {
                "user_id": context.user_id,
                "draft_id": context.draft_id,
                "league_id": context.league_id,
                "endpoint": context.endpoint,
                "request_id": context.request_id
            }
            
        if suggestions:
            error_response["error"]["suggestions"] = suggestions
            
        if retry_after:
            error_response["error"]["retry_after"] = retry_after
            
        # Log error for debugging
        self._log_error(error_response["error"])
        
        return error_response
    
    def create_validation_error(
        self,
        field: str,
        message: str,
        value: Any = None,
        context: Optional[ErrorContext] = None
    ) -> Dict[str, Any]:
        """Create a validation error response"""
        details = f"Field '{field}' validation failed"
        if value is not None:
            details += f" with value: {value}"
            
        suggestions = [
            f"Please check the '{field}' field and try again",
            "Refer to the API documentation for valid formats"
        ]
        
        return self.create_error_response(
            error_type=ErrorType.VALIDATION,
            message=message,
            severity=ErrorSeverity.MEDIUM,
            details=details,
            context=context,
            suggestions=suggestions
        )
    
    def create_not_found_error(
        self,
        resource: str,
        resource_id: str,
        context: Optional[ErrorContext] = None
    ) -> Dict[str, Any]:
        """Create a not found error response"""
        message = f"{resource} not found"
        details = f"{resource} with ID '{resource_id}' does not exist"
        
        suggestions = [
            f"Verify the {resource.lower()} ID is correct",
            f"Check if the {resource.lower()} exists in Sleeper",
            "Try refreshing the data"
        ]
        
        return self.create_error_response(
            error_type=ErrorType.NOT_FOUND,
            message=message,
            severity=ErrorSeverity.MEDIUM,
            details=details,
            context=context,
            suggestions=suggestions
        )
    
    def create_external_api_error(
        self,
        service: str,
        message: str,
        status_code: Optional[int] = None,
        context: Optional[ErrorContext] = None
    ) -> Dict[str, Any]:
        """Create an external API error response"""
        details = f"{service} API error"
        if status_code:
            details += f" (HTTP {status_code})"
            
        suggestions = [
            "Please try again in a few moments",
            f"Check {service} service status",
            "Contact support if the issue persists"
        ]
        
        retry_after = 30 if status_code in [429, 503] else None
        
        return self.create_error_response(
            error_type=ErrorType.EXTERNAL_API,
            message=message,
            severity=ErrorSeverity.HIGH,
            details=details,
            context=context,
            suggestions=suggestions,
            retry_after=retry_after
        )
    
    def create_business_logic_error(
        self,
        message: str,
        details: Optional[str] = None,
        context: Optional[ErrorContext] = None,
        suggestions: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Create a business logic error response"""
        default_suggestions = [
            "Please check your input and try again",
            "Refer to the help documentation",
            "Contact support if you need assistance"
        ]
        
        return self.create_error_response(
            error_type=ErrorType.BUSINESS_LOGIC,
            message=message,
            severity=ErrorSeverity.MEDIUM,
            details=details,
            context=context,
            suggestions=suggestions or default_suggestions
        )
    
    def create_internal_error(
        self,
        message: str = "An unexpected error occurred",
        exception: Optional[Exception] = None,
        context: Optional[ErrorContext] = None
    ) -> Dict[str, Any]:
        """Create an internal server error response"""
        details = "Internal server error"
        if exception:
            details += f": {str(exception)}"
            
        suggestions = [
            "Please try again in a few moments",
            "Contact support if the issue persists",
            "Check the system status page"
        ]
        
        return self.create_error_response(
            error_type=ErrorType.INTERNAL,
            message=message,
            severity=ErrorSeverity.CRITICAL,
            details=details,
            context=context,
            suggestions=suggestions
        )
    
    def _generate_error_id(self) -> str:
        """Generate a unique error ID for tracking"""
        import uuid
        return f"err_{uuid.uuid4().hex[:8]}"
    
    def _track_error(self, error_type: ErrorType, context: Optional[ErrorContext]):
        """Track error frequency for monitoring"""
        key = error_type.value
        if context and context.endpoint:
            key += f":{context.endpoint}"
            
        self.error_counts[key] = self.error_counts.get(key, 0) + 1
    
    def _get_toast_title(self, error_type: ErrorType, severity: ErrorSeverity) -> str:
        """Get appropriate toast title based on error type and severity"""
        if severity == ErrorSeverity.CRITICAL:
            return "System Error"
        elif error_type == ErrorType.VALIDATION:
            return "Invalid Input"
        elif error_type == ErrorType.NOT_FOUND:
            return "Not Found"
        elif error_type == ErrorType.EXTERNAL_API:
            return "Service Unavailable"
        elif error_type == ErrorType.BUSINESS_LOGIC:
            return "Action Not Allowed"
        else:
            return "Error"
    
    def _get_toast_type(self, severity: ErrorSeverity) -> str:
        """Get toast type for frontend styling"""
        if severity == ErrorSeverity.LOW:
            return "info"
        elif severity == ErrorSeverity.MEDIUM:
            return "warning"
        elif severity in [ErrorSeverity.HIGH, ErrorSeverity.CRITICAL]:
            return "error"
        else:
            return "warning"
    
    def _get_toast_duration(self, severity: ErrorSeverity) -> int:
        """Get toast display duration in milliseconds"""
        if severity == ErrorSeverity.LOW:
            return 3000  # 3 seconds
        elif severity == ErrorSeverity.MEDIUM:
            return 5000  # 5 seconds
        elif severity == ErrorSeverity.HIGH:
            return 8000  # 8 seconds
        elif severity == ErrorSeverity.CRITICAL:
            return 0     # Persistent (manual dismiss)
        else:
            return 5000
    
    def _get_toast_actions(self, error_type: ErrorType, suggestions: Optional[List[str]]) -> List[Dict]:
        """Get toast action buttons"""
        actions = []
        
        # Always add dismiss action
        actions.append({
            "label": "Dismiss",
            "action": "dismiss",
            "style": "secondary"
        })
        
        # Add retry action for certain error types
        if error_type in [ErrorType.EXTERNAL_API, ErrorType.TIMEOUT]:
            actions.append({
                "label": "Retry",
                "action": "retry",
                "style": "primary"
            })
        
        # Add help action if suggestions are provided
        if suggestions:
            actions.append({
                "label": "Help",
                "action": "show_help",
                "style": "secondary"
            })
        
        return actions
    
    def _log_error(self, error_data: Dict):
        """Log error for debugging and monitoring"""
        error_type = error_data.get("type", "unknown")
        error_id = error_data.get("id", "unknown")
        message = error_data.get("message", "No message")
        
        print(f"🚨 ERROR [{error_id}] {error_type}: {message}")
        
        if error_data.get("details"):
            print(f"   📋 Details: {error_data['details']}")
            
        if error_data.get("context"):
            context = error_data["context"]
            print(f"   🔍 Context: endpoint={context.get('endpoint')}, "
                  f"draft_id={context.get('draft_id')}, user_id={context.get('user_id')}")
    
    def get_error_stats(self) -> Dict[str, Any]:
        """Get error statistics for monitoring"""
        return {
            "total_errors": sum(self.error_counts.values()),
            "error_counts": self.error_counts.copy(),
            "timestamp": datetime.now().isoformat()
        }


# Global error service instance
error_service = ErrorService()


# Convenience functions for common error types
def validation_error(field: str, message: str, value: Any = None, context: Optional[ErrorContext] = None):
    """Create a validation error response"""
    return error_service.create_validation_error(field, message, value, context)


def not_found_error(resource: str, resource_id: str, context: Optional[ErrorContext] = None):
    """Create a not found error response"""
    return error_service.create_not_found_error(resource, resource_id, context)


def external_api_error(service: str, message: str, status_code: Optional[int] = None, context: Optional[ErrorContext] = None):
    """Create an external API error response"""
    return error_service.create_external_api_error(service, message, status_code, context)


def business_logic_error(message: str, details: Optional[str] = None, context: Optional[ErrorContext] = None, suggestions: Optional[List[str]] = None):
    """Create a business logic error response"""
    return error_service.create_business_logic_error(message, details, context, suggestions)


def internal_error(message: str = "An unexpected error occurred", exception: Optional[Exception] = None, context: Optional[ErrorContext] = None):
    """Create an internal server error response"""
    return error_service.create_internal_error(message, exception, context)
