 
from datetime import datetime, timezone
from models import db


class Employer(db.Model):
    __tablename__ = 'employers'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    zip = db.Column(db.String(20), nullable=False)
    country = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        def fmt_datetime(dt):
            return dt.strftime('%a, %d %b %Y') if getattr(dt, 'strftime', None) else str(dt) if dt else None
        
        return {
            "id": self.id,
            "company_id": self.company_id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "phone": self.phone,
            "address": self.address,
            "city": self.city,
            "zip": self.zip,
            "country": self.country,
            "created_at": fmt_datetime(self.created_at),
            "updated_at": fmt_datetime(self.updated_at),
        }