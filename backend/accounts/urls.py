from django.urls import path
from .views import LoginView, validate_email_view, ChangePasswordView, ChangeUsernameView, validate_username_view, request_verification_code, verify_code, get_user_details

urlpatterns = [
    path('login/', LoginView.as_view(), name="login"),
    path('validate-email/', validate_email_view, name="validate-email"),
    path('validate-username/', validate_username_view, name="validate-username"),
    path("request-verification-code/", request_verification_code, name="request-verification-code"),
    path("verify-code/", verify_code, name="verify-code"),
    path("user/", get_user_details, name="user-details"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("change-username/", ChangeUsernameView.as_view(), name="change-username"),
]
