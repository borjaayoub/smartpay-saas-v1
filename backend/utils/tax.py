def calculate_igr(annual_income: float) -> tuple[float, float]:
    """
    Calculate Moroccan IGR (Impôt Général sur le Revenu) for 2025
    and return both total tax and effective tax rate.

    Args:
        annual_income: Annual taxable income in MAD

    Returns:
        tuple: (total_tax in MAD, effective_tax_rate as a float between 0 and 1)
    """
    if annual_income <= 0:
        return 0.0, 0.0

    brackets = [
        (40000, 0.00),
        (60000, 0.10),
        (80000, 0.20),
        (100000, 0.30),
        (180000, 0.34),
        (float("inf"), 0.37),
    ]

    total_tax = 0.0
    previous_limit = 0.0

    for limit, rate in brackets:
        if annual_income > previous_limit:
            taxable = min(annual_income, limit) - previous_limit
            total_tax += taxable * rate
            previous_limit = limit
        else:
            break

    effective_rate = total_tax / annual_income
    return round(total_tax, 2), round(effective_rate, 4)
