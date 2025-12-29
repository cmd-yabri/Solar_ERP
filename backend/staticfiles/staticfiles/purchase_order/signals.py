from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import PurchaseOrder

@receiver(post_save, sender=PurchaseOrder)
def increment_inventory_on_receive(sender, instance, **kwargs):
    # Only run logic if the status was just changed to 'RECEIVED'
    if instance.status == 'RECEIVED':
        for item in instance.items.all():
            product = item.product
            product.current_stock += item.quantity
            product.save()