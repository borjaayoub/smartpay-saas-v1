from flask import Blueprint
from controllers.company_controller import create_company, get_all_companies, get_company_by_id, update_company, delete_company
from utils.auth_decorator import auth_required

# Create company blueprint
company_bp = Blueprint('company', __name__)

@company_bp.route('/', methods=['POST'], strict_slashes=False)
@auth_required
def create():
    """Create a new company"""
    return create_company()

@company_bp.route('/', methods=['GET'], strict_slashes=False)
@auth_required
def get_all():
    """Get all companies"""
    return get_all_companies()

@company_bp.route('/<company_id>', methods=['GET'])
@auth_required
def get_by_id(company_id):
    """Get a company by id"""
    return get_company_by_id(company_id)

@company_bp.route('/<company_id>', methods=['PUT'])
@auth_required
def update(company_id):
    """Update a company"""
    return update_company(company_id)

@company_bp.route('/<company_id>', methods=['DELETE'])
@auth_required
def delete(company_id):
    """Delete a company"""
    return delete_company(company_id)
