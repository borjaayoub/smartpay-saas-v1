from flask import jsonify, make_response, request
from models.payslips import Payslips
from models import db
from models.employee import Employee
from models.company import Company
from utils.pagination import get_pagination_params, paginate_query, create_pagination_response


def create_payslip():
    """Create a new payslip"""
    try:
        data = request.get_json()

        required_fields = [
            'employee_id',
            'company_id',
            'pay_period_start',
            'pay_period_end',
            'pay_month',
            'pay_year',
            'base_salary',
            'cnss_employee',
            'cnss_employer',
            'amo_employee',
            'amo_employer',
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

        # Validate that the referenced company exists
        company = Company.query.get(data['company_id'])
        if not company:
            return jsonify({'error': 'Invalid company_id: company not found'}), 400

        payslip = Payslips(
            employee_id=data['employee_id'],
            company_id=data['company_id'],
            pay_period_start=data['pay_period_start'],
            pay_period_end=data['pay_period_end'],
            pay_month=data['pay_month'],
            pay_year=data['pay_year'],
            base_salary=data['base_salary'],
            gross_salary=data['gross_salary'],
            net_salary=data['net_salary'],
            total_cost=data['total_cost'],
            overtime_hours=data.get('overtime_hours', 0),
            overtime_rate=data.get('overtime_rate', 0),
            overtime_amount=data.get('overtime_amount', 0),
            bonus_amount=data.get('bonus_amount', 0),
            commission_amount=data.get('commission_amount', 0),
            transportation_allowance=data.get('transportation_allowance', 0),
            housing_allowance=data.get('housing_allowance', 0),
            other_allowances=data.get('other_allowances', 0),
            cnss_employee=data['cnss_employee'],
            cnss_employer=data['cnss_employer'],
            amo_employee=data['amo_employee'],
            amo_employer=data['amo_employer'],
            cimr_employee=data.get('cimr_employee'),
            cimr_employer=data.get('cimr_employer'),
            income_tax=data['income_tax'],
            other_deduction=data.get('other_deduction', {}),
            total_deductions=data.get('total_deductions', 0),
            status=data.get('status', 'pending'),
        )
        db.session.add(payslip)
        db.session.flush()
        db.session.commit()

        response = make_response(jsonify({
            'message': 'Payslip created successfully',
            'payslip': payslip.to_dict()
        }), 201)

        return response
    except Exception as e:
        return jsonify({
            'error': 'Failed to create payslip',
            'details': str(e)
        }), 500

def get_all_payslips():
    """Get all payslips with pagination"""
    try:
        # Get pagination parameters
        page, limit = get_pagination_params(default_page=1, default_limit=10, max_limit=100)
        
        # Build query with optional filters
        query = Payslips.query
        
        # Apply filters if provided
        # Note: Search filter for payslips would require joining with Employee table
        # For now, we'll skip search filter and use specific filters instead
        
        if request.args.get('month'):
            query = query.filter(Payslips.pay_month == request.args.get('month'))
        
        if request.args.get('employee_id'):
            query = query.filter(Payslips.employee_id == request.args.get('employee_id'))
        
        if request.args.get('status'):
            query = query.filter(Payslips.status == request.args.get('status'))
        
        if request.args.get('start_date'):
            query = query.filter(Payslips.pay_period_start >= request.args.get('start_date'))
        
        if request.args.get('end_date'):
            query = query.filter(Payslips.pay_period_end <= request.args.get('end_date'))
        
        # Order by most recent first
        query = query.order_by(Payslips.pay_year.desc(), Payslips.pay_month.desc())
        
        # Paginate the query
        paginated_payslips, total_count, total_pages = paginate_query(query, page, limit)
        
        # Create paginated response
        response_data = create_pagination_response(
            paginated_payslips, page, limit, total_count, total_pages, 'payslips'
        )
        
        return jsonify(response_data), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch payslips',
            'details': str(e)
        }), 500

def get_payslip_by_id(payslip_id):
    """Get a payslip by id"""
    try:
        payslip = Payslips.query.get(payslip_id)
        if not payslip:
            return jsonify({'error': 'Payslip not found'}), 404
        return jsonify({
            'message': 'Payslip fetched successfully',
            'payslip': payslip.to_dict()
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch payslip',
            'details': str(e)
        }), 500

def update_payslip(payslip_id):
    """Update a payslip"""
    try:
        data = request.get_json()
        payslip = Payslips.query.get(payslip_id)
        if not payslip:
            return jsonify({'error': 'Payslip not found'}), 404
        payslip.pay_period_start = data.get('pay_period_start', payslip.pay_period_start)
        payslip.pay_period_end = data.get('pay_period_end', payslip.pay_period_end)
        payslip.pay_month = data.get('pay_month', payslip.pay_month)
        payslip.pay_year = data.get('pay_year', payslip.pay_year)
        payslip.base_salary = data.get('base_salary', payslip.base_salary)
        payslip.gross_salary = data.get('gross_salary', payslip.gross_salary)
        payslip.net_salary = data.get('net_salary', payslip.net_salary)
        payslip.total_cost = data.get('total_cost', payslip.total_cost)
        payslip.overtime_hours = data.get('overtime_hours', payslip.overtime_hours)
        payslip.overtime_rate = data.get('overtime_rate', payslip.overtime_rate)
        payslip.overtime_amount = data.get('overtime_amount', payslip.overtime_amount)
        payslip.bonus_amount = data.get('bonus_amount', payslip.bonus_amount)
        payslip.commission_amount = data.get('commission_amount', payslip.commission_amount)
        payslip.transportation_allowance = data.get('transportation_allowance', payslip.transportation_allowance)
        payslip.housing_allowance = data.get('housing_allowance', payslip.housing_allowance)
        payslip.other_allowances = data.get('other_allowances', payslip.other_allowances)
        payslip.cnss_employee = data.get('cnss_employee', payslip.cnss_employee)
        payslip.cnss_employer = data.get('cnss_employer', payslip.cnss_employer)
        payslip.amo_employee = data.get('amo_employee', payslip.amo_employee)
        payslip.amo_employer = data.get('amo_employer', payslip.amo_employer)
        payslip.cimr_employee = data.get('cimr_employee', payslip.cimr_employee)
        payslip.cimr_employer = data.get('cimr_employer', payslip.cimr_employer)
        payslip.income_tax = data.get('income_tax', payslip.income_tax)
        payslip.other_deduction = data.get('other_deduction', payslip.other_deduction)
        payslip.total_deductions = data.get('total_deductions', payslip.total_deductions)
        payslip.status = data.get('status', payslip.status)
        db.session.commit()
        return jsonify({
            'message': 'Payslip updated successfully',
            'payslip': payslip.to_dict()
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to update payslip',
            'details': str(e)
        }), 500

def delete_payslip(payslip_id):
    """Delete a payslip"""
    try:
        payslip = Payslips.query.get(payslip_id)
        if not payslip:
            return jsonify({'error': 'Payslip not found'}), 404
        db.session.delete(payslip)
        db.session.commit()
        return jsonify({
            'message': 'Payslip deleted successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to delete payslip',
            'details': str(e)
        }), 500