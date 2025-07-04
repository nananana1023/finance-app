from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserFinancialProfileViewSet, FileUploadView, TransactionViewSet, monthly_summary, expenses_months, sum_subcategories_month, avg_subcategories

router = DefaultRouter()
router.register(r'financial-profile', UserFinancialProfileViewSet, basename='financial-profile')
router.register(r'transactions', TransactionViewSet, basename='transaction')


urlpatterns = [
    path('', include(router.urls)),  
    path('monthly-summary/<int:year>/<int:month>/', monthly_summary, name='monthly-summary'),
    path(
        'transactions/by-month/<int:year>/<int:month>/',
        TransactionViewSet.as_view({'get': 'by_month'}),
        name='by-month'
    ),
    path('expenses-months/', expenses_months, name='expenses-months'),
    path('sum-subcategories-month/<int:year>/<int:month>/', sum_subcategories_month, name='sum-subcategories-month'),
    path('avg-subcategories/', avg_subcategories, name='avg-subcategories'),
    path('upload/', FileUploadView.as_view(), name='upload'),
]
