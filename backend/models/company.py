 
from datetime import datetime, timezone
from models import db
    
class Company(db.Model):
    __tablename__ = 'companies'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    company_name = db.Column(db.String(100), nullable=False)
    fiscal_id = db.Column(db.String(50), unique=True, nullable=False)
    ice = db.Column(db.String(30), unique=True, nullable=False)
    cnss_number = db.Column(db.String(30), unique=True, nullable=False)
    address = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc), nullable=False)
    
    def to_dict(self):
        def fmt_datetime(dt):
            return dt.strftime('%a, %d %b %Y') if getattr(dt, 'strftime', None) else str(dt) if dt else None
        
        return {
            "id": self.id,
            "company_name": self.company_name,
            "fiscal_id": self.fiscal_id,
            "ice": self.ice,
            "cnss_number": self.cnss_number,
            "address": self.address,
            "phone": self.phone,
            "email": self.email,
            "created_at": fmt_datetime(self.created_at),
            "updated_at": fmt_datetime(self.updated_at),
        }