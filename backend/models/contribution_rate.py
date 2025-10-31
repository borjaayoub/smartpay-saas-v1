 
from datetime import datetime, timezone
from models import db

class ContributionRate(db.Model):
    __tablename__ = 'contribution_rates'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    rate = db.Column(db.Numeric(5, 2), default=0, nullable=False)
    effective_date = db.Column(db.DateTime(timezone=True))
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        def fmt_datetime(dt):
            return dt.strftime('%a, %d %b %Y') if getattr(dt, 'strftime', None) else str(dt) if dt else None
        
        return {
            "id": self.id,
            "name": self.name,
            "rate": float(self.rate) if self.rate is not None else None,
            "effective_date": fmt_datetime(self.effective_date),
            "description": self.description,
            "created_at": fmt_datetime(self.created_at),
            "updated_at": fmt_datetime(self.updated_at),
        }
