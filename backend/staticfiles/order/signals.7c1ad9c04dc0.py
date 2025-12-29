from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import SalesOrder
from invoice.models import DailyFinancialRecord

@receiver(post_save, sender=SalesOrder)
def finalize_sale_logic(sender, instance, **kwargs):
    if instance.is_finalized:
        # 1. Update Inventory (Decrement)
        for item in instance.items.all():
            product = item.product
            product.current_stock -= item.quantity
            product.save()

        # 2. Update Finance Snapshot
        record, created = DailyFinancialRecord.objects.get_or_create(date=instance.date.date())
        
        # Calculate new totals for that day
        record.total_revenue += instance.grand_total
        
        # Calculate COGS (Cost of Goods Sold)
        cogs = sum(item.quantity * item.product.unit_cost for item in instance.items.all())
        record.total_cogs += cogs
        
        # Calculate Freelance Costs
        freelance = sum(job.cost_to_company for job in instance.freelance_jobs.all())
        record.total_freelance_costs += freelance
        
        # Update Net Profit
        record.net_profit = record.total_revenue - (record.total_cogs + record.total_freelance_costs + record.total_operational_expenses)
        record.save()