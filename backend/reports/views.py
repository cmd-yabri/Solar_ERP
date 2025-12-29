from datetime import date
from django.db.models import Sum, F
from django.db.models.functions import ExtractWeek, ExtractMonth, ExtractQuarter, ExtractYear
from rest_framework.decorators import api_view
from rest_framework.response import Response

from order.models import SalesOrder
from inventory.models import Product
from invoice.models import DailyFinancialRecord
from drf_spectacular.utils import extend_schema
@extend_schema()

@api_view(["GET"])
def dashboard_summary(request):
    data = {
        "total_revenue": DailyFinancialRecord.objects.aggregate(
            total=Sum("total_revenue")
        )["total"] or 0,

        "total_profit": DailyFinancialRecord.objects.aggregate(
            total=Sum("net_profit")
        )["total"] or 0,

        "open_orders": SalesOrder.objects.filter(
            is_finalized=False
        ).count(),

        "low_stock_items": Product.objects.filter(
            current_stock__lte=F("reorder_threshold")
        ).count(),
    }

    return Response(data)

@extend_schema()

@api_view(["GET"])
def weekly_financial_report(request):
    data = (
        DailyFinancialRecord.objects
        .annotate(
            year=ExtractYear("date"),
            week=ExtractWeek("date"),
        )
        .values("year", "week")
        .annotate(
            revenue=Sum("total_revenue"),
            profit=Sum("net_profit"),
        )
        .order_by("year", "week")
    )

    return Response(list(data))
@api_view(["GET"])
def monthly_financial_report(request):
    data = (
        DailyFinancialRecord.objects
        .annotate(
            year=ExtractYear("date"),
            month=ExtractMonth("date"),
        )
        .values("year", "month")
        .annotate(
            revenue=Sum("total_revenue"),
            profit=Sum("net_profit"),
        )
        .order_by("year", "month")
    )

    return Response(list(data))
@api_view(["GET"])
def quarterly_financial_report(request):
    data = (
        DailyFinancialRecord.objects
        .annotate(
            year=ExtractYear("date"),
            quarter=ExtractQuarter("date"),
        )
        .values("year", "quarter")
        .annotate(
            revenue=Sum("total_revenue"),
            profit=Sum("net_profit"),
        )
        .order_by("year", "quarter")
    )

    return Response(list(data))
@api_view(["GET"])
def yearly_financial_report(request):
    data = (
        DailyFinancialRecord.objects
        .annotate(
            year=ExtractYear("date"),
        )
        .values("year")
        .annotate(
            revenue=Sum("total_revenue"),
            profit=Sum("net_profit"),
        )
        .order_by("year")
    )

    return Response(list(data))


from datetime import date, timedelta
from django.utils.timezone import now

@api_view(["GET"])
def financial_reports(request):
    period = request.query_params.get("period", "monthly")
    today = date.today()

    if period == "weekly":
        start = today - timedelta(days=7)
    elif period == "quarterly":
        start = today - timedelta(days=90)
    elif period == "yearly":
        start = today - timedelta(days=365)
    else:
        start = today.replace(day=1)

    records = DailyFinancialRecord.objects.filter(date__gte=start)

    data = records.aggregate(
        revenue=Sum("total_revenue"),
        profit=Sum("net_profit"),
        expenses=Sum("total_operational_expenses"),
    )

    return Response(data)
