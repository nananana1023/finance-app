from django.urls import path
from .views import RegisterView, LoginView, validate_email_view, validate_username_view, login_validate_username_view


urlpatterns = [
    path('register/', RegisterView.as_view(), name="register"),
    path('login/', LoginView.as_view(), name="login"),
    path('validate-email/', validate_email_view, name="validate-email"),
    path('validate-username/', validate_username_view, name="validate-username"),
    path('login-validate-username/', login_validate_username_view, name="validate-username"),

]
