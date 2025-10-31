from flask import Blueprint
from controllers.simulation_controller import simulate_pay
from utils.auth_decorator import auth_required


simulation_bp = Blueprint('simulation', __name__)


@simulation_bp.route('/preview', methods=['POST'])
@auth_required
def preview():
    return simulate_pay()


