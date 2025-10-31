from flask_sqlalchemy import SQLAlchemy

# Create a single shared db instance
db = SQLAlchemy()

# No model imports here - they'll be imported where needed
__all__ = ['db']