from django.db.models import Sum
from .models import DailyFinancialRecord, Expense
from .serializers import DailyFinancialRecordSerializer, ExpenseSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema
@extend_schema(responses=DailyFinancialRecordSerializer(many=True))
@api_view(['GET'])
def dashboard_summary(request):
    """Provides high-level totals for the Dashboard cards."""
    # Aggregating all time or you can filter by date
    totals = DailyFinancialRecord.objects.aggregate(
        total_revenue=Sum('total_revenue'),
        total_profit=Sum('net_profit'),
        total_expenses=Sum('total_operational_expenses')
    )
    return Response(totals)

@extend_schema(responses=DailyFinancialRecordSerializer(many=True))
@api_view(['GET'])
def chart_data(request):
    """Returns data formatted for a Line Chart (Profit over time)."""
    records = DailyFinancialRecord.objects.order_by('date')[:30] # Last 30 days
    serializer = DailyFinancialRecordSerializer(records, many=True)
    return Response(serializer.data)

@extend_schema(responses=ExpenseSerializer(many=True))
@api_view(['GET', 'POST'])
def expense_list(request):
    if request.method == 'GET':
        expenses = Expense.objects.all()
        return Response(ExpenseSerializer(expenses, many=True).data)
    elif request.method == 'POST':
        serializer = ExpenseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
@extend_schema(responses=DailyFinancialRecordSerializer(many=True))

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
