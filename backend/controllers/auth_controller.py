from flask import request, jsonify, make_response
from models import db
from models.user import User
from utils.jwt_utils import generate_token
from config import Config


def register_user():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'role']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        user = User(
            email=data['email'],
            role=data['role']
        )
        user.set_password(data['password'])
        db.session.add(user)
        db.session.flush()
        db.session.commit()

        # Generate JWT token
        token = generate_token(user)

        

        response = make_response(jsonify({
            'message': 'User registered successfully', 
            'token': token,
            'user': user.to_dict()
        }), 201)
        
        # Set JWT token in HTTP-only cookie
        response.set_cookie(
            'auth_token',
            token,
            max_age=Config.JWT_ACCESS_TOKEN_EXPIRES,
            httponly=Config.JWT_COOKIE_HTTPONLY,
            secure=Config.JWT_COOKIE_SECURE,
            samesite=Config.JWT_COOKIE_SAMESITE
        )

        return response

    except Exception as e:
        return jsonify({
            'error': 'Registration failed', 
            'details': str(e)
        }), 500


def login_user():
    """Login a user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find user by email
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 401
        
        # Generate JWT token
        token = generate_token(user)
        
        response = make_response(jsonify({
            'message': 'Login successful',
            'token': token,
            'user': user.to_dict()
        }), 200)
        
        # Set JWT token in HTTP-only cookie
        response.set_cookie(
            'auth_token',
            token,
            max_age=Config.JWT_ACCESS_TOKEN_EXPIRES,
            httponly=Config.JWT_COOKIE_HTTPONLY,
            secure=Config.JWT_COOKIE_SECURE,
            samesite=Config.JWT_COOKIE_SAMESITE
        )
        
        return response
        
    except Exception as e:
        return jsonify({
            'error': 'Login failed',
            'details': str(e)
        }), 500


def logout_user():
    """Logout a user"""
    try:
        response = make_response(jsonify({
            'message': 'Logout successful'
        }), 200)
        # Clear the auth token cookie
        response.set_cookie(
            'auth_token',
            '',
            max_age=0,
            httponly=Config.JWT_COOKIE_HTTPONLY,
            secure=Config.JWT_COOKIE_SECURE,
            samesite=Config.JWT_COOKIE_SAMESITE
        )
        return response

    except Exception as e:
        return jsonify({
            'error': 'Logout failed',
            'details': str(e)
        }), 500


def get_current_user():
    """Get current authenticated user"""
    try:
        from utils.auth_decorator import get_current_user as get_user
        user = get_user()
        token = request.cookies.get('auth_token')
        if not user:
            return jsonify({
                'error': 'No authenticated user',
                'message': 'No token provided'
                }), 401
    
        return jsonify({
            'message': 'User retrieved successfully',
            'token': token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to get current user',
            'details': str(e)
        }), 500