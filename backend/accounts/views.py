from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, api_view, permission_classes, permission_classes
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
import random
from django.core.mail import send_mail
import time
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.http import JsonResponse
from .serializers import ChangePasswordSerializer


User = get_user_model()


@api_view(["POST"])
@permission_classes([AllowAny])
def validate_email_view(request):
    email = request.data.get("email", "")

    try:
        validate_email(email)
    except ValidationError:
        return Response({"valid": False, "message": "Enter a valid email address."}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({"valid": False, "message": "Email is already registered."}, status=400)

    return Response({"valid": True}) 

@api_view(["POST"])
@permission_classes([AllowAny]) 
def validate_username_view(request):
    username = request.data.get("username", "")

    if User.objects.filter(username=username).exists():
        return Response({"valid": False, "message": "Username is already taken."}, status=400)

    return Response({"valid": True})

pending_verifications = {} 

def generate_code():
    return str(random.randint(100000, 999999))

@api_view(["POST"])
@permission_classes([AllowAny])
def request_verification_code(request):
    email = request.data.get("email")
    code = generate_code()
    timestamp = int(time.time()) 

    pending_verifications[email] = {"code": code, "timestamp": timestamp}
    
    message = f"""
    Dear customer!
    
    Your verification code is: {code}
    
    Kind regards,  
    MoneySavvy Family 💸
    """

    send_mail(
        "Your Verification Code",
        message,
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
    if current_time - stored_data["timestamp"] > 300: # 5 min
        del pending_verifications[email]
        return Response({"message": "Verification code expired. Please request a new one."}, status=400)

    if stored_data["code"] != code:
        return Response({"message": "Invalid verification code."}, status=400)

    user = User.objects.create_user(username=username, email=email, password=password)
    user.is_active = True 
    user.save()

    del pending_verifications[email]  

    return Response({"message": "Account created successfully."}, status=201)

class LoginView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = User.objects.filter(username=username).first()
        
        if not user:
            print("User not found") 
            return Response({"error": "Invalid Credentials"}, status=400)

        if user.check_password(password): #matches the hashed pass
            refresh = RefreshToken.for_user(user) #new jwt refresh token
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token), #access token of the refresh token
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
    
class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self, queryset=None):
        return self.request.user

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        if not user.check_password(serializer.validated_data.get("old_password")):
            return Response({"old_password": "Wrong password."}, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(serializer.validated_data.get("new_password"))
        user.save()
        return Response({"detail": "Password updated successfully"}, status=status.HTTP_200_OK)
    
class ChangeUsernameView(generics.UpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self, queryset=None):
        return self.request.user

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        old_password = request.data.get("old_password")
        new_username = request.data.get("new_username")
        
        if not old_password or not new_username:
            return Response(
                {"detail": "Both fields are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_username) < 3:
            return Response(
                {"detail": "Username must be at least 3 characters long."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not user.check_password(old_password):
            return Response(
                {"detail": "Wrong password."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(username=new_username).exclude(pk=user.pk).exists():
            return Response(
                {"detail": "Username is already taken."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.username = new_username
        user.save()
        
        return Response(
            {"detail": "Username updated successfully"},
            status=status.HTTP_200_OK
        )