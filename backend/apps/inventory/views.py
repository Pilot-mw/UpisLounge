from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Inventory
from .serializers import InventorySerializer

class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.select_related('product__category', 'branch').all()
    serializer_class = InventorySerializer

    def get_queryset(self):
        qs = super().get_queryset()
        branch = self.request.query_params.get('branch')
        category = self.request.query_params.get('category')
        if branch:
            qs = qs.filter(branch_id=branch)
        if category:
            qs = qs.filter(product__category__name__iexact=category)
        return qs

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        qs = self.get_queryset().filter(remaining_stock__lte=models.F('reorder_level'))
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_stock(self, request, pk=None):
        inventory = self.get_object()
        qty = request.data.get('quantity', 0)
        try:
            qty = int(qty)
            if qty <= 0:
                return Response({'error': 'Quantity must be positive'}, status=status.HTTP_400_BAD_REQUEST)
            inventory.added_stock += qty
            inventory.save()
            serializer = self.get_serializer(inventory)
            return Response(serializer.data)
        except (ValueError, TypeError):
            return Response({'error': 'Invalid quantity'}, status=status.HTTP_400_BAD_REQUEST)

from django.db import models as models
