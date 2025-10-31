from sqlalchemy import CheckConstraint
from datetime import datetime, timezone
from models import db

class Contract(db.Model):
    __tablename__ = 'contracts'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    contract_type = db.Column(db.String(50), nullable=False, default='CDI')
    hiring_date = db.Column(db.Date, nullable=False)
    expiration_date = db.Column(db.Date)
    position = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100), nullable=False)
    base_salary = db.Column(db.Numeric(10, 2), nullable=False)
    payments_status = db.Column(db.String(50), nullable=False, default='pending')
    payments_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc), nullable=False)

    # Add check constraint at table level
    __table_args__ = (
        CheckConstraint("payments_status IN ('pending', 'paid')", name='check_payments_status'),
        CheckConstraint("contract_type IN ('CDI', 'CDD', 'Intern', 'Freelance')", name='check_contract_type'),
    )
    
    def to_dict(self):
        def fmt_datetime(dt):
            return dt.strftime('%a, %d %b %Y') if getattr(dt, 'strftime', None) else str(dt) if dt else None
        
        return {
            "id": self.id,
            "employee_id": self.employee_id,
            "contract_type": self.contract_type,
            "hiring_date": fmt_datetime(self.hiring_date),
            "expiration_date": fmt_datetime(self.expiration_date),
            "position": self.position,
            "department": self.department,
            "base_salary": float(self.base_salary) if self.base_salary is not None else None,
            "payments_status": self.payments_status,
            "payments_date": fmt_datetime(self.payments_date),
            "created_at": fmt_datetime(self.created_at),
            "updated_at": fmt_datetime(self.updated_at),
        }
