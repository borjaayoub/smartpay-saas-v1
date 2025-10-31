from flask import jsonify, make_response, request
from models.company import Company
from models import db
from utils.pagination import get_pagination_params, paginate_query, create_pagination_response


def create_company():
    """Create a new company"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = [
            'company_name',
            'fiscal_id',
            'ice',
            'cnss_number',
            'address',
            'phone',
            'email',
        ]
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'error': f'{field} is required',
                    'message': 'Please provide all required fields'
                }), 400

        # Uniqueness checks where applicable
        if Company.query.filter_by(fiscal_id=data['fiscal_id']).first():
            return jsonify({'error': 'Company with this fiscal_id already exists'}), 400
        if Company.query.filter_by(ice=data['ice']).first():
            return jsonify({'error': 'Company with this ICE already exists'}), 400
        if Company.query.filter_by(cnss_number=data['cnss_number']).first():
            return jsonify({'error': 'Company with this CNSS number already exists'}), 400

        company = Company(
            company_name=data['company_name'],
            fiscal_id=data['fiscal_id'],
            ice=data['ice'],
            cnss_number=data['cnss_number'],
            address=data['address'],
            phone=data['phone'],
            email=data['email'],
        )
        db.session.add(company)
        db.session.flush()
        db.session.commit()

        response = make_response(jsonify({
            'message': 'Company created successfully',
            'company': company.to_dict()
        }), 201)

        return response
    except Exception as e:
        return jsonify({
            'error': 'Failed to create company',
            'details': str(e)
        }), 500


def get_all_companies():
    """Get all companies with pagination"""
    try:
        # Get pagination parameters
        page, limit = get_pagination_params(default_page=1, default_limit=12, max_limit=100)
        
        # Build query with optional filters
        query = Company.query
        
        # Apply filters if provided
        if request.args.get('search'):
            search_term = f"%{request.args.get('search')}%"
            query = query.filter(
                (Company.company_name.ilike(search_term)) |
                (Company.fiscal_id.ilike(search_term)) |
                (Company.ice.ilike(search_term)) |
                (Company.email.ilike(search_term))
            )
        
        # Order by most recent first
        query = query.order_by(Company.id.desc())
        
        # Paginate the query
        paginated_companies, total_count, total_pages = paginate_query(query, page, limit)
        
        # Create paginated response
        response_data = create_pagination_response(
            paginated_companies, page, limit, total_count, total_pages, 'companies'
        )
        
        return jsonify(response_data), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch companies',
            'details': str(e)
        }), 500

def get_company_by_id(company_id):
    """Get a company by id"""
    try:
        company = Company.query.get(company_id)
        if not company:
            return jsonify({'error': 'Company not found'}), 404
        return jsonify({
            'message': 'Company fetched successfully',
            'company': company.to_dict()
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch company',
            'details': str(e)
        }), 500

def update_company(company_id):
    """Update a company"""
    try:
        data = request.get_json()
        company = Company.query.get(company_id)

        if not company:
            return jsonify({'error': 'Company not found'}), 404

        company.company_name = data.get('company_name', company.company_name)
        company.fiscal_id = data.get('fiscal_id', company.fiscal_id)
        company.ice = data.get('ice', company.ice)
        company.cnss_number = data.get('cnss_number', company.cnss_number)
        company.address = data.get('address', company.address)
        company.phone = data.get('phone', company.phone)
        company.email = data.get('email', company.email)
        
        db.session.commit()
        return jsonify({
            'message': 'Company updated successfully',
            'company': company.to_dict()
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to update company',
            'details': str(e)
        }), 500

def delete_company(company_id):
    """Delete a company"""
    try:
        company = Company.query.get(company_id)
        if not company:
            return jsonify({'error': 'Company not found'}), 404
        db.session.delete(company)
        db.session.commit()
        return jsonify({
            'message': 'Company deleted successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to delete company',
            'details': str(e)
        }), 500
