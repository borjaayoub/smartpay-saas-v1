from flask import Blueprint
from controllers.employee_controller import create_employee, get_all_employees, get_employee_by_id, update_employee, delete_employee
from utils.auth_decorator import auth_required, role_required

# Create employee blueprint
employee_bp = Blueprint('employee', __name__)

# Public routes (no authentication required)
@employee_bp.route('/', methods=['POST'], strict_slashes=False)
@auth_required
@role_required('admin')
def create():
    """Create a new employee"""
    return create_employee()

@employee_bp.route('/', methods=['GET'], strict_slashes=False)
@auth_required
def get_all():
    """Get all employees"""
    return get_all_employees()

@employee_bp.route('/<employee_id>', methods=['GET'])
@auth_required
def get_by_id(employee_id):
    """Get an employee by id"""
    return get_employee_by_id(employee_id)

@employee_bp.route('/<employee_id>', methods=['PUT'])
@auth_required
@role_required('admin')
def update(employee_id):
    """Update an employee"""
    return update_employee(employee_id)

@employee_bp.route('/<employee_id>', methods=['DELETE'])
@auth_required
@role_required('admin')
def delete(employee_id):
    """Delete an employee"""
    return delete_employee(employee_id)