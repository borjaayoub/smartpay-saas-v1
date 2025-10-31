from flask import Blueprint
from controllers.contract_controller import create_contract, get_all_contracts, get_contract_by_id, update_contract, delete_contract
from utils.auth_decorator import auth_required, role_required

# Create contract blueprint
contract_bp = Blueprint('contract', __name__)

@contract_bp.route('/', methods=['POST'], strict_slashes=False)
@auth_required
@role_required('admin')
def create():
    """Create a new contract"""
    return create_contract()


@contract_bp.route('/', methods=['GET'], strict_slashes=False)
@auth_required
def get_all():
    """Get all contracts"""
    return get_all_contracts()

@contract_bp.route('/<contract_id>', methods=['GET'])
@auth_required
def get_by_id(contract_id):
    """Get a contract by id"""
    return get_contract_by_id(contract_id)

@contract_bp.route('/<contract_id>', methods=['PUT'])
@auth_required
@role_required('admin')
def update(contract_id):
    """Update a contract"""
    return update_contract(contract_id)

@contract_bp.route('/<contract_id>', methods=['DELETE'])
@auth_required
@role_required('admin')
def delete(contract_id):
    """Delete a contract"""
    return delete_contract(contract_id)