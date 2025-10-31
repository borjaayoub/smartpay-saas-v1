import os
from flask import Flask, jsonify
from flask_cors import CORS 
from routes.auth_route import auth_bp
from routes.employee_route import employee_bp
from routes.employer_route import employer_bp
from routes.company_route import company_bp
from routes.contract_route import contract_bp
from routes.payslips_route import payslips_bp
from routes.simulation_route import simulation_bp
from routes.contribution_rate_route import contribution_rate_bp
from routes.dashboard_route import dashboard_bp
from models import db
from config import config


def create_app(config_name=None):
  """Create and configure the Flask application."""
  if config_name is None: 
    config_name = os.environ.get('FLASK_ENV', 'development')

  app = Flask(__name__)

  # Load configuration
  app.config.from_object(config[config_name])

  # Configure CORS
  # Allow common localhost origins in dev, with credentials
  cors_origins = app.config.get('CORS_ORIGINS', ['http://localhost:5173', 'http://localhost:5000'])
  
  # Apply CORS globally to ensure headers are always sent
  CORS(app, 
       supports_credentials=True,
       origins=cors_origins,
       methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
       allow_headers=["Content-Type", "Authorization"],
       expose_headers=["Content-Type", "Authorization"],
       max_age=3600)
  
  
  # Connect to postgres database
  try:
    db.init_app(app)

    # Import models AFTER db is initialized to register them
    from models.user import User # noqa: F401
    from models.company import Company # noqa: F401
    from models.employee import Employee # noqa: F401
    from models.contract import Contract # noqa: F401
    from models.employer import Employer # noqa: F401
    from models.payslips import Payslips # noqa: F401
    from models.contribution_rate import ContributionRate # noqa: F401
    
    # Create tables (only if they don't exist)
    # In production, tables should be created via init_db.py script
    with app.app_context():
      try:
        # Check if tables exist by trying to query
        from models.user import User
        db.session.query(User).first()
        print("Connected to database (tables already exist)")
      except Exception:
        # Tables don't exist, create them
        if app.config.get('DEBUG', False) or os.environ.get('CREATE_TABLES', 'False').lower() == 'true':
          db.create_all()
          print("Connected to database and tables created")
        else:
          print("Connected to database (tables need to be created - run init_db.py)")
    print("Database connection initialized")
  except Exception as e:
    print(f"Failed to connect to database: {e}")
  
  # Register blueprints
  app.register_blueprint(auth_bp, url_prefix='/api/auth')
  app.register_blueprint(employee_bp, url_prefix='/api/employees')
  app.register_blueprint(employer_bp, url_prefix='/api/employers')
  app.register_blueprint(company_bp, url_prefix='/api/companies')
  app.register_blueprint(contract_bp, url_prefix='/api/contracts')
  app.register_blueprint(payslips_bp, url_prefix='/api/payslips')
  app.register_blueprint(contribution_rate_bp, url_prefix='/api/contribution_rate')
  app.register_blueprint(simulation_bp, url_prefix='/api/simulation')
  app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')


  # Health check route
  @app.route('/health')
  def health_check():
      return jsonify({
          "message": "SmartPay API is running!",
          "status": "healthy",
          "version": "1.0.0"
      })
  
  @app.route('/api')
  def api_info():
      return jsonify({
          "message": "SmartPay API",
          "endpoints": {
              "auth": "/api/auth",
              "employees": "/api/employees",
              "employers": "/api/employers",
              "companies": "/api/companies",
              "contracts": "/api/contracts",
              "payslips": "/api/payslips",
              "contribution_rate": "/api/contribution_rate",
              "simulation": "/api/simulation",
              "dashboard": "/api/dashboard"
          }
      })

  return app

app = create_app()

if __name__ == '__main__':
    # Get configuration
    debug_mode = app.config.get('DEBUG', True)
    port = int(os.environ.get('PORT', 5000))

    print("Starting SmartPay API...")
    print(f"Environment: {os.environ.get('FLASK_ENV', 'development')}")
    print(f"Debug mode: {debug_mode}")
    print(f"Server: http://localhost:{port}")
    print(f"API docs: http://localhost:{port}/api")

    app.run(
      debug=debug_mode, 
      port=port,
      host='0.0.0.0'
    )