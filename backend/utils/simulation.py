from utils.tax import calculate_igr

def build_contribution_rates(overrides: dict | None = None) -> dict:
    defaults = {
        "cnss_employee": 4.29,
        "cnss_employer": 8.58,
        "amo_employee": 2.26,
        "amo_employer": 4.11,
        "cimr_employee": 2.0,
        "cimr_employer": 6.0,
        "igr": 0.0,
        "professional_tax": 0.0,
    }
    if not overrides:
        return defaults

    result = defaults.copy()
    for key, value in overrides.items():
        if key in result and value is not None:
            result[key] = float(value)
    return result


def build_simulation_input(data: dict) -> dict:
    return {
        "employee_id": data.get("employee_id"),
        "gross_salary": float(data.get("gross_salary", 0)),
        "overtime_hours": float(data.get("overtime_hours", 0)),
        "overtime_rate": float(data.get("overtime_rate", 1.5)),
        "bonuses": float(data.get("bonuses", 0)),
        "allowances": float(data.get("allowances", 0)),
        "deductions": float(data.get("deductions", 0)),
    }


def compute_simulation(sim_input: dict, rates: dict) -> dict:
    gross = sim_input.get("gross_salary", 0.0) + sim_input.get("bonuses", 0.0) + sim_input.get("allowances", 0.0)

    # Calculate overtime: overtime_hours * hourly_rate * overtime_multiplier
    # Standard monthly working hours in Morocco: 173.33 hours (40 hrs/week * 52 weeks / 12 months)
    # Overtime is calculated based on base gross salary (not including bonuses/allowances)
    standard_monthly_hours = 173.33 
    base_gross_salary = sim_input.get("gross_salary", 0.0)
    hourly_rate = base_gross_salary / standard_monthly_hours if standard_monthly_hours > 0 else 0.0
    overtime_multiplier = float(sim_input.get("overtime_rate", 1.5))
    overtime_hours = float(sim_input.get("overtime_hours", 0.0))
    overtime_amount = round(overtime_hours * hourly_rate * overtime_multiplier, 2)
    
    gross_with_overtime = gross + overtime_amount

    # Basic employee-side contributions
    cnss_emp = round(gross_with_overtime * (rates.get("cnss_employee", 0.0) / 100.0), 2)
    amo_emp = round(gross_with_overtime * (rates.get("amo_employee", 0.0) / 100.0), 2)
    cimr_emp = round(gross_with_overtime * (rates.get("cimr_employee", 0.0) / 100.0), 2)

    # Calculate IGR using progressive tax brackets
    # IGR is calculated on taxable income (gross minus social contributions)
    taxable_income = gross_with_overtime - cnss_emp - amo_emp - cimr_emp
    # Convert monthly taxable income to annual for tax calculation
    annual_taxable_income = taxable_income * 12
    annual_igr, _ = calculate_igr(annual_taxable_income)
    # Convert annual IGR back to monthly
    igr = round(annual_igr / 12, 2)
    
    professional_tax = round(gross_with_overtime * (rates.get("professional_tax", 0.0) / 100.0), 2)

    deductions_other = float(sim_input.get("deductions", 0.0))

    total_employee_deductions = cnss_emp + amo_emp + cimr_emp + igr + professional_tax + deductions_other
    net = round(gross_with_overtime - total_employee_deductions, 2)

    # Employer-side for reference
    cnss_empr = round(gross_with_overtime * (rates.get("cnss_employer", 0.0) / 100.0), 2)
    amo_empr = round(gross_with_overtime * (rates.get("amo_employer", 0.0) / 100.0), 2)
    cimr_empr = round(gross_with_overtime * (rates.get("cimr_employer", 0.0) / 100.0), 2)
    employer_total = cnss_empr + amo_empr + cimr_empr

    return {
        "inputs": sim_input,
        "rates": rates,
        "overtime_amount": round(overtime_amount, 2),
        "gross_with_overtime": round(gross_with_overtime, 2),
        "employee_contributions": {
            "cnss_employee": cnss_emp,
            "amo_employee": amo_emp,
            "cimr_employee": cimr_emp,
            "igr": igr,
            "professional_tax": professional_tax,
            "other": round(deductions_other, 2),
            "total": round(total_employee_deductions, 2),
        },
        "employer_contributions": {
            "cnss_employer": cnss_empr,
            "amo_employer": amo_empr,
            "cimr_employer": cimr_empr,
            "total": round(employer_total, 2),
        },
        "net_salary": net,
    }


