from sqlalchemy import CheckConstraint
from datetime import datetime, timezone
from models import db

class Payslips(db.Model):
    __tablename__ = 'payslips'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    
    # Pay period information
    pay_period_start = db.Column(db.Date, nullable=False)
    pay_period_end = db.Column(db.Date, nullable=False)
    pay_month = db.Column(db.Integer, nullable=False)
    pay_year = db.Column(db.Integer, nullable=False)

    # Base salary information
    base_salary = db.Column(db.Numeric(10, 2), nullable=False)
    gross_salary = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    net_salary = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    total_cost = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    overtime_hours = db.Column(db.Numeric(5, 2), nullable=False, default=0)
    overtime_rate = db.Column(db.Numeric(8, 2), nullable=False, default=0)
    overtime_amount = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    bonus_amount = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    commission_amount = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    # Allowances
    transportation_allowance = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    housing_allowance = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    other_allowances = db.Column(db.Numeric(10, 2), nullable=False, default=0)

    # Moroccan Labor Law Deductions
    cnss_employee = db.Column(db.String(30), nullable=False)
    cnss_employer = db.Column(db.String(30), nullable=False)
    amo_employee = db.Column(db.String(30), nullable=False)
    amo_employer = db.Column(db.String(30), nullable=False)
    cimr_employee = db.Column(db.String(30), nullable=True, default=0)
    cimr_employer = db.Column(db.String(30), nullable=True, default=0)
    income_tax = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    
    # Deductions
    other_deduction = db.Column(db.JSON, nullable=False, default=dict)
    total_deductions = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    
    status = db.Column(db.String(20), nullable=False, default='pending')
    generated_at = db.Column(db.DateTime(timezone=True), default=datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc), nullable=False)

    # Add check constraint at table level
    __table_args__ = (
        CheckConstraint("status IN ('pending', 'paid')", name='check_status'),
    )

    def to_dict(self):
        def fmt_datetime(dt):
            return dt.strftime('%a, %d %b %Y') if getattr(dt, 'strftime', None) else str(dt) if dt else None
        
        def fmt_date(d):
            return d.strftime('%Y-%m-%d') if getattr(d, 'strftime', None) else str(d) if d else None
        
        def fmt_numeric(n):
            return float(n) if n is not None else None
        
        return {
            'id': self.id,
            'employee_id': self.employee_id,
            # Pay period information
            'pay_period_start': fmt_date(self.pay_period_start),
            'pay_period_end': fmt_date(self.pay_period_end),
            'pay_month': self.pay_month,
            'pay_year': self.pay_year,
            # Salary information
            'base_salary': fmt_numeric(self.base_salary),
            'gross_salary': fmt_numeric(self.gross_salary),
            'net_salary': fmt_numeric(self.net_salary),
            'total_cost': fmt_numeric(self.total_cost),
            # Overtime
            'overtime_hours': fmt_numeric(self.overtime_hours),
            'overtime_rate': fmt_numeric(self.overtime_rate),
            'overtime_amount': fmt_numeric(self.overtime_amount),
            # Additional earnings
            'bonus_amount': fmt_numeric(self.bonus_amount),
            'commission_amount': fmt_numeric(self.commission_amount),
            # Allowances
            'transportation_allowance': fmt_numeric(self.transportation_allowance),
            'housing_allowance': fmt_numeric(self.housing_allowance),
            'other_allowances': fmt_numeric(self.other_allowances),
            # Moroccan Labor Law Deductions
            'cnss_employee': self.cnss_employee,
            'cnss_employer': self.cnss_employer,
            'amo_employee': self.amo_employee,
            'amo_employer': self.amo_employer,
            'cimr_employee': self.cimr_employee,
            'cimr_employer': self.cimr_employer,
            'income_tax': fmt_numeric(self.income_tax),
            # Deductions
            'other_deduction': self.other_deduction,
            'total_deductions': fmt_numeric(self.total_deductions),
            # Status and timestamps
            'status': self.status,
            'generated_at': fmt_datetime(self.generated_at),
            'updated_at': fmt_datetime(self.updated_at),
        }