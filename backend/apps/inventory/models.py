from django.db import models
from apps.products.models import Product
from apps.branches.models import Branch

class Inventory(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='inventory')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='inventory')
    open_stock = models.PositiveIntegerField(default=0)
    added_stock = models.PositiveIntegerField(default=0)
    sold_stock = models.PositiveIntegerField(default=0)
    remaining_stock = models.PositiveIntegerField(default=0)
    selling_price = models.DecimalField(max_digits=12, decimal_places=0)
    reorder_level = models.PositiveIntegerField(default=5)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'inventory'
        unique_together = ['product', 'branch']
        ordering = ['product__name']

    @property
    def total_stock(self):
        return self.open_stock + self.added_stock

    @property
    def total_amount(self):
        return self.sold_stock * self.selling_price

    @property
    def status(self):
        if self.remaining_stock <= 0:
            return 'Out of Stock'
        if self.remaining_stock <= self.reorder_level:
            return 'Low Stock'
        return 'In Stock'

    def save(self, *args, **kwargs):
        self.remaining_stock = (self.open_stock + self.added_stock) - self.sold_stock
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.product.name} @ {self.branch.name}'
