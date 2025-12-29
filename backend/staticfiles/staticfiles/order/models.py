from django.db import models
from inventory.models import Product

class SalesOrder(models.Model):
    client_name = models.CharField(max_length=200)
    client_phone = models.CharField(max_length=50, blank=True)
    date = models.DateTimeField(auto_now_add=True)
    
    # Logic Field
    is_finalized = models.BooleanField(default=False, help_text="If True, stock is deducted and revenue is booked.")

    @property
    def product_total(self):
        return sum(item.total_price for item in self.items.all())

    @property
    def service_total(self):
        return sum(job.charge_to_client for job in self.freelance_jobs.all())

    @property
    def grand_total(self):
        return self.product_total + self.service_total

    def __str__(self):
        return f"Order #{self.id} - {self.client_name}"

class OrderItem(models.Model):
    order = models.ForeignKey(SalesOrder, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Price sold to client")

    @property
    def total_price(self):
        return self.quantity * self.unit_price

class FreelanceJob(models.Model):
    """
    Tracks external work (Steel/Electric) attached to this order.
    """
    JOB_TYPES = [
        ('STEEL', 'Steel Work'),
        ('ELECTRIC', 'Electrician'),
        ('INSTALL', 'General Installation'),
    ]

    order = models.ForeignKey(SalesOrder, related_name='freelance_jobs', on_delete=models.CASCADE)
    job_type = models.CharField(max_length=20, choices=JOB_TYPES)
    contractor_name = models.CharField(max_length=200, help_text="Who is doing the work?")
    
    # Financials
    cost_to_company = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="What we pay the contractor")
    charge_to_client = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="What we bill the client")
    
    is_completed = models.BooleanField(default=False)

    @property
    def profit_margin(self):
        return self.charge_to_client - self.cost_to_company