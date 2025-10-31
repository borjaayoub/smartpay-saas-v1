from flask import jsonify, request
from utils.simulation import build_contribution_rates, build_simulation_input, compute_simulation


def simulate_pay():
    try:
        data = request.get_json() or {}

        required_fields = ['employee_id', 'gross_salary']
        for field in required_fields:
            if data.get(field) in (None, ""):
                return jsonify({
                    'error': f'{field} is required',
                    'message': 'Please provide all required fields'
                }), 400

        sim_input = build_simulation_input(data)
        rates_overrides = data.get('rates') or {}
        rates = build_contribution_rates(rates_overrides)

        result = compute_simulation(sim_input, rates)
        return jsonify({
            'message': 'Simulation computed successfully',
            'simulation': result,
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to compute simulation',
            'details': str(e)
        }), 500

