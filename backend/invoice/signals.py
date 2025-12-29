from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Expense, DailyFinancialRecord

@receiver(post_save, sender=Expense)
def update_daily_record_on_expense(sender, instance, **kwargs):
    # Get or create the snapshot for the day the expense occurred
    record, created = DailyFinancialRecord.objects.get_or_create(date=instance.date)
    
    # Add this expense to the daily total
    record.total_operational_expenses += instance.amount
    
    # Recalculate net profit
    record.net_profit = record.total_revenue - (
        record.total_cogs + 
        record.total_freelance_costs + 
        record.total_operational_expenses
    )
    record.save()