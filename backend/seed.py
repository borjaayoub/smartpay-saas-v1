import os
import random
from datetime import date, datetime, timedelta, timezone

from faker import Faker

from main import create_app
from models import db
from models.user import User
from models.company import Company
from models.employee import Employee
from models.contract import Contract
from models.payslips import Payslips
from models.contribution_rate import ContributionRate
from models.employer import Employer


def create_users(fake: Faker, count: int = 10):
    """Create multiple users with different roles"""
    users = []
    roles = ['admin', 'employee', 'accountant', 'HR']
    
    # Always create one admin
    admin_email = os.environ.get("SEED_ADMIN_EMAIL", "admin@example.com")
    admin = User.query.filter_by(email=admin_email).first()
    if not admin:
        admin = User(email=admin_email, role="admin", is_active=True)
        admin.set_password(os.environ.get("SEED_ADMIN_PASSWORD", "Admin@123"))
        db.session.add(admin)
        users.append(admin)
        print(f"Created admin user: {admin_email}")
    
    # Create additional users
    for i in range(count - 1):
        email = fake.unique.email()
        existing = User.query.filter_by(email=email).first()
        if not existing:
            user = User(
                email=email,
                role=random.choice(roles),
                is_active=random.choice([True, True, True, False])  # 75% active
            )
            user.set_password(f"Password@{i+1}")
            db.session.add(user)
            users.append(user)
    
    db.session.flush()
    print(f"Created {len(users)} users")
    return users


def create_companies(fake: Faker, count: int = 5):
    """Create multiple companies"""
    companies = []
    
    for i in range(count):
        company = Company(
            company_name=fake.company(),
            fiscal_id=fake.unique.bothify(text="FISCAL-########"),
            ice=fake.unique.bothify(text="ICE########"),
            cnss_number=fake.unique.bothify(text="CNSS-#######"),
            address=fake.address(),
            phone=fake.msisdn(),
            email=fake.company_email(),
        )
        db.session.add(company)
        companies.append(company)
    
    db.session.flush()
    print(f"Created {len(companies)} companies")
    return companies


def create_contribution_rates(fake: Faker):
    """Create contribution rates"""
    rates_data = [
        {"name": "CNSS Employee", "rate": 4.29, "description": "Employee contribution to CNSS"},
        {"name": "CNSS Employer", "rate": 8.98, "description": "Employer contribution to CNSS"},
        {"name": "AMO Employee", "rate": 2.26, "description": "Employee contribution to AMO"},
        {"name": "AMO Employer", "rate": 4.52, "description": "Employer contribution to AMO"},
        {"name": "CIMR Employee", "rate": 3.00, "description": "Employee contribution to CIMR (optional)"},
        {"name": "CIMR Employer", "rate": 6.00, "description": "Employer contribution to CIMR (optional)"},
        {"name": "Income Tax Bracket 1", "rate": 0.00, "description": "0% for income up to 30,000 MAD"},
        {"name": "Income Tax Bracket 2", "rate": 10.00, "description": "10% for income between 30,001 - 50,000 MAD"},
        {"name": "Income Tax Bracket 3", "rate": 20.00, "description": "20% for income between 50,001 - 60,000 MAD"},
        {"name": "Income Tax Bracket 4", "rate": 30.00, "description": "30% for income between 60,001 - 80,000 MAD"},
        {"name": "Income Tax Bracket 5", "rate": 34.00, "description": "34% for income between 80,001 - 180,000 MAD"},
        {"name": "Income Tax Bracket 6", "rate": 38.00, "description": "38% for income above 180,000 MAD"},
    ]
    
    contribution_rates = []
    for rate_data in rates_data:
        existing = ContributionRate.query.filter_by(name=rate_data["name"]).first()
        if not existing:
            rate = ContributionRate(
                name=rate_data["name"],
                rate=rate_data["rate"],
                effective_date=datetime.now(timezone.utc) - timedelta(days=random.randint(0, 365)),
                description=rate_data["description"]
            )
            db.session.add(rate)
            contribution_rates.append(rate)
    
    db.session.flush()
    print(f"Created {len(contribution_rates)} contribution rates")
    return contribution_rates


def create_employers(fake: Faker, companies: list, count_per_company: int = 2):
    """Create employers for each company"""
    employers = []
    
    for company in companies:
        for _ in range(count_per_company):
            employer = Employer(
                company_id=company.id,
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                email=fake.unique.email(),
                phone=fake.msisdn(),
                address=fake.address(),
                city=fake.city(),
                zip=fake.postcode(),
                country=fake.country()
            )
            db.session.add(employer)
            employers.append(employer)
    
    db.session.flush()
    print(f"Created {len(employers)} employers")
    return employers


def create_employees(fake: Faker, count: int = 20):
    """Create multiple employees"""
    employees = []
    statuses = ['active', 'active', 'active', 'active', 'on_leave', 'fired']  # 66% active
    
    for i in range(count):
        employee = Employee(
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            email=fake.unique.email(),
            phone=fake.msisdn(),
            address=fake.address(),
            city=fake.city(),
            zip=fake.postcode(),
            country=fake.country(),
            cin=fake.unique.bothify(text="CIN#########"),
            cnss_number=fake.unique.bothify(text="CNSS########"),
            amo_number=fake.unique.bothify(text="AMO#########"),
            cimr_number=fake.unique.bothify(text="CIMR########") if random.choice([True, False]) else None,
            bank_account=fake.unique.iban(),
            status=random.choice(statuses),
        )
        db.session.add(employee)
        employees.append(employee)
    
    db.session.flush()
    print(f"Created {len(employees)} employees")
    return employees


def create_contracts(fake: Faker, employees: list):
    """Create contracts for employees"""
    contracts = []
    contract_types = ['CDI', 'CDI', 'CDI', 'CDD', 'Intern', 'Freelance']
    departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'Customer Support']
    positions = [
        'Software Engineer', 'Senior Software Engineer', 'Data Analyst', 'Product Manager',
        'Sales Representative', 'Marketing Manager', 'HR Manager', 'Accountant',
        'Operations Manager', 'Customer Support Representative'
    ]
    
    for employee in employees:
        contract_type = random.choice(contract_types)
        hiring_date = date.today() - timedelta(days=random.randint(30, 1095))  # 1 month to 3 years ago
        
        contract = Contract(
            employee_id=employee.id,
            contract_type=contract_type,
            hiring_date=hiring_date,
            expiration_date=hiring_date + timedelta(days=365) if contract_type in ['CDD', 'Intern'] else None,
            position=random.choice(positions),
            department=random.choice(departments),
            base_salary=round(random.uniform(5000, 30000), 2),
            payments_status=random.choice(['pending', 'paid']),
            payments_date=date.today() if random.choice([True, False]) else None,
        )
        db.session.add(contract)
        contracts.append(contract)
    
    db.session.flush()
    print(f"Created {len(contracts)} contracts")
    return contracts


def create_payslips(fake: Faker, employees: list, companies: list, contracts: list):
    """Create payslips for employees"""
    payslips = []
    
    for employee in employees:
        # Find the employee's contract
        contract = next((c for c in contracts if c.employee_id == employee.id), None)
        if not contract:
            continue
        
        base_salary = float(contract.base_salary)
        
        # Create payslips for the last 12 months
        for month_offset in range(12):
            pay_date = date.today() - timedelta(days=30 * month_offset)
            pay_month = pay_date.month
            pay_year = pay_date.year
            
            # Random values for allowances and overtime
            overtime_hours = random.uniform(0, 20)
            overtime_rate = base_salary / 176 * 1.25  # Normal rate * 1.25
            overtime_amount = overtime_hours * overtime_rate
            
            bonus_amount = random.uniform(0, 2000) if random.random() > 0.7 else 0
            commission_amount = random.uniform(0, 3000) if random.random() > 0.8 else 0
            transportation_allowance = random.uniform(0, 500)
            housing_allowance = random.uniform(0, 2000) if random.random() > 0.6 else 0
            other_allowances = random.uniform(0, 500) if random.random() > 0.7 else 0
            
            # Calculate gross salary
            gross_salary = (
                base_salary + overtime_amount + bonus_amount + 
                commission_amount + transportation_allowance + 
                housing_allowance + other_allowances
            )
            
            # Calculate deductions
            cnss_employee = gross_salary * 0.0429
            cnss_employer = gross_salary * 0.0898
            amo_employee = gross_salary * 0.0226
            amo_employer = gross_salary * 0.0452
            cimr_employee = gross_salary * 0.03 if employee.cimr_number else 0
            cimr_employer = gross_salary * 0.06 if employee.cimr_number else 0
            
            # Simple income tax calculation
            taxable_income = gross_salary - cnss_employee - amo_employee - cimr_employee
            if taxable_income <= 30000:
                income_tax = 0
            elif taxable_income <= 50000:
                income_tax = (taxable_income - 30000) * 0.10
            elif taxable_income <= 60000:
                income_tax = 2000 + (taxable_income - 50000) * 0.20
            elif taxable_income <= 80000:
                income_tax = 4000 + (taxable_income - 60000) * 0.30
            elif taxable_income <= 180000:
                income_tax = 10000 + (taxable_income - 80000) * 0.34
            else:
                income_tax = 44000 + (taxable_income - 180000) * 0.38
            
            total_deductions = cnss_employee + amo_employee + cimr_employee + income_tax
            net_salary = gross_salary - total_deductions
            total_cost = gross_salary + cnss_employer + amo_employer + cimr_employer
            
            payslip = Payslips(
                employee_id=employee.id,
                company_id=random.choice(companies).id,
                pay_period_start=date(pay_year, pay_month, 1),
                pay_period_end=date(pay_year, pay_month, 28),
                pay_month=pay_month,
                pay_year=pay_year,
                base_salary=base_salary,
                gross_salary=gross_salary,
                net_salary=net_salary,
                total_cost=total_cost,
                overtime_hours=overtime_hours,
                overtime_rate=overtime_rate,
                overtime_amount=overtime_amount,
                bonus_amount=bonus_amount,
                commission_amount=commission_amount,
                transportation_allowance=transportation_allowance,
                housing_allowance=housing_allowance,
                other_allowances=other_allowances,
                cnss_employee=cnss_employee,
                cnss_employer=cnss_employer,
                amo_employee=amo_employee,
                amo_employer=amo_employer,
                cimr_employee=cimr_employee,
                cimr_employer=cimr_employer,
                income_tax=income_tax,
                other_deduction={},
                total_deductions=total_deductions,
                status=random.choice(['pending', 'paid', 'paid']),  # 66% paid
            )
            db.session.add(payslip)
            payslips.append(payslip)
    
    db.session.flush()
    print(f"Created {len(payslips)} payslips")
    return payslips


def main() -> None:
    app = create_app()
    fake = Faker()

    with app.app_context():
        db.create_all()
        
        print("\n=== Starting Seed Data Generation ===\n")
        
        # Create all the data
        users = create_users(fake, count=50)
        companies = create_companies(fake, count=15)
        contribution_rates = create_contribution_rates(fake)
        employers = create_employers(fake, companies, count_per_company=3)
        employees = create_employees(fake, count=100)
        contracts = create_contracts(fake, employees)
        payslips = create_payslips(fake, employees, companies, contracts)
        
        db.session.commit()
        
        print("\n=== Seed Data Summary ===")
        print(f"✓ Users: {len(users)}")
        print(f"✓ Companies: {len(companies)}")
        print(f"✓ Contribution Rates: {len(contribution_rates)}")
        print(f"✓ Employers: {len(employers)}")
        print(f"✓ Employees: {len(employees)}")
        print(f"✓ Contracts: {len(contracts)}")
        print(f"✓ Payslips: {len(payslips)}")
        print("\n=== Seed completed successfully! ===\n")


if __name__ == "__main__":
    main()


