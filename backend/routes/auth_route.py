from flask import Blueprint
from controllers.auth_controller import register_user, login_user, logout_user, get_current_user
from utils.auth_decorator import auth_required

# Create authentication blueprint
auth_bp = Blueprint('auth', __name__)

# Public routes (no authentication required)
@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    return register_user()

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login a user"""
    return login_user()

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout a user"""
    return logout_user()

@auth_bp.route('/me', methods=['GET'])
@auth_required
def me():
    """Get current user"""
    return get_current_user()

