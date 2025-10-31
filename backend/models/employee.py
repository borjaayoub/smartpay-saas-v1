from sqlalchemy import CheckConstraint
from datetime import datetime, timezone
from models import db


class Employee(db.Model):
    __tablename__ = 'employees'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    zip = db.Column(db.String(20), nullable=False)
    country = db.Column(db.String(100), nullable=False)
    cin = db.Column(db.String(20), unique=True, nullable=False)
    cnss_number = db.Column(db.String(30), unique=True)
    amo_number = db.Column(db.String(30), unique=True)
    cimr_number = db.Column(db.String(30), unique=True, nullable=True)
    bank_account = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='active')
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc), nullable=False)
    
    # Add check constraint at table level
    __table_args__ = (
        CheckConstraint("status IN ('active', 'on_leave', 'fired')", name='check_status'),
    )
    
    def to_dict(self):
        def fmt_datetime(dt):
            return dt.strftime('%a, %d %b %Y') if getattr(dt, 'strftime', None) else str(dt) if dt else None
        def full_name(self):
            if self.first_name and self.last_name:
                return f"{self.first_name} {self.last_name}"
            elif self.first_name:
                return self.first_name
            elif self.last_name:
                return self.last_name
            else:
                return "-"
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "phone": self.phone,
            "address": self.address,
            "city": self.city,
            "zip": self.zip,
            "country": self.country,
            "cin": self.cin,
            "cnss_number": self.cnss_number,
            "amo_number": self.amo_number,
            "cimr_number": self.cimr_number,
            "bank_account": self.bank_account,
            "status": self.status,
            "created_at": fmt_datetime(self.created_at),
            "updated_at": fmt_datetime(self.updated_at),
            "full_name": full_name(self),
        }