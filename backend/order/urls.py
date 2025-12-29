from django.urls import path
from . import views

urlpatterns = [
    path('sales/', views.sales_order_list, name='sales-order-list'),
    path('sales/<int:pk>/finalize/', views.finalize_order, name='finalize-order'),
]