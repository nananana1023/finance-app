from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from profiles.models import UserFinancialProfile, Transaction
from django.urls import reverse
from datetime import datetime
from django.utils.timezone import make_aware

User = get_user_model()

class ProfileTransactionTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='test', password='Asdf3*ertAD')
        self.client.force_authenticate(user=self.user)

    def test_create_profile(self):
        data = {
            "currency": "EUR",
            "country": "Germany",
            "monthly_income": 3000,
            "monthly_spending_goal": 1000,
            "first_name": "Test",
            "last_name": "User",
            "age_range": "25-34",
            "gender": "Male",
            "future_goals": ["Build an emergency fund"],
            "savings_percent": "30%"
        }
        response = self.client.post("/api/financial-profile/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["currency"], "EUR")   
        self.assertEqual(response.data["monthly_income"], 3000)

    def test_create_trans(self):
        data = {
            "date": "2024-04-10",
            "amount": 100,
            "subcategory": "grocery",
            "category": "expense",
            "recurring": False
        }
        response = self.client.post("/api/transactions/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Transaction.objects.count(), 1)
        self.assertEqual(response.data["category"], "expense")
        transaction = Transaction.objects.first()
        self.assertEqual(transaction.category, "expense")

    def test_by_month(self):
        Transaction.objects.create(
            user=self.user,
            amount=150,
            date="2024-04-10",
            subcategory="restaurant",
            category="expense"
        )
        response = self.client.get("/api/transactions/by-month/2024/04/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["subcategory"], 'restaurant')

    def test_summary(self):
        Transaction.objects.create(
            user=self.user,
            amount=500,
            date="2024-04-05",
            subcategory="salary",
            category="income"
        )
        
        Transaction.objects.create(
            user=self.user,
            amount=20,
            date="2024-04-20",
            subcategory="dividend",
            category="income"
        )
        
        response = self.client.get("/api/monthly-summary/2024/04/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_income"], 520)


    def test_expenses_months(self):
        Transaction.objects.create(
            user=self.user,
            amount=300,
            date=make_aware(datetime(2024, 4, 10)),
            subcategory="clothes",
            category="expense"
        )

        response = self.client.get("/api/expenses-months/")
        
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
