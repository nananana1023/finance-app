from rest_framework import serializers
from .models import UserFinancialProfile
from .models import Transaction
from datetime import datetime

class UserFinancialProfileSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)  

    class Meta:
        model = UserFinancialProfile
        exclude = ['user']  
    
    def validate(self, data):
        instance = self.instance  

        income = data.get('monthly_income', instance.monthly_income if instance else None)
        goal = data.get('monthly_spending_goal', instance.monthly_spending_goal if instance else None)
        percent = data.get('savings_percent', instance.savings_percent if instance else None)

        if income is None or goal is None or percent is None:
            return data

        try:
            saveAmount = (int(percent[:2]) / 100) * income
        except Exception:
            raise serializers.ValidationError("Invalid savings percent format.")

        if goal > income:
            raise serializers.ValidationError("Monthly spending goal can't be more than the income.")

        if saveAmount > (income - goal):
            raise serializers.ValidationError("Savings cannot exceed income minus spending goal.")

        return data



class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        exclude = ['user']
        read_only_fields = ['category']  

    def validate(self, data):
        #auto populate category from chosen subcategory
        subcategory = data.get("subcategory")

        SUBCATEGORY_TO_CATEGORY = {
            "salary": "income", "allowance": "income", "investment_gain": "income",
            "stipend": "income", "sale_proceeds": "income", "dividend": "income", "other": "income",
            
            "grocery": "expense", "restaurant": "expense", "entertainment": "expense",
            "healthcare": "expense", "utility": "expense", "subscription": "expense",
            "gift": "expense", "self_care": "expense", "housing": "expense",
            "clothes": "expense", "miscellaneous": "expense", "travel": "expense",

            "stock": "savings_investment", "bond": "savings_investment",
            "crypto": "savings_investment", "fund": "savings_investment",
            "real_estate": "savings_investment", "savings": "savings_investment",
        }


        category = SUBCATEGORY_TO_CATEGORY.get(subcategory)

        if not category:
            raise serializers.ValidationError(f"Invalid subcategory '{subcategory}'. Please choose a valid subcategory.")

        data["category"] = category
        
        #recurring trans - auto populate nextOccur to next month's same day - handle edge cases 
        
        if data.get("recurring") == True:
            date_value = data.get("date")
            # If string, convert to date object
            if isinstance(date_value, str):
                date_value = datetime.strptime(date_value, "%Y-%m-%d").date()
            
            if date_value.day < 28:
                if date_value.month == 12:
                    year = date_value.year + 1
                    month = 1
                    day = date_value.day
                else:
                    year = date_value.year
                    month = date_value.month + 1
                    day = date_value.day
                next_occur = datetime(year, month, day).date()
            else:
                # avoid nonexistent day in the future 
                if date_value.month == 12:
                    year = date_value.year + 1
                    month = 1
                    day = 28
                else:
                    year = date_value.year
                    month = date_value.month + 1
                    day = 28
                next_occur = datetime(year, month, day).date()

            data["nextOccur"] = next_occur


        if data.get("recurring")==False and data.get("nextOccur")!=None:
            data["nextOccur"] = None
            
        
        return data
