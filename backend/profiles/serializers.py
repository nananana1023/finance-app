from rest_framework import serializers
from .models import UserFinancialProfile

class UserFinancialProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserFinancialProfile
        exclude = ['user']  # Exclude 'user' from required fields

    def validate_future_goals(self, value):
        """Ensure only allowed financial goals are selected."""
        valid_goals = {goal[0] for goal in UserFinancialProfile.FINANCIAL_GOALS}
        if not set(value).issubset(valid_goals):
            raise serializers.ValidationError("Invalid financial goals selected.")
        return value
