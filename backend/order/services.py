from django.db import transaction
from django.utils.timezone import now
from invoice.models import DailyFinancialRecord

def finalize_sales_order(order):
    if order.is_finalized:
        raise ValueError("Order already finalized")

    # STOCK SAFETY CHECK
    for item in order.items.select_related("product"):
        if item.product.current_stock < item.quantity:
            raise ValueError(
                f"Insufficient stock for {item.product.name}"
            )

    with transaction.atomic():
        today = now().date()
        record, _ = DailyFinancialRecord.objects.get_or_create(date=today)

        # PRODUCTS
        for item in order.items.select_related("product"):
            product = item.product

            product.current_stock -= item.quantity
            product.save()

            record.total_cogs += item.quantity * product.unit_cost
            record.total_revenue += item.total_price

        # FREELANCE JOBS
        for job in order.freelance_jobs.all():
            record.total_freelance_costs += job.cost_to_company

        record.net_profit = (
            record.total_revenue
            - record.total_cogs
            - record.total_freelance_costs
            - record.total_operational_expenses
        )
        record.save()

        order.is_finalized = True
        order.save()
