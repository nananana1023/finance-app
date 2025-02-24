from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserFinancialProfileViewSet, TransactionViewSet

router = DefaultRouter()
router.register(r'financial-profile', UserFinancialProfileViewSet, basename='financial-profile')
router.register(r'transactions', TransactionViewSet, basename='transaction')


urlpatterns = [
    path('', include(router.urls)),
]
