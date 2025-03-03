from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import UserFinancialProfile, Transaction
from .serializers import UserFinancialProfileSerializer, TransactionSerializer
from django.utils.timezone import datetime
from django.db.models import Sum
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import calendar

#viewset - Group several related actions in one class (CRUD)
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

#function-based views handle HTTP requests directly

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

#add transactions of given category of given month 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sum_cat_month(request, cat, year, month):
    user = request.user
    trans_sum = (Transaction.objects.filter(user=user, date__year=year, date__month=month, subcategory=cat)).aggregate(Sum("amount"))
    
    return Response(trans_sum)
    
#total expenses over months until now
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def expenses_months(request):
    user = request.user
    cur_year, cur_month = datetime.now().year, datetime.now().month
    total_expense = Transaction.objects.filter(user=user, date__year=cur_year, date__month=cur_month, category="expense").aggregate(Sum("amount"))["amount__sum"] or 0
    all_expenses=[{"year": cur_year, "month": cur_month,"month_name": calendar.month_name[cur_month], "amount": total_expense}] #initial value - current month's total 
    
    while total_expense>0:
        
        if cur_month==1:
            cur_year-=1
            cur_month=12
        else:
            cur_month-=1
        
        total_expense=Transaction.objects.filter(user=user, date__year=cur_year, date__month=cur_month, category="expense").aggregate(Sum("amount"))["amount__sum"] or 0
        if total_expense==0:
            break
        all_expenses.append({"year": cur_year, "month": cur_month, "month_name": calendar.month_name[cur_month], "amount": total_expense})

        
    all_expenses.reverse()
    return Response(all_expenses)    
    
    