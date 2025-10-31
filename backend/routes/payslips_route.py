from flask import Blueprint
from controllers.payslips_controller import create_payslip, get_all_payslips, get_payslip_by_id, update_payslip, delete_payslip
from utils.auth_decorator import auth_required, role_required

# Create payslips blueprint
payslips_bp = Blueprint('payslips', __name__)

@payslips_bp.route('/', methods=['POST'], strict_slashes=False)
@auth_required
@role_required('admin')
def create():
    """Create a new payslip"""
    return create_payslip()

@payslips_bp.route('/', methods=['GET'], strict_slashes=False)
@auth_required
def get_all():
    """Get all payslips"""
    return get_all_payslips()

@payslips_bp.route('/<payslip_id>', methods=['GET'])
@auth_required
def get_by_id(payslip_id):
    """Get a payslip by id"""
    return get_payslip_by_id(payslip_id)

@payslips_bp.route('/<payslip_id>', methods=['PUT'])
@auth_required
@role_required('admin')
def update(payslip_id):
    """Update a payslip"""
    return update_payslip(payslip_id)

@payslips_bp.route('/<payslip_id>', methods=['DELETE'])
@auth_required
@role_required('admin')
def delete(payslip_id):
    """Delete a payslip"""
    return delete_payslip(payslip_id)