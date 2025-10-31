from flask import jsonify, make_response, request
from models.contract import Contract
from models import db
from models.employee import Employee
from utils.pagination import get_pagination_params, paginate_query, create_pagination_response

def create_contract():
    """Create a new contract"""
    try:
        data = request.get_json()

        required_fields = [
            'employee_id',
            'contract_type',
            'hiring_date',
            'position',
            'department',
            'base_salary',
        ]
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'error': f'{field} is required',
                    'message': 'Please provide all required fields'
                }), 400

        # Validate that the referenced employee exists
        employee = Employee.query.get(data['employee_id'])
        if not employee:
            return jsonify({'error': 'Invalid employee_id: employee not found'}), 400

        contract = Contract(
            employee_id=data['employee_id'],
            contract_type=data.get('contract_type', 'CDI'),
            hiring_date=data['hiring_date'],
            expiration_date=data.get('expiration_date'),
            position=data['position'],
            department=data['department'],
            base_salary=data['base_salary'],
            payments_status=data.get('payments_status', 'pending'),
            payments_date=data.get('payments_date'),
        )
        db.session.add(contract)
        db.session.flush()
        db.session.commit()

        response = make_response(jsonify({
            'message': 'Contract created successfully',
            'contract': contract.to_dict()
        }), 201)

        return response
    except Exception as e:
        return jsonify({
            'error': 'Failed to create contract',
            'details': str(e)
        }), 500

def get_all_contracts():
    """Get all contracts with pagination"""
    try:
        # Get pagination parameters
        page, limit = get_pagination_params(default_page=1, default_limit=12, max_limit=100)
        
        # Build query with optional filters
        query = Contract.query
        
        # Apply filters if provided
        if request.args.get('search'):
            search_term = f"%{request.args.get('search')}%"
            query = query.filter(
                (Contract.position.ilike(search_term)) |
                (Contract.department.ilike(search_term))
            )
        
        if request.args.get('status'):
            query = query.filter(Contract.payments_status == request.args.get('status'))
        
        if request.args.get('contract_type'):
            query = query.filter(Contract.contract_type == request.args.get('contract_type'))
        
        if request.args.get('start_date'):
            query = query.filter(Contract.hiring_date >= request.args.get('start_date'))
        
        if request.args.get('end_date'):
            query = query.filter(Contract.hiring_date <= request.args.get('end_date'))
        
        if request.args.get('employee_id'):
            query = query.filter(Contract.employee_id == request.args.get('employee_id'))
        
        # Order by most recent first
        query = query.order_by(Contract.id.desc())
        
        # Paginate the query
        paginated_contracts, total_count, total_pages = paginate_query(query, page, limit)
        
        # Create paginated response
        response_data = create_pagination_response(
            paginated_contracts, page, limit, total_count, total_pages, 'contracts'
        )
        
        return jsonify(response_data), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch contracts',
            'details': str(e)
        }), 500

def get_contract_by_id(contract_id):
    """Get a contract by id"""
    try:
        contract = Contract.query.get(contract_id)
        if not contract:
            return jsonify({'error': 'Contract not found'}), 404
        return jsonify({
            'message': 'Contract fetched successfully',
            'contract': contract.to_dict()
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch contract',
            'details': str(e)
        }), 500

def update_contract(contract_id):
    """Update a contract"""
    try:
        data = request.get_json()
        contract = Contract.query.get(contract_id)
        if not contract:
            return jsonify({'error': 'Contract not found'}), 404
        contract.contract_type = data.get('contract_type', contract.contract_type)
        contract.hiring_date = data.get('hiring_date', contract.hiring_date)
        contract.expiration_date = data.get('expiration_date', contract.expiration_date)
        contract.position = data.get('position', contract.position)
        contract.department = data.get('department', contract.department)
        contract.base_salary = data.get('base_salary', contract.base_salary)
        contract.payments_status = data.get('payments_status', contract.payments_status)
        contract.payments_date = data.get('payments_date', contract.payments_date)
        db.session.commit()
        return jsonify({
            'message': 'Contract updated successfully',
            'contract': contract.to_dict()
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to update contract',
            'details': str(e)
        }), 500

def delete_contract(contract_id):
    """Delete a contract"""
    try:
        contract = Contract.query.get(contract_id)
        if not contract:
            return jsonify({'error': 'Contract not found'}), 404
        db.session.delete(contract)
        db.session.commit()
        return jsonify({
            'message': 'Contract deleted successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to delete contract',
            'details': str(e)
        }), 500