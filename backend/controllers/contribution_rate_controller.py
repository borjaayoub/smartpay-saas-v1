from flask import jsonify, make_response, request
from models.contribution_rate import ContributionRate, db


def create_contribution_rate():
    """Create a new contribution rate"""
    try:
        data = request.get_json()

        required_fields = [
            'name',
            'rate',
        ]
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'error': f'{field} is required',
                    'message': 'Please provide all required fields'
                }), 400

        contribution_rate = ContributionRate(
            name=data['name'],
            rate=data['rate'],
            effective_date=data.get('effective_date'),
            description=data.get('description'),
        )
        db.session.add(contribution_rate)
        db.session.flush()
        db.session.commit()

        response = make_response(jsonify({
            'message': 'Contribution rate created successfully',
            'contribution_rate': contribution_rate.to_dict()
        }), 201)

        return response
    except Exception as e:
        return jsonify({
            'error': 'Failed to create contribution rate',
            'details': str(e)
        }), 500

def get_all_contribution_rates():
    """Get all contribution rates"""
    try:
        contribution_rates = ContributionRate.query.all()
        return jsonify({
            'message': 'Contribution rates fetched successfully',
            'contribution_rates': [contribution_rate.to_dict() for contribution_rate in contribution_rates]
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch contribution rates',
            'details': str(e)
        }), 500

def get_contribution_rate_by_id(contribution_rate_id):
    """Get a contribution rate by id"""
    try:
        contribution_rate = ContributionRate.query.get(contribution_rate_id)
        if not contribution_rate:
            return jsonify({'error': 'Contribution rate not found'}), 404
        return jsonify({
            'message': 'Contribution rate fetched successfully',
            'contribution_rate': contribution_rate.to_dict()
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch contribution rate',
            'details': str(e)
        }), 500

def update_contribution_rate(contribution_rate_id):
    """Update a contribution rate"""
    try:
        data = request.get_json()
        contribution_rate = ContributionRate.query.get(contribution_rate_id)
        if not contribution_rate:
            return jsonify({'error': 'Contribution rate not found'}), 404
        contribution_rate.name = data['name']
        contribution_rate.rate = data['rate']
        contribution_rate.effective_date = data['effective_date']
        contribution_rate.description = data['description']
        db.session.commit()
        return jsonify({
            'message': 'Contribution rate updated successfully',
            'contribution_rate': contribution_rate.to_dict()
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to update contribution rate',
            'details': str(e)
        }), 500

def delete_contribution_rate(contribution_rate_id):
    """Delete a contribution rate"""
    try:
        contribution_rate = ContributionRate.query.get(contribution_rate_id)
        if not contribution_rate:
            return jsonify({'error': 'Contribution rate not found'}), 404
        db.session.delete(contribution_rate)
        db.session.commit()
        return jsonify({
            'message': 'Contribution rate deleted successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to delete contribution rate',
            'details': str(e)
        }), 500