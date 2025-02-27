from rest_framework import serializers
from .models import UserFinancialProfile
from .models import Transaction

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
        subcategory = data.get("subcategory")

        # Define subcategories mapping to categories
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

        return data
