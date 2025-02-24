from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework import generics, permissions
from rest_framework.decorators import api_view
from .serializers import RegisterSerializer
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
import random
from django.core.mail import send_mail
import time
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.http import JsonResponse
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes


User = get_user_model()  # Use the custom user model dynamically


@api_view(["POST"])
@permission_classes([AllowAny])
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
@permission_classes([AllowAny]) 
def validate_username_view(request):
    username = request.data.get("username", "")

    # Check if username is already registered
    if User.objects.filter(username=username).exists():
        return Response({"valid": False, "message": "Username is already taken."}, status=400)

    return Response({"valid": True})

# Temporary storage for verification codes
pending_verifications = {}  #{ "email": {"code": "123456", "timestamp": 1700000000} }

def generate_verification_code():
    return str(random.randint(100000, 999999))

@api_view(["POST"])
@permission_classes([AllowAny])
def request_verification_code(request):
    email = request.data.get("email")

    verification_code = generate_verification_code()
    timestamp = int(time.time())  # Current time in seconds

    # Store the code temporarily (expires in 5 minutes)
    pending_verifications[email] = {"code": verification_code, "timestamp": timestamp}

    # Send email with the code
    send_mail(
        "Your Verification Code",
        f"Your verification code is: {verification_code}",
        "savvy.wallet.app@gmail.com",
        [email],
        fail_silently=False,
    )

    return Response({"message": "A verification code has been sent to your email."})

@api_view(["POST"])
@permission_classes([AllowAny])
def verify_code(request):
    email = request.data.get("email")
    code = request.data.get("code")
    username = request.data.get("username")
    password = request.data.get("password")

    current_time = int(time.time())

    if email not in pending_verifications:
        return Response({"message": "Invalid request. Please register again."}, status=400)

    stored_data = pending_verifications[email]
    if current_time - stored_data["timestamp"] > 300:  # 5 minutes expiry
        del pending_verifications[email]
        return Response({"message": "Verification code expired. Please request a new one."}, status=400)

    if stored_data["code"] != code:
        return Response({"message": "Invalid verification code."}, status=400)

    # If verification successful, create user
    user = User.objects.create_user(username=username, email=email, password=password)
    user.is_active = True 
    user.save()

    del pending_verifications[email]  # Remove stored verification

    return Response({"message": "Email verified. Account created."}, status=201)


# Login API (returns JWT tokens)
class LoginView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = User.objects.filter(username=username).first()
        
        if not user:
            print("User not found") 
            return Response({"error": "Invalid Credentials"}, status=400)

        print(f"User found: {user.username}, Stored password: {user.password}")  

        if user.check_password(password):
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            })

        print("Password mismatch")  
        return Response({"error": "Invalid Credentials"}, status=400)
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])  
def get_user_details(request):
    user = request.user
    return JsonResponse({
        "id": user.id,
        "username": user.username,
        "email": user.email
    })