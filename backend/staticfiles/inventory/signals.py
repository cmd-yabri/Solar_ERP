from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Product

@receiver(post_save, sender=Product)
def check_stock_alerts(sender, instance, **kwargs):
    if instance.current_stock <= instance.reorder_threshold:
        # Here you could trigger a notification or log a warning
        print(f"ALERT: {instance.name} is low on stock!")