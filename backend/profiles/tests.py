from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from profiles.models import Transaction
from datetime import datetime
from django.utils.timezone import make_aware
from profiles.tasks import calculate_nextOccur, process_recurring_transactions

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

    def test_sum_subcat(self):
        Transaction.objects.create(
            user=self.user,
            amount=100,
            date="2024-04-10",
            subcategory="grocery",
            category="expense"
        )
        response = self.client.get("/api/sum-subcategories-month/2024/04/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['subcategory'], "grocery")
        self.assertEqual(response.data[0]['total_amount'], 100)

    def test_avg_subcat(self):
        Transaction.objects.create(
            user=self.user,
            amount=120,
            date="2024-03-10",
            subcategory="restaurant",
            category="expense"
        )
        Transaction.objects.create(
            user=self.user,
            amount=180,
            date="2024-04-10",
            subcategory="restaurant",
            category="expense"
        )
        response = self.client.get("/api/avg-subcategories/")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(any(d['subcategory'] == 'restaurant' for d in response.data))

    def test_next_occur(self):
        date = datetime(2024, 4, 10).date()
        next_date = calculate_nextOccur(date)
        self.assertEqual(next_date.month, 5)
        self.assertEqual(next_date.day, 10)

    def test_recur_trans(self):
        today = datetime.now().date()
        next_occur = calculate_nextOccur(today)
        Transaction.objects.create(
            user=self.user,
            amount=50,
            date=today,
            subcategory="subscription",
            category="expense",
            recurring=True,
            nextOccur=today
        )
        process_recurring_transactions()

        self.assertEqual(Transaction.objects.filter(date=today).count(), 2)
        new_trans = Transaction.objects.filter(date=today).last()
        self.assertEqual(new_trans.nextOccur, next_occur)


    def test_invalid_trans(self):
        data = {
            "date": "2024-04-10",
            "amount": 100,
            "subcategory": "kkk",
            "recurring": False
        }
        response = self.client.post("/api/transactions/", data, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("Please choose a valid subcategory", str(response.data))

    def test_upload_no_file(self):
        response = self.client.post("/api/upload/", {}, format='multipart')
        self.assertEqual(response.status_code, 400)
        self.assertIn('No file provided', str(response.data))

    def test_goal_greater_income(self):
        data = {
            "currency": "USD",
            "country": "USA",
            "monthly_income": 2000,
            "monthly_spending_goal": 3000,  
            "first_name": "Jane",
            "last_name": "Doe",
            "age_range": "25-34",
            "gender": "Female",
            "future_goals": ["Save for house"],
            "savings_percent": "20%"
        }
        response = self.client.post("/api/financial-profile/", data, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("Monthly spending goal can't be more than the income", str(response.data))
