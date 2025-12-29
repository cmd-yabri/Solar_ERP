from django.contrib import admin
from .models import PurchaseOrder , PurchaseOrderItem,Supplier,Product
# Register your models here.
admin.site.register(PurchaseOrderItem)
admin.site.register(PurchaseOrder)
admin.site.register(Supplier)
admin.site.register(Product)
    