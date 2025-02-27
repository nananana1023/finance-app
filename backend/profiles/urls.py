from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserFinancialProfileViewSet, TransactionViewSet, monthly_summary

router = DefaultRouter()
router.register(r'financial-profile', UserFinancialProfileViewSet, basename='financial-profile')
router.register(r'transactions', TransactionViewSet, basename='transaction')


urlpatterns = [
    path('', include(router.urls)),
    path('monthly-summary/<int:year>/<int:month>/', monthly_summary, name='monthly-summary'),
]
