from utils.simulation import compute_simulation, build_contribution_rates, build_simulation_input
import json

# Test with overtime
sim_input = build_simulation_input({
    'employee_id': 1,
    'gross_salary': 2000,
    'overtime_hours': 10,
    'overtime_rate': 1.5
})

rates = build_contribution_rates()
result = compute_simulation(sim_input, rates)

print("=== Overtime Calculation Test ===")
print(f"Base gross salary: 20,000 MAD")
print(f"Overtime hours: 10")
print(f"Overtime multiplier: 1.5x")
print(f"Hourly rate: {20000 / 173.33:.2f} MAD")
expected_overtime = 10 * (20000 / 173.33) * 1.5
print(f"Expected overtime: {expected_overtime:.2f} MAD")
print(f"Calculated overtime: {result['overtime_amount']} MAD")
print(f"\n=== Results ===")
print(f"Gross with overtime: {result['gross_with_overtime']:,.2f} MAD")
print(f"IGR: {result['employee_contributions']['igr']:,.2f} MAD")
print(f"Net salary: {result['net_salary']:,.2f} MAD")

