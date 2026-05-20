from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard, name='report_dashboard'),
    path('data/', views.report_data, name='report_data'),
]
