"""
Simple authentication decorator for Flask routes.
Checks JWT tokens from cookies or Authorization header.
"""
from functools import wraps
from flask import request, jsonify, g
from utils.jwt_utils import verify_token



def auth_required(f):
    """
    Simple decorator that requires authentication.
    Checks for JWT token in:
    1. HTTP-only cookie named 'auth_token'
    2. Authorization header (Bearer token)
    
    If valid token found, stores user in g.current_user
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Try to get token from cookie first
        token = request.cookies.get('auth_token')
        
        # If no cookie, try Authorization header
        if not token:
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        # If no token found
        if not token:
            return jsonify({
                'error': 'Authentication required',
                'message': 'No token provided'
            }), 401
        
        # Verify the token
        user = verify_token(token)
        if not user:
            return jsonify({
                'error': 'Invalid token',
                'message': 'Token is invalid or expired'
            }), 401
        
        # Store user in Flask's g object for use in the route
        g.current_user = user
        
        # Call the original function
        return f(*args, **kwargs)
    
    return decorated_function

def role_required(required_role):
    """
    Decorator factory that enforces a specific user role.
    Usage: @role_required('admin')
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Try to get token from cookie first
            token = request.cookies.get('auth_token')
            
            # If no cookie, try Authorization header
            if not token:
                auth_header = request.headers.get('Authorization')
                if auth_header and auth_header.startswith('Bearer '):
                    token = auth_header.split(' ')[1]
            
            # If no token found
            if not token:
                return jsonify({
                    'error': 'Authentication required',
                    'message': 'No token provided'
                }), 401
            
            # Verify the token
            user = verify_token(token)
            if not user:
                return jsonify({
                    'error': 'Invalid token',
                    'message': 'Token is invalid or expired'
                }), 401
            
            # Check if user has the required role
            if getattr(user, 'role', None) != required_role:
                return jsonify({
                    'error': 'Access denied',
                    'message': 'Role required'
                }), 403
            
            # Store user in Flask's g object for use in the route
            g.current_user = user
            
            # Call the original function
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def get_current_user():
    """
    Helper function to get the current authenticated user.
    Should be called from within a route decorated with @auth_required
    """
    return getattr(g, 'current_user', None)


def admin_required(f):
    """
    Simple decorator that requires authentication.
    Checks for JWT token in:
    1. HTTP-only cookie named 'auth_token'
    2. Authorization header (Bearer token)
    
    If valid token found, stores user in g.current_user
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Try to get token from cookie first
        token = request.cookies.get('auth_token')
        
        # If no cookie, try Authorization header
        if not token:
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        # If no token found
        if not token:
            return jsonify({
                'error': 'Authentication required',
                'message': 'No token provided'
            }), 401
        
        # Verify the token
        user = verify_token(token)
        if not user:
            return jsonify({
                'error': 'Invalid token',
                'message': 'Token is invalid or expired'
            }), 401
        
        # Check if user is admin
        if user.role != 'admin':
            return jsonify({
                'error': 'Access denied',
                'message': 'Admin role required'
            }), 403
        
        # Store user in Flask's g object for use in the route
        g.current_user = user
        
        # Call the original function
        return f(*args, **kwargs)
    
    return decorated_function