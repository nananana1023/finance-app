from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import UserFinancialProfile
from .serializers import UserFinancialProfileSerializer

class UserFinancialProfileViewSet(viewsets.ModelViewSet):
    queryset = UserFinancialProfile.objects.all()
    serializer_class = UserFinancialProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Ensures that a user can only see their own profile
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        print("DEBUG: Request user ->", self.request.user)
        print("DEBUG: Is Authenticated? ->", self.request.user.is_authenticated)

        if not self.request.user or self.request.user.is_anonymous:
            raise Exception("User is not authenticated.")

        try:
            serializer.save(user=self.request.user)
        except Exception as e:
            print("ERROR during profile creation:", str(e))  # Log exact error
            raise
    

     
