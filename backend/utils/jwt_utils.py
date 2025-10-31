import jwt
from datetime import datetime, timezone, timedelta
from config import Config
from models.user import User

def generate_token(user):
    """Generate JWT token for user"""
    payload = {
        'user_id': user.id,
        'email': user.email,
        'role': user.role,
        'exp': datetime.now(timezone.utc) + timedelta(seconds=Config.JWT_ACCESS_TOKEN_EXPIRES),
        'iat': datetime.now(timezone.utc)
    }
    
    return jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm='HS256')

def verify_token(token):
    """Verify JWT token and return user"""
    try:
        payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
        user_id = payload['user_id']
        user = User.query.filter_by(id=user_id).first()
        
        if not user or not user.is_active:
            return None
            
        return user
        
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    except (ValueError, TypeError):
        return None