# dashboard/views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from inventory.models import Product
from django.db.models import Sum, F
from drf_spectacular.utils import extend_schema
@extend_schema()

@api_view(["GET"])
def inventory_summary(request):
    data = Product.objects.aggregate(
        total_products=Sum(1),
        total_stock=Sum("current_stock"),
        stock_value=Sum(F("current_stock") * F("unit_cost"))
    )
    return Response(data)
from invoice.models import DailyFinancialRecord
from django.db.models import Sum
@extend_schema()

@api_view(["GET"])
def financial_summary(request):
    totals = DailyFinancialRecord.objects.aggregate(
        revenue=Sum("total_revenue"),
        cogs=Sum("total_cogs"),
        freelance=Sum("total_freelance_costs"),
        expenses=Sum("total_operational_expenses"),
        profit=Sum("net_profit"),
    )
    return Response(totals)
