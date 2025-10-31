"""
Database initialization script.
Run this once after deployment to create all database tables.
"""
from main import app
from models import db
from models.user import User # noqa: F401
from models.company import Company # noqa: F401
from models.employee import Employee # noqa: F401
from models.contract import Contract # noqa: F401
from models.employer import Employer # noqa: F401
from models.payslips import Payslips # noqa: F401
from models.contribution_rate import ContributionRate # noqa: F401

def init_database():
    """Create all database tables."""
    with app.app_context():
        try:
            db.create_all()
            print("✅ Database tables created successfully!")
            print("\nTables created:")
            print("- User")
            print("- Company")
            print("- Employee")
            print("- Contract")
            print("- Employer")
            print("- Payslips")
            print("- ContributionRate")
        except Exception as e:
            print(f"❌ Error creating tables: {e}")
            raise

if __name__ == '__main__':
    init_database()

