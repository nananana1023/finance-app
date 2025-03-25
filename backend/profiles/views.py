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
from rest_framework.views import APIView
import pandas as pd
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from io import BytesIO

#viewset - Group several related actions in one class (CRUD)
class UserFinancialProfileViewSet(viewsets.ModelViewSet):
    queryset = UserFinancialProfile.objects.all()
    serializer_class = UserFinancialProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            # Return serializer errors (with your custom messages) as JSON
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_update(serializer)
        return Response(serializer.data)

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

#sum of nonzero subcategories for given month 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sum_subcategories_month(request, year, month):
    user = request.user
   
    sums = (
        Transaction.objects
        .filter(user=user, date__year=year, date__month=month)
        .values('subcategory', 'category')
        .annotate(total_amount=Sum('amount'))
    )

    # only keep nonzero sums
    sums = [entry for entry in sums if entry['total_amount'] > 0]

    return Response(sums)

#average of all subcategories until it was 0 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def avg_subcategories(request):
    
    user = request.user
    now = datetime.now()
    cur_year = now.year
    cur_month = now.month

    # subcategories 
    subcategories = Transaction.objects.filter(
        user=user, 
        category="expense"
    ).values_list('subcategory', flat=True).distinct()

    output = []
    for subcat in subcategories:
        total_amount = 0
        count = 0

        temp_year = cur_year
        temp_month = cur_month
        
        while True:
            # monthly sum for this subcat
            monthly_total = Transaction.objects.filter(
                user=user,
                date__year=temp_year,
                date__month=temp_month,
                category="expense",
                subcategory=subcat
            ).aggregate(total=Sum('amount'))['total'] or 0

            # until sum was 0
            if monthly_total == 0:
                break

            total_amount += monthly_total
            count += 1
            
           # print(f"cat: {subcat} current month total: {monthly_total} total: {total_amount} count: {count}")

            # Move to previous month
            if temp_month == 1:
                temp_year -= 1
                temp_month = 12
            else:
                temp_month -= 1

        avg = total_amount / count if count > 0 else 0
        output.append({
            "subcategory": subcat,
            "average": avg
        })

    return Response(output)

class FileUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, format=None):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            file_bytes = file.read()
            stream = BytesIO(file_bytes)
            df = pd.read_excel(stream)
            df.columns = df.columns.str.strip() 
            print("Excel columns:", df.columns.tolist())
        except Exception as e:
            return Response({'error': 'Invalid Excel file.'}, status=status.HTTP_400_BAD_REQUEST)
        
        required_columns = ['Completed Date', 'Description', 'Amount', 'Category']
        if not all(col in df.columns for col in required_columns):
            return Response({
                'error': 'Missing one or more required columns.',
                'columns_found': df.columns.tolist()
            }, status=status.HTTP_400_BAD_REQUEST)
        
        created = 0
        errors = []

        for index, row in df.iterrows():
            try:
                date_value = row['Completed Date']
                if not isinstance(date_value, datetime):
                    date_value = datetime.strptime(str(date_value), "%m/%d/%Y %H:%M").date()
                else:
                    date_value = date_value.date()
                
                serializer_data = {
                    "date": date_value,
                    "note": row['Description'],
                    "amount": abs(row['Amount']),  
                    "subcategory": row['Category'], 
                }
                
                serializer = TransactionSerializer(data=serializer_data)
                if serializer.is_valid():
                    serializer.save(user=request.user)
                    created += 1
                else:
                    errors.append({f"row_{index}": serializer.errors})
            except Exception as e:
                errors.append({f"row_{index}": str(e)})
                continue
        
        if errors:
            return Response({
                'message': f'{created} transactions created.',
                'errors': errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'message': f'{created} transactions uploaded successfully.'}, status=status.HTTP_201_CREATED)