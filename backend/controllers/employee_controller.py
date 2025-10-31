from flask import jsonify, make_response, request
from models.employee import Employee
from models.contract import Contract
from models import db
from utils.pagination import get_pagination_params, paginate_query


def create_employee():
    """Create a new employee"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = [
          'first_name',
          'last_name',
          'email',
          'phone',
          'address',
          'city',
          'zip',
          'country',
          'cin',
          'cnss_number',
          'amo_number',
          'bank_account',
          'status',
        ]
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'error': f'{field} is required',
                    'message': 'Please provide all required fields'
                }), 400
        
        # Check if employee already exists
        if Employee.query.filter_by(email=data['email']).first():
            return jsonify({
                'error': 'Employee already exists',
                'message': 'Employee with this email already exists'
            }), 400
        
        # check if cin already exists
        if Employee.query.filter_by(cin=data['cin']).first():
            return jsonify({
                'error': 'Employee already exists',
                'message': 'Employee with this cin already exists'
            }), 400
        
        # check if cnss_number already exists
        if Employee.query.filter_by(cnss_number=data['cnss_number']).first():
            return jsonify({
                'error': 'Employee already exists',
                'message': 'Employee with this cnss_number already exists'
            }), 400
        
        # check if amo_number already exists
        if Employee.query.filter_by(amo_number=data['amo_number']).first():
            return jsonify({
                'error': 'Employee already exists',
                'message': 'Employee with this amo_number already exists'
            }), 400
        
        # check if bank_account already exists
        if Employee.query.filter_by(bank_account=data['bank_account']).first():
            return jsonify({
                'error': 'Employee already exists',
                'message': 'Employee with this bank_account already exists'
            }), 400
        
        # Create employee
        employee = Employee(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            cin=data['cin'],
            phone=data['phone'],
            address=data['address'],
            city=data['city'],
            zip=data['zip'],
            country=data['country'],
            cnss_number=data['cnss_number'],
            amo_number=data['amo_number'],
            cimr_number=data.get('cimr_number', None),
            bank_account=data['bank_account'],
            status=data['status']
        )
        db.session.add(employee)
        db.session.flush()
        db.session.commit()
        
        response = make_response(jsonify({
            'message': 'Employee created successfully',
            'employee': employee.to_dict()
        }), 201)

        return response
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to create employee',
            'details': str(e)
        }), 500

def get_all_employees():
    """Get all employees with pagination"""
    try:
        # Get pagination parameters
        page, limit = get_pagination_params(default_page=1, default_limit=12, max_limit=100)
        
        # Build query with optional filters
        query = Employee.query
        
        # Apply filters if provided
        if request.args.get('search'):
            search_term = f"%{request.args.get('search')}%"
            query = query.filter(
                (Employee.first_name.ilike(search_term)) |
                (Employee.last_name.ilike(search_term)) |
                (Employee.email.ilike(search_term)) |
                (Employee.cin.ilike(search_term))
            )
        
        if request.args.get('status'):
            query = query.filter(Employee.status == request.args.get('status'))
        
        if request.args.get('start_date'):
            query = query.filter(Employee.created_at >= request.args.get('start_date'))
        
        if request.args.get('end_date'):
            query = query.filter(Employee.created_at <= request.args.get('end_date'))
        
        # Order by most recent first
        query = query.order_by(Employee.id.desc())
        
        # Paginate the query
        paginated_employees, total_count, total_pages = paginate_query(query, page, limit)
        
        # Get contract data for each employee
        employee_ids = [emp.id for emp in paginated_employees]
        contracts = Contract.query.filter(Contract.employee_id.in_(employee_ids)).all() if employee_ids else []
        
        # Create a map of employee_id to latest contract
        contract_map = {}
        for contract in contracts:
            employee_id = contract.employee_id
            # Keep the latest contract for each employee
            if employee_id not in contract_map:
                contract_map[employee_id] = contract
            elif contract.created_at > contract_map[employee_id].created_at:
                contract_map[employee_id] = contract
        
        # Filter by payment status if provided (after getting contracts)
        payment_status_filter = request.args.get('paiments_status')
        if payment_status_filter:
            # Filter employees that have contracts matching the payment status
            filtered_employees = []
            for employee in paginated_employees:
                contract = contract_map.get(employee.id)
                if contract and contract.payments_status == payment_status_filter:
                    filtered_employees.append(employee)
                # If no contract but filter is 'pending', include it (no contract = pending)
                elif not contract and payment_status_filter == 'pending':
                    filtered_employees.append(employee)
            paginated_employees = filtered_employees
            # Update count after filtering
            total_count = len(filtered_employees)
            total_pages = (total_count + limit - 1) // limit if limit > 0 else 1
        
        # Add contract info to employee data
        employees_with_contracts = []
        for employee in paginated_employees:
            emp_dict = employee.to_dict()
            contract = contract_map.get(employee.id)
            if contract:
                emp_dict['position'] = contract.position
                emp_dict['department'] = contract.department
                emp_dict['base_salary'] = float(contract.base_salary) if contract.base_salary else None
                emp_dict['hiring_date'] = contract.hiring_date.strftime('%a, %d %b %Y') if contract.hiring_date else None
                emp_dict['paiments_status'] = contract.payments_status
            else:
                emp_dict['position'] = None
                emp_dict['department'] = None
                emp_dict['base_salary'] = None
                emp_dict['hiring_date'] = None
                emp_dict['paiments_status'] = None
            employees_with_contracts.append(emp_dict)
        
        # Create paginated response with enriched data
        return jsonify({
            'message': 'Employees fetched successfully',
            'employees': employees_with_contracts,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total_count,
                'pages': total_pages,
                'has_next': page < total_pages,
                'has_prev': page > 1
            }
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch employees',
            'details': str(e)
        }), 500

def get_employee_by_id(employee_id):
    """Get an employee by id"""
    try:
        employee = Employee.query.get(employee_id)
        if not employee:
            return jsonify({'error': 'Employee not found'}), 404
        return jsonify({
            'message': 'Employee fetched successfully',
            'employee': employee.to_dict()
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch employee',
            'details': str(e)
        }), 500

def update_employee(employee_id):
    """Update an employee"""
    try:
        data = request.get_json()
        employee = Employee.query.get(employee_id)
        if not employee:
            return jsonify({'error': 'Employee not found'}), 404
        employee.first_name = data.get('first_name', employee.first_name)
        employee.last_name = data.get('last_name', employee.last_name)
        employee.email = data.get('email', employee.email)
        employee.phone = data.get('phone', employee.phone)
        employee.address = data.get('address', employee.address)
        employee.city = data.get('city', employee.city)
        employee.zip = data.get('zip', employee.zip)
        employee.country = data.get('country', employee.country)
        employee.cnss_number = data['cnss_number']
        employee.amo_number = data.get('amo_number', employee.amo_number)
        employee.cimr_number = data.get('cimr_number', employee.cimr_number)
        employee.bank_account = data.get('bank_account', employee.bank_account)
        employee.status = data.get('status', employee.status)
        db.session.commit()
        return jsonify({
            'message': 'Employee updated successfully',
            'employee': employee.to_dict()
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to update employee',
            'details': str(e)
        }), 500

def delete_employee(employee_id):
    """Delete an employee"""
    try:
        # Clean and convert employee_id to integer
        # Handle string inputs by stripping whitespace
        if isinstance(employee_id, str):
            employee_id = employee_id.strip()
        
        # Convert to integer
        try:
            employee_id = int(employee_id)
        except (ValueError, TypeError):
            return jsonify({
                'error': 'Invalid employee ID',
                'message': f'Employee ID must be a valid number. Received: {repr(employee_id)}'
            }), 400
        
        # Find the employee
        employee = Employee.query.get(employee_id)
        if not employee:
            return jsonify({
                'error': 'Employee not found',
                'message': f'Employee with ID {employee_id} does not exist'
            }), 404
        
        # Delete all payslips for this employee FIRST (they reference employee)
        from models.payslips import Payslips
        payslip_count = Payslips.query.filter_by(employee_id=employee_id).delete()
        if payslip_count > 0:
            # Flush to ensure payslips are deleted in the database before we delete contracts/employee
            db.session.flush()
        
        # Delete all contracts for this employee
        contract_count = Contract.query.filter_by(employee_id=employee_id).delete()
        if contract_count > 0:
            # Flush to ensure contracts are deleted in the database before we delete employee
            db.session.flush()
        
        # Now delete the employee (all foreign key references should be gone)
        db.session.delete(employee)
        db.session.commit()
        
        return jsonify({
            'message': 'Employee deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        error_msg = str(e)
        print(f"Delete employee error: {error_msg}")  # Debug log
        
        return jsonify({
            'error': 'Failed to delete employee',
            'message': 'An error occurred while deleting the employee',
            'details': error_msg
        }), 500