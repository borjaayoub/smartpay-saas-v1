from flask import Blueprint
from controllers.contribution_rate_controller import create_contribution_rate, get_all_contribution_rates, get_contribution_rate_by_id, update_contribution_rate, delete_contribution_rate
from utils.auth_decorator import auth_required, role_required

# Create contribution rate blueprint
contribution_rate_bp = Blueprint('contribution_rate', __name__)

@contribution_rate_bp.route('/', methods=['POST'])
@auth_required
@role_required('admin')
def create():
    """Create a new contribution rate"""
    return create_contribution_rate()


@contribution_rate_bp.route('/', methods=['GET'])
@auth_required
def get_all():
    """Get all contribution rates"""
    return get_all_contribution_rates()

@contribution_rate_bp.route('/<contribution_rate_id>', methods=['GET'])
@auth_required
def get_by_id(contribution_rate_id):
    """Get a contribution rate by id"""
    return get_contribution_rate_by_id(contribution_rate_id)

@contribution_rate_bp.route('/<contribution_rate_id>', methods=['PUT'])
@auth_required
@role_required('admin')
def update(contribution_rate_id):
    """Update a contribution rate"""
    return update_contribution_rate(contribution_rate_id)

@contribution_rate_bp.route('/<contribution_rate_id>', methods=['DELETE'])
@auth_required
@role_required('admin')
def delete(contribution_rate_id):
    """Delete a contribution rate"""
    return delete_contribution_rate(contribution_rate_id)
