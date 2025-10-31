from flask import jsonify, make_response, request
from models.employer import Employer
from models import db
from models.company import Company


def create_employer():
    """Create a new employer"""
    try:
        data = request.get_json()

        required_fields = [
            'company_id',
            'first_name',
            'last_name',
            'email',
            'phone',
            'address',
            'city',
            'zip',
            'country',
        ]
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'error': f'{field} is required',
                    'message': 'Please provide all required fields'
                }), 400

        # Validate that the referenced company exists
        company = Company.query.get(data['company_id'])
        if not company:
            return jsonify({'error': 'Invalid company_id: company not found'}), 400

        if Employer.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Employer with this email already exists'}), 400

        employer = Employer(
            company_id=data['company_id'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            phone=data['phone'],
            address=data['address'],
            city=data['city'],
            zip=data['zip'],
            country=data['country'],
        )
        db.session.add(employer)
        db.session.flush()
        db.session.commit()

        response = make_response(jsonify({
            'message': 'Employer created successfully',
            'employer': employer.to_dict()
        }), 201)

        return response
    except Exception as e:
        return jsonify({
            'error': 'Failed to create employer',
            'details': str(e)
        }), 500

def get_all_employers():
    """Get all employers"""
    try:
        employers = Employer.query.all()
        return jsonify({
            'message': 'Employers fetched successfully',
            'employers': [employer.to_dict() for employer in employers]
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch employers',
            'details': str(e)
        }), 500

def get_employer_by_id(employer_id):
    """Get an employer by id"""
    try:
        employer = Employer.query.get(employer_id)
        if not employer:
            return jsonify({'error': 'Employer not found'}), 404
        return jsonify({
            'message': 'Employer fetched successfully',
            'employer': employer.to_dict()
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch employer',
            'details': str(e)
        }), 500

def update_employer(employer_id):
    """Update an employer"""
    try:
        data = request.get_json()
        employer = Employer.query.get(employer_id)
        if not employer:
            return jsonify({'error': 'Employer not found'}), 404
        employer.first_name = data.get('first_name', employer.first_name)
        employer.last_name = data.get('last_name', employer.last_name)
        employer.email = data.get('email', employer.email)
        employer.phone = data.get('phone', employer.phone)
        employer.address = data.get('address', employer.address)
        employer.city = data.get('city', employer.city)
        employer.zip = data.get('zip', employer.zip)
        employer.country = data.get('country', employer.country)
        db.session.commit()
        return jsonify({
            'message': 'Employer updated successfully',
            'employer': employer.to_dict()
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to update employer',
            'details': str(e)
        }), 500

def delete_employer(employer_id):
    """Delete an employer"""
    try:
        employer = Employer.query.get(employer_id)
        if not employer:
            return jsonify({'error': 'Employer not found'}), 404
        db.session.delete(employer)
        db.session.commit()
        return jsonify({
            'message': 'Employer deleted successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to delete employer',
            'details': str(e)
        }), 500