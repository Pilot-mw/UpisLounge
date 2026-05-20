from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Sale
from .serializers import SaleSerializer, CreateSaleSerializer

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.prefetch_related('items', 'items__product').select_related('branch', 'cashier').all()
    serializer_class = SaleSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        branch = self.request.query_params.get('branch')
        if branch:
            qs = qs.filter(branch_id=branch)
        return qs

    def create(self, request, *args, **kwargs):
        serializer = CreateSaleSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        sale = serializer.save()
        out = SaleSerializer(sale)
        return Response(out.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def today(self, request):
        from django.utils import timezone
        qs = self.get_queryset().filter(created_at__date=timezone.now().date())
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)
