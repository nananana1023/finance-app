from django.conf import settings
from django.db import models

class UserFinancialProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True)
    currency = models.CharField(max_length=10)
    country = models.CharField(max_length=100)
    monthly_income = models.DecimalField(max_digits=10, decimal_places=2)
    monthly_spending_goal = models.DecimalField(max_digits=10, decimal_places=2)

    SAVINGS_PERCENT_CHOICES = [
        ("10%", "10%"),
        ("20%", "20%"),
        ("30%", "30%"),
        ("50%+", "50%+"),
    ]


    AGE_RANGES = [
        ('18-24', '18-24'),
        ('25-34', '25-34'),
        ('35-44', '35-44'),
        ('45+', '45+'),
    ]
    
    FINANCIAL_GOALS = [
        ('Pay off debts', 'Pay off debts'),
        ('Build an emergency fund', 'Build an emergency fund'),
        ('Invest for the future', 'Invest for the future'),
        ('General budgeting', 'General budgeting'),
        ('Business investment', 'Business investment'),
    ]

    age_range = models.CharField(max_length=10, choices=AGE_RANGES)
    gender = models.CharField(max_length=50, choices=[
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Prefer not to say', 'Prefer not to say')
    ])
    future_goals = models.JSONField()  # Storing multiple selections
    savings_percent = models.CharField(max_length=5, choices=SAVINGS_PERCENT_CHOICES)
        
    def __str__(self):
        return f"{self.user.username} - Financial Profile"
