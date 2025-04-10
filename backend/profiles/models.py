from django.conf import settings
from django.db import models
from django.core.exceptions import ValidationError

def validate_positive(value):
    if value <= 0:
        raise ValidationError("Amount must be greater than zero.")
    
class UserFinancialProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True)
    currency = models.CharField(max_length=10)
    country = models.CharField(max_length=100)
    monthly_income = models.FloatField(validators=[validate_positive])
    monthly_spending_goal = models.FloatField(validators=[validate_positive])
    first_name = models.CharField(max_length=50, blank=True, default="Not provided")
    last_name = models.CharField(max_length=50, blank=True, default="Not provided")

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
    future_goals = models.JSONField() 
    savings_percent = models.CharField(max_length=5, choices=SAVINGS_PERCENT_CHOICES)
        
    def __str__(self):
        return f"{self.user.username} - Financial Profile"
    
class Transaction(models.Model):
    INCOME_SUBCATEGORIES = ["salary", "allowance", "investment_gain", "stipend", "sale_proceeds", "dividend", "other"]
    EXPENSE_SUBCATEGORIES = ["grocery", "restaurant", "entertainment", "healthcare", "utility", "subscription", "gift",
                             "self_care", "housing", "clothes", "miscellaneous","travel"]
    SAVINGS_INVESTMENT_SUBCATEGORIES = ["stock", "bond", "crypto", "fund", "real_estate", "savings"]

    CATEGORY_CHOICES = [
        ("income", "Income"),
        ("expense", "Expense"),
        ("savings_investment", "Savings & Investment"),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, blank=True) 
    subcategory = models.CharField(max_length=30)
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[validate_positive])
    date = models.DateField()
    note = models.TextField(blank=True, null=True)  
    recurring=models.BooleanField(default=False)
    nextOccur = models.DateField(blank=True, null=True)
    
    
    def __str__(self):
        return f"{self.user.username} - {self.subcategory} ({self.category}) - {self.amount}"
