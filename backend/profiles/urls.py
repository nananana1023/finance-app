from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserFinancialProfileViewSet

router = DefaultRouter()
router.register(r'financial-profile', UserFinancialProfileViewSet, basename='financial-profile')

urlpatterns = [
    path('', include(router.urls)),
]
