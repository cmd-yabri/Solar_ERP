from rest_framework import serializers
from .models import Expense, DailyFinancialRecord

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'

class DailyFinancialRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyFinancialRecord
        fields = [
            'date', 'total_revenue', 'total_cogs', 
            'total_freelance_costs', 'total_operational_expenses', 'net_profit'
        ]