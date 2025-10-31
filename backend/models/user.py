from sqlalchemy import CheckConstraint
from datetime import datetime, timezone
import bcrypt
from models import db


class User(db.Model):
    __tablename__ = 'users'
    
    # Define columns using SQLAlchemy
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    role = db.Column(db.String(50), nullable=False, default='employee')
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc), nullable=False)

    # Add check constraint at table level
    __table_args__ = (
        CheckConstraint("role IN ('admin', 'employee', 'accountant', 'HR')", name='check_role'),
    )

    def set_password(self, password):
        """Hash and set password"""
        salt = bcrypt.gensalt()
        self.password = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
        return self.password

    def check_password(self, password):
        """Check password against hash"""
        if not self.password:
            return False
        return bcrypt.checkpw(password.encode('utf-8'), self.password.encode('utf-8'))
    
    def to_dict(self):
        def fmt_datetime(dt):
            return dt.strftime('%a, %d %b %Y') if getattr(dt, 'strftime', None) else str(dt) if dt else None
        
        return {
            "id": self.id,
            "email": self.email,
            "is_active": self.is_active,
            "role": self.role,
            "created_at": fmt_datetime(self.created_at),
            "updated_at": fmt_datetime(self.updated_at),
        }
