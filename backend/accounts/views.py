from rest_framework.response import Response
from rest_framework import generics, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view
from django.contrib.auth import get_user_model
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
import random
import string
from django.core.mail import send_mail
from django.contrib.auth.models import User

User = get_user_model()  # Use the custom user model dynamically


#Register API and  log errors
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        print("📩 Received data in Django:", request.data)  # Debugging

        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("❌ Serializer errors:", serializer.errors)  # Debugging errors
            return Response(serializer.errors, status=400)  # Send detailed error

        return super().create(request, *args, **kwargs)

# Login API (returns JWT tokens)
class LoginView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = User.objects.filter(username=username).first()
        
        if user and user.check_password(password):
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            })
        return Response({"error": "Invalid Credentials"}, status=400)


@api_view(["POST"])
def validate_email_view(request):
    email = request.data.get("email", "")

    # Check if the email format is valid
    try:
        validate_email(email)
    except ValidationError:
        return Response({"valid": False, "message": "Enter a valid email address."}, status=400)

    # Check if the email is already registered
    if User.objects.filter(email=email).exists():
        return Response({"valid": False, "message": "Email is already in use."}, status=400)

    return Response({"valid": True})  # No error if email is valid


@api_view(["POST"])
def validate_username_view(request):
    username = request.data.get("username", "")

    # Check if username is already registered
    if User.objects.filter(username=username).exists():
        return Response({"valid": False, "message": "Username is already taken."}, status=400)

    return Response({"valid": True})

@api_view(["POST"])
def login_validate_username_view(request):
    username = request.data.get("username", "")

    # Check if username is already registered
    if User.objects.filter(username=username).exists():
        return Response({"valid": True})
    
    else:
        return Response({"valid": False, "message": "Username does not exist."}, status=400)

