from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100)
    
    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=200)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Financials
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, help_text="Average cost to buy")
    selling_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Standard selling price")
    
    # Stock Levels
    current_stock = models.IntegerField(default=0)
    reorder_threshold = models.IntegerField(default=10, help_text="Alert when stock drops below this")

    def __str__(self):
        return f"{self.name} (SKU: {self.sku})"