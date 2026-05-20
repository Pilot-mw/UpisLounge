from django.db import models
from apps.branches.models import Branch
from apps.products.models import Product

class Purchase(models.Model):
    supplier_name = models.CharField(max_length=200)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='purchases')
    product_name = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField()
    cost = models.DecimalField(max_digits=14, decimal_places=0)
    invoice_number = models.CharField(max_length=100, blank=True)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='purchases')
    date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f'{self.supplier_name} — {self.product_name} x{self.quantity}'
