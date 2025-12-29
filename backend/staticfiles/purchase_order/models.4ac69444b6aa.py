from django.db import models
from inventory.models import Product

class Supplier(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.name

class PurchaseOrder(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('RECEIVED', 'Received'), # Status change triggers inventory increase
        ('CANCELLED', 'Cancelled'),
    ]
    
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')

    @property
    def total_cost(self):
        return sum(item.total_cost for item in self.items.all())

    @property
    def total_paid(self):
        return sum(payment.amount for payment in self.payments.all())

    @property
    def payment_status(self):
        if self.total_paid >= self.total_cost:
            return "Fully Paid"
        elif self.total_paid > 0:
            return "Partial"
        return "Unpaid"

    def __str__(self):
        return f"PO #{self.id} - {self.supplier.name}"

class PurchaseOrderItem(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, help_text="Cost at time of purchase")

    @property
    def total_cost(self):
        return self.quantity * self.unit_cost

class POPayment(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, related_name='payments', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()