"""
Configuration file for Flask application.
Handles environment variables and application settings.
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Base configuration class with common settings."""
    
    # Flask settings
    SECRET_KEY = os.environ.get('SECRET_KEY')
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    # SQLAlchemy settings
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or os.environ.get('SQLALCHEMY_DATABASE_URI') or 'postgresql://postgres:5846@localhost:5432/smartpay_db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT settings
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    JWT_ACCESS_TOKEN_EXPIRES = int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRES', 3600))  # 1 hour
    
    # Cookie settings for JWT
    JWT_COOKIE_SECURE = os.environ.get('JWT_COOKIE_SECURE', 'False').lower() == 'true'
    JWT_COOKIE_HTTPONLY = os.environ.get('JWT_COOKIE_HTTPONLY', 'True').lower() == 'true'
    JWT_COOKIE_SAMESITE = os.environ.get('JWT_COOKIE_SAMESITE', 'None' if os.environ.get('FLASK_ENV') == 'production' else 'Lax')
    
    # CORS settings
    # Use explicit origins to support credentials; '*' is invalid with credentials
    CORS_ORIGINS = os.environ.get(
        'CORS_ORIGINS',
        'http://localhost:5173,http://localhost:5000'
    ).split(',')

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    JWT_COOKIE_SECURE = False

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    JWT_COOKIE_SECURE = True

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}