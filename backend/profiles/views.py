from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import UserFinancialProfile, Transaction
from .serializers import UserFinancialProfileSerializer, TransactionSerializer

class UserFinancialProfileViewSet(viewsets.ModelViewSet):
    queryset = UserFinancialProfile.objects.all()
    serializer_class = UserFinancialProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Ensures that a user can only see their own profile
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        if not self.request.user or self.request.user.is_anonymous:
            raise Exception("User is not authenticated.")

        try:
            serializer.save(user=self.request.user)
        except Exception as e:
            print("ERROR during profile creation:", str(e))  # Log exact error
            raise
        
    def perform_update(self, serializer):
        serializer.save(user=self.request.user) 
    
    
class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]  
    
    def get_queryset(self):
        """Return only transactions for the authenticated user."""
        return Transaction.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Automatically assign the authenticated user when creating a transaction."""
        serializer.save(user=self.request.user)

     
