from rest_framework import serializers
from .models import UserFinancialProfile
from .models import Transaction
from datetime import datetime

class UserFinancialProfileSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)  

    class Meta:
        model = UserFinancialProfile
        exclude = ['user']  

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
            "clothes": "expense", "miscellaneous": "expense",

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
