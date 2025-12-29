from django.urls import path
from . import views
urlpatterns = [
        path("summary/finance",view=views.financial_summary),
        path("summary/inventory",view=views.inventory_summary),
        
]
