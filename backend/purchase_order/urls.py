from django.urls import path
from . import views

urlpatterns = [
    path('po/', views.po_list, name='po-list'),
    path('po/<int:po_id>/add-payment/', views.add_po_payment, name='add-po-payment'),
    path('po/<int:po_id>/recieve-purchase-order/', views.receive_purchase_order_view, name='recieve purchase order'),
]