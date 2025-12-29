from django.db import models

class Expense(models.Model):
    CATEGORY_CHOICES = [
        ('RENT', 'Rent'),
        ('SALARY', 'Salaries'),
        ('MARKETING', 'Marketing'),
        ('UTILITIES', 'Utilities'),
        ('OTHER', 'Other'),
    ]
    
    description = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    receipt_image = models.ImageField(upload_to='expenses/', null=True, blank=True)

    def __str__(self):
        return f"{self.date} - {self.category}: {self.amount}"

class DailyFinancialRecord(models.Model):
    date = models.DateField(unique=True)
    
    # Money IN
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    # Money OUT
    total_cogs = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, help_text="Cost of Goods Sold")
    total_freelance_costs = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, help_text="Paid to contractors")
    total_operational_expenses = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, help_text="Rent, Marketing, etc.")
    
    # Result
    net_profit = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.date} - Profit: {self.net_profit}"