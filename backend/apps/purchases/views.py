from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Purchase
from .serializers import PurchaseSerializer

class PurchaseViewSet(viewsets.ModelViewSet):
    queryset = Purchase.objects.select_related('product', 'branch').all()
    serializer_class = PurchaseSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        branch = self.request.query_params.get('branch')
        if branch:
            qs = qs.filter(branch_id=branch)
        return qs

    def perform_create(self, serializer):
        purchase = serializer.save()
        from apps.inventory.models import Inventory
        inventory, created = Inventory.objects.get_or_create(
            product=purchase.product,
            branch=purchase.branch,
            defaults={
                'open_stock': 0,
                'added_stock': 0,
                'sold_stock': 0,
                'remaining_stock': 0,
                'selling_price': 0,
            }
        )
        inventory.added_stock += purchase.quantity
        inventory.save()
