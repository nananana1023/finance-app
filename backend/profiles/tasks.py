from celery import shared_task
from django.utils import timezone
from .models import Transaction
from datetime import datetime
from calendar import monthrange

@shared_task
def process_recurring_transactions():
    today = timezone.localdate()
    transactions_due = Transaction.objects.filter(recurring=True, nextOccur=today)
    
        # create a new transaction with date=today and nextOccur=next month's today
    for trans in transactions_due:
        Transaction.objects.create(
            user=trans.user,
            category=trans.category,
            subcategory=trans.subcategory,
            amount=trans.amount,
            date=today,
            note=trans.note,
            recurring=trans.recurring,
            nextOccur=calculate_next_occurrence(today)
        )

    

def calculate_next_occurrence(date_value):
    # if the day is less than 28, keep the same day in the next month.
    if date_value.day < 28:
        if date_value.month == 12:
            year = date_value.year + 1
            month = 1
        else:
            year = date_value.year
            month = date_value.month + 1
        day = date_value.day
    else:
        #  default to day 28 in the next month.
        if date_value.month == 12:
            year = date_value.year + 1
            month = 1
        else:
            year = date_value.year
            month = date_value.month + 1
        day = 28

    next_occur = datetime(year, month, day).date()
    return next_occur
