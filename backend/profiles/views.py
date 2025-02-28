from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import UserFinancialProfile, Transaction
from .serializers import UserFinancialProfileSerializer, TransactionSerializer
from django.utils.timezone import datetime
from django.db.models import Sum
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

class UserFinancialProfileViewSet(viewsets.ModelViewSet):
    queryset = UserFinancialProfile.objects.all()
    serializer_class = UserFinancialProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        if not self.request.user or self.request.user.is_anonymous:
            raise Exception("User is not authenticated.")

        try:
            serializer.save(user=self.request.user)
        except Exception as e:
            print("ERROR during profile creation:", str(e)) 
            raise
        
    def perform_update(self, serializer):
        serializer.save(user=self.request.user) 
      
class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]  
    
    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
    @action(detail=False, methods=['get'], url_path='by-month/(?P<year>\d{4})/(?P<month>\d{2})')
    def by_month(self, request, year, month):
        queryset = self.get_queryset().filter(date__year=year, date__month=month)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

#Filters transactions by selected month and user.
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def monthly_summary(request, year, month):
    user = request.user
    transactions = Transaction.objects.filter(user=user, date__year=year, date__month=month)

    summary = {
        "total_expense": transactions.filter(category="expense").aggregate(Sum("amount"))["amount__sum"] or 0,
        "total_income": transactions.filter(category="income").aggregate(Sum("amount"))["amount__sum"] or 0,
        "total_investment": transactions.filter(category="savings_investment").aggregate(Sum("amount"))["amount__sum"] or 0,
    }

    return Response(summary)     
