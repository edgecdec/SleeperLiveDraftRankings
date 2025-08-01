"""
Error Middleware

This module provides decorators and middleware for automatic error handling
and standardized error response formatting across all API endpoints.
"""

import functools
import traceback
from flask import request, jsonify
from typing import Callable, Any, Optional
from .error_service import (
    error_service, ErrorContext, ErrorType, ErrorSeverity,
    validation_error, not_found_error, external_api_error, 
    business_logic_error, internal_error
)


def generate_request_context() -> ErrorContext:
    """Generate error context from current Flask request"""
    return ErrorContext(
        endpoint=request.endpoint,
        request_id=request.headers.get('X-Request-ID'),
        user_agent=request.headers.get('User-Agent'),
        # These would be populated from authentication/session data
        user_id=request.headers.get('X-User-ID'),
        draft_id=request.args.get('draft_id'),
        league_id=request.args.get('league_id') or (request.view_args.get('league_id') if request.view_args else None)
    )


def handle_api_errors(f: Callable) -> Callable:
    """
    Decorator for automatic error handling in API endpoints.
    
    This decorator catches common exceptions and converts them to
    standardized error responses with toast notification data.
    
    Usage:
        @app.route('/api/endpoint')
        @handle_api_errors
        def my_endpoint():
            # Your endpoint logic here
            return jsonify(result)
    """
    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
            
        except ValueError as e:
            # Validation or input errors
            context = generate_request_context()
            error_response = validation_error(
                field="input",
                message=str(e),
                context=context
            )
            return jsonify(error_response), 400
            
        except KeyError as e:
            # Missing required data
            context = generate_request_context()
            error_response = validation_error(
                field=str(e).strip("'\""),
                message=f"Required field {e} is missing",
                context=context
            )
            return jsonify(error_response), 400
            
        except FileNotFoundError as e:
            # File or resource not found
            context = generate_request_context()
            error_response = not_found_error(
                resource="File",
                resource_id=str(e),
                context=context
            )
            return jsonify(error_response), 404
            
        except ConnectionError as e:
            # External API connection issues
            context = generate_request_context()
            error_response = external_api_error(
                service="External Service",
                message="Unable to connect to external service",
                context=context
            )
            return jsonify(error_response), 503
            
        except TimeoutError as e:
            # Request timeout
            context = generate_request_context()
            error_response = error_service.create_error_response(
                error_type=ErrorType.TIMEOUT,
                message="Request timed out",
                severity=ErrorSeverity.HIGH,
                details=str(e),
                context=context,
                suggestions=[
                    "Please try again",
                    "Check your internet connection",
                    "Contact support if the issue persists"
                ],
                retry_after=30
            )
            return jsonify(error_response), 408
            
        except Exception as e:
            # Unexpected internal errors
            context = generate_request_context()
            error_response = internal_error(
                message="An unexpected error occurred",
                exception=e,
                context=context
            )
            
            # Log full traceback for debugging
            print(f"🚨 INTERNAL ERROR in {request.endpoint}:")
            print(traceback.format_exc())
            
            return jsonify(error_response), 500
    
    return wrapper


def handle_service_errors(service_name: str):
    """
    Decorator for service method error handling.
    
    This decorator is used within service classes to provide
    consistent error handling and logging.
    
    Usage:
        class MyService:
            @handle_service_errors("MyService")
            def my_method(self, param):
                # Service logic here
                return result
    """
    def decorator(f: Callable) -> Callable:
        @functools.wraps(f)
        def wrapper(*args, **kwargs):
            try:
                return f(*args, **kwargs)
                
            except ValueError as e:
                print(f"⚠️ {service_name} validation error in {f.__name__}: {e}")
                raise
                
            except ConnectionError as e:
                print(f"🌐 {service_name} connection error in {f.__name__}: {e}")
                raise
                
            except Exception as e:
                print(f"❌ {service_name} unexpected error in {f.__name__}: {e}")
                print(f"   📋 Traceback: {traceback.format_exc()}")
                raise
        
        return wrapper
    return decorator


def validate_required_params(*required_params):
    """
    Decorator to validate required parameters in API endpoints.
    
    Usage:
        @app.route('/api/endpoint')
        @validate_required_params('username', 'draft_id')
        @handle_api_errors
        def my_endpoint():
            # Parameters are guaranteed to exist
            username = request.args.get('username')
            draft_id = request.args.get('draft_id')
    """
    def decorator(f: Callable) -> Callable:
        @functools.wraps(f)
        def wrapper(*args, **kwargs):
            context = generate_request_context()
            
            # Check query parameters
            for param in required_params:
                if param not in request.args or not request.args.get(param):
                    error_response = validation_error(
                        field=param,
                        message=f"Required parameter '{param}' is missing or empty",
                        context=context
                    )
                    return jsonify(error_response), 400
            
            # Check JSON body parameters if POST/PUT
            if request.method in ['POST', 'PUT'] and request.is_json:
                data = request.get_json() or {}
                for param in required_params:
                    if param not in data or data.get(param) is None:
                        error_response = validation_error(
                            field=param,
                            message=f"Required field '{param}' is missing from request body",
                            context=context
                        )
                        return jsonify(error_response), 400
            
            return f(*args, **kwargs)
        
        return wrapper
    return decorator


def validate_json_body(required_fields: Optional[list] = None):
    """
    Decorator to validate JSON request body.
    
    Usage:
        @app.route('/api/endpoint', methods=['POST'])
        @validate_json_body(['username', 'draft_id'])
        @handle_api_errors
        def my_endpoint():
            data = request.get_json()
            # JSON body is guaranteed to exist with required fields
    """
    def decorator(f: Callable) -> Callable:
        @functools.wraps(f)
        def wrapper(*args, **kwargs):
            context = generate_request_context()
            
            # Check if request has JSON body
            if not request.is_json:
                error_response = validation_error(
                    field="content-type",
                    message="Request must have Content-Type: application/json",
                    context=context
                )
                return jsonify(error_response), 400
            
            # Get JSON data
            try:
                data = request.get_json()
            except Exception as e:
                error_response = validation_error(
                    field="json",
                    message="Invalid JSON format in request body",
                    context=context
                )
                return jsonify(error_response), 400
            
            if data is None:
                error_response = validation_error(
                    field="body",
                    message="Request body cannot be empty",
                    context=context
                )
                return jsonify(error_response), 400
            
            # Check required fields
            if required_fields:
                for field in required_fields:
                    if field not in data or data.get(field) is None:
                        error_response = validation_error(
                            field=field,
                            message=f"Required field '{field}' is missing from request body",
                            value=data.get(field),
                            context=context
                        )
                        return jsonify(error_response), 400
            
            return f(*args, **kwargs)
        
        return wrapper
    return decorator


class ErrorHandlingMiddleware:
    """
    Flask middleware for global error handling and request/response processing.
    """
    
    def __init__(self, app=None):
        self.app = app
        if app is not None:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize the middleware with Flask app"""
        app.before_request(self.before_request)
        app.after_request(self.after_request)
        app.errorhandler(404)(self.handle_404)
        app.errorhandler(405)(self.handle_405)
        app.errorhandler(500)(self.handle_500)
    
    def before_request(self):
        """Process request before handling"""
        # Add request ID for tracking
        if 'X-Request-ID' not in request.headers:
            import uuid
            request.request_id = f"req_{uuid.uuid4().hex[:8]}"
        else:
            request.request_id = request.headers.get('X-Request-ID')
        
        # Log request
        print(f"📥 {request.method} {request.path} [{request.request_id}]")
    
    def after_request(self, response):
        """Process response after handling"""
        # Add request ID to response headers
        response.headers['X-Request-ID'] = getattr(request, 'request_id', 'unknown')
        
        # Log response
        print(f"📤 {response.status_code} {request.path} [{getattr(request, 'request_id', 'unknown')}]")
        
        return response
    
    def handle_404(self, error):
        """Handle 404 Not Found errors"""
        context = generate_request_context()
        error_response = not_found_error(
            resource="Endpoint",
            resource_id=request.path,
            context=context
        )
        return jsonify(error_response), 404
    
    def handle_405(self, error):
        """Handle 405 Method Not Allowed errors"""
        context = generate_request_context()
        error_response = error_service.create_error_response(
            error_type=ErrorType.VALIDATION,
            message=f"Method {request.method} not allowed for this endpoint",
            severity=ErrorSeverity.MEDIUM,
            details=f"Endpoint {request.path} does not support {request.method} method",
            context=context,
            suggestions=[
                "Check the API documentation for supported methods",
                "Verify you're using the correct HTTP method"
            ]
        )
        return jsonify(error_response), 405
    
    def handle_500(self, error):
        """Handle 500 Internal Server Error"""
        context = generate_request_context()
        error_response = internal_error(
            message="Internal server error",
            exception=error,
            context=context
        )
        
        # Log full error details
        print(f"🚨 UNHANDLED 500 ERROR:")
        print(traceback.format_exc())
        
        return jsonify(error_response), 500


# Convenience functions for common validation patterns
def validate_sleeper_id(id_value: str, id_type: str) -> bool:
    """Validate Sleeper ID format"""
    if not id_value or not isinstance(id_value, str):
        return False
    
    # Sleeper IDs are typically 18-19 digit strings
    if not id_value.isdigit() or len(id_value) < 15:
        return False
    
    return True


def validate_username(username: str) -> bool:
    """Validate Sleeper username format"""
    if not username or not isinstance(username, str):
        return False
    
    # Basic username validation
    if len(username) < 1 or len(username) > 50:
        return False
    
    return True


def validate_rankings_format(format_id: str) -> bool:
    """Validate rankings format ID"""
    valid_formats = [
        'standard_standard', 'standard_superflex',
        'half_ppr_standard', 'half_ppr_superflex',
        'ppr_standard', 'ppr_superflex'
    ]
    return format_id in valid_formats
