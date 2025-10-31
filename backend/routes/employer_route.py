from flask import Blueprint
from controllers.employer_controller import create_employer, get_all_employers, get_employer_by_id, update_employer, delete_employer
from utils.auth_decorator import auth_required, role_required

# Create employer blueprint
employer_bp = Blueprint('employer', __name__)

@employer_bp.route('/', methods=['POST'])
@auth_required
@role_required('admin')
def create():
    """Create a new employer"""
    return create_employer()


@employer_bp.route('/', methods=['GET'])
@auth_required
def get_all():
    """Get all employers"""
    return get_all_employers()

@employer_bp.route('/<employer_id>', methods=['GET'])
@auth_required
def get_by_id(employer_id):
    """Get an employer by id"""
    return get_employer_by_id(employer_id)

@employer_bp.route('/<employer_id>', methods=['PUT'])
@auth_required
@role_required('admin')
def update(employer_id):
    """Update an employer"""
    return update_employer(employer_id)

@employer_bp.route('/<employer_id>', methods=['DELETE'])
@auth_required
@role_required('admin')
def delete(employer_id):
    """Delete an employer"""
    return delete_employer(employer_id)