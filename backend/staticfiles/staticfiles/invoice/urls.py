from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard_summary, name='dashboard-summary'),
    path('charts/', views.chart_data, name='chart-data'),
    path('expenses/', views.expense_list, name='expense-list'),
]