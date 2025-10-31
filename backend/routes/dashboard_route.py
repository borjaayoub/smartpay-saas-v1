from flask import Blueprint
from controllers.dashboard_controller import get_dashboard_stats
from utils.auth_decorator import auth_required

# Create dashboard blueprint
dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/stats', methods=['GET'])
@auth_required
def get_stats():
    """Get dashboard statistics"""
    return get_dashboard_stats()

