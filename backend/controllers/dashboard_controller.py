from flask import jsonify
from models import db
from models.employee import Employee
from models.contract import Contract
from sqlalchemy import func, extract
from datetime import datetime, date

def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        # Get current month and year
        current_month = datetime.now().month
        current_year = datetime.now().year
        
        # Total employees
        total_employees = Employee.query.count()
        
        # Active contracts (contracts that are not expired)
        active_contracts = Contract.query.filter(
            (Contract.expiration_date.is_(None)) | (Contract.expiration_date >= date.today())
        ).count()
        
        # Employees added this month
        employees_this_month = Employee.query.filter(
            extract('month', Employee.created_at) == current_month,
            extract('year', Employee.created_at) == current_year
        ).count()
        
        # Contracts added this month
        contracts_this_month = Contract.query.filter(
            extract('month', Contract.created_at) == current_month,
            extract('year', Contract.created_at) == current_year
        ).count()
        
        # Monthly payroll (sum of all active contracts' base salaries)
        monthly_payroll = db.session.query(
            func.sum(Contract.base_salary)
        ).filter(
            (Contract.expiration_date.is_(None)) | (Contract.expiration_date >= date.today())
        ).scalar() or 0
        
        # Average salary (based on active contracts, not all employees)
        average_salary = monthly_payroll / active_contracts if active_contracts > 0 else 0
        
        # Payroll trend (compare with last month)
        # Calculate last month's payroll (simplified - using current active contracts)
        # Note: For a more accurate comparison, you'd need historical data
        last_month_payroll = monthly_payroll  # Simplified - assumes same contracts
        
        payroll_trend = 0
        payroll_trend_up = True
        if last_month_payroll > 0:
            payroll_trend = round(((monthly_payroll - last_month_payroll) / last_month_payroll) * 100, 1)
            payroll_trend_up = payroll_trend >= 0
        
        return jsonify({
            'stats': {
                'total_employees': total_employees,
                'active_contracts': active_contracts,
                'monthly_payroll': float(monthly_payroll),
                'average_salary': float(average_salary),
                'trends': {
                    'employees_this_month': employees_this_month,
                    'contracts_this_month': contracts_this_month,
                    'payroll_trend': abs(payroll_trend),
                    'payroll_trend_up': payroll_trend_up
                }
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch dashboard statistics',
            'details': str(e)
        }), 500

