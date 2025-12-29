from django.db import transaction

def receive_purchase_order(po):
    if po.status == "RECEIVED":
        raise ValueError("Purchase order already received")
    if po.status == "CANCELLED":
        raise ValueError("Cancelled purchase order cannot be received")
    with transaction.atomic():
        for item in po.items.select_related("product"):
            product = item.product

            total_existing_value = product.current_stock * product.unit_cost
            total_new_value = item.quantity * item.unit_cost

            new_stock = product.current_stock + item.quantity

            new_unit_cost = (
                (total_existing_value + total_new_value) / new_stock
                if new_stock > 0 else item.unit_cost
            )

            product.current_stock = new_stock
            product.unit_cost = new_unit_cost
            product.save()

        po.status = "RECEIVED"
        po.save()
