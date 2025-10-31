import os
import json
import unittest
from datetime import date

from faker import Faker

from main import create_app
from models import db


class ApiSmokeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Use real DB from env or default config; assumes Postgres is available
        cls.app = create_app()
        cls.app.testing = True
        cls.client = cls.app.test_client()
        cls.fake = Faker()

        with cls.app.app_context():
            db.create_all()

    @classmethod
    def tearDownClass(cls):
        # Do not drop the schema; tests are non-destructive beyond inserts
        pass

    def test_auth_register_login_me_logout(self):
        email = self.fake.unique.email()
        password = "Test@12345"

        # Register
        r = self.client.post(
            "/api/auth/register",
            data=json.dumps({"email": email, "password": password, "role": "admin"}),
            content_type="application/json",
        )
        self.assertIn(r.status_code, (200, 201, 400))  # 400 if email collision (unlikely due to unique)

        # Login
        r = self.client.post(
            "/api/auth/login",
            data=json.dumps({"email": email, "password": password}),
            content_type="application/json",
        )
        self.assertEqual(r.status_code, 200)
        self.assertIn("auth_token", r.headers.get("Set-Cookie", ""))

        # Capture cookie for authenticated calls
        cookie = r.headers.get("Set-Cookie")

        # Me
        r = self.client.get("/api/auth/me", headers={"Cookie": cookie})
        self.assertEqual(r.status_code, 200)

        # Logout
        r = self.client.post("/api/auth/logout", headers={"Cookie": cookie})
        self.assertEqual(r.status_code, 200)

    def test_create_company_employee_contract_payslip_and_simulation(self):
        # Admin login first
        email = self.fake.unique.email()
        password = "Test@12345"
        self.client.post(
            "/api/auth/register",
            data=json.dumps({"email": email, "password": password, "role": "admin"}),
            content_type="application/json",
        )
        r = self.client.post(
            "/api/auth/login",
            data=json.dumps({"email": email, "password": password}),
            content_type="application/json",
        )
        self.assertEqual(r.status_code, 200)
        cookie = r.headers.get("Set-Cookie")

        # Create company
        company_payload = {
            "company_name": self.fake.company(),
            "fiscal_id": self.fake.unique.bothify(text="FISCAL-########"),
            "ice": self.fake.unique.bothify(text="ICE########"),
            "cnss_number": self.fake.unique.bothify(text="CNSS########"),
            "address": self.fake.address(),
            "phone": self.fake.msisdn(),
            "email": self.fake.company_email(),
        }
        r = self.client.post("/api/company/", data=json.dumps(company_payload), content_type="application/json", headers={"Cookie": cookie})
        self.assertEqual(r.status_code, 201)
        company = r.get_json()["company"]

        # Create employee
        employee_payload = {
            "first_name": self.fake.first_name(),
            "last_name": self.fake.last_name(),
            "email": self.fake.unique.email(),
            "phone": self.fake.msisdn(),
            "address": self.fake.address(),
            "city": self.fake.city(),
            "zip": self.fake.postcode(),
            "country": self.fake.country(),
            "cin": self.fake.unique.bothify(text="CIN########"),
            "cnss_number": self.fake.unique.bothify(text="CNSS########"),
            "amo_number": self.fake.unique.bothify(text="AMO########"),
            "bank_account": self.fake.unique.iban(),
            "status": "active",
        }
        r = self.client.post("/api/employee/", data=json.dumps(employee_payload), content_type="application/json", headers={"Cookie": cookie})
        self.assertEqual(r.status_code, 201)
        employee = r.get_json()["employee"]

        # Create contract
        contract_payload = {
            "employee_id": employee["id"],
            "contract_type": "CDI",
            "hiring_date": str(date.today()),
            "position": "Software Engineer",
            "department": "Engineering",
            "base_salary": 10000.00,
        }
        r = self.client.post("/api/contract/", data=json.dumps(contract_payload), content_type="application/json", headers={"Cookie": cookie})
        self.assertEqual(r.status_code, 201)

        # Create payslip
        payslip_payload = {
            "employee_id": employee["id"],
            "company_id": company["id"],
            "pay_period_start": str(date(date.today().year, date.today().month, 1)),
            "pay_period_end": str(date.today()),
            "pay_month": date.today().month,
            "pay_year": date.today().year,
            "base_salary": 10000.00,
            "cnss_employee": 4.29,
            "cnss_employer": 8.58,
            "amo_employee": 2.26,
            "amo_employer": 4.11,
        }
        r = self.client.post("/api/payslips/", data=json.dumps(payslip_payload), content_type="application/json", headers={"Cookie": cookie})
        self.assertEqual(r.status_code, 201)

        # Simulation preview
        sim_payload = {"employee_id": employee["id"], "gross_salary": 10000.0}
        r = self.client.post("/api/simulation/preview", data=json.dumps(sim_payload), content_type="application/json", headers={"Cookie": cookie})
        self.assertEqual(r.status_code, 200)
        j = r.get_json()
        self.assertIn("simulation", j)


if __name__ == "__main__":
    unittest.main(verbosity=2)


