from rest_framework import serializers
from .models import Sale, SaleItem

class SaleItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 'total_price']

class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True, read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    cashier_name = serializers.SerializerMethodField()

    class Meta:
        model = Sale
        fields = ['id', 'branch', 'branch_name', 'cashier', 'cashier_name', 'total_amount', 'items', 'created_at']

    def get_cashier_name(self, obj):
        if obj.cashier:
            return obj.cashier.get_full_name() or obj.cashier.username
        return 'Unknown'

class CreateSaleSerializer(serializers.Serializer):
    branch_id = serializers.IntegerField()
    items = serializers.ListField(child=serializers.DictField())

    def create(self, validated_data):
        from django.db import transaction
        from apps.inventory.models import Inventory
        from apps.products.models import Product

        branch_id = validated_data['branch_id']
        items_data = validated_data['items']
        user = self.context['request'].user

        with transaction.atomic():
            sale = Sale.objects.create(
                branch_id=branch_id,
                cashier=user if user.is_authenticated else None,
                total_amount=0
            )

            total = 0
            sale_items = []
            for item in items_data:
                product_id = item['product_id']
                quantity = item['quantity']
                product = Product.objects.get(id=product_id)

                unit_price = float(item.get('unit_price', product.selling_price))
                line_total = quantity * unit_price
                total += line_total

                sale_items.append(SaleItem(
                    sale=sale,
                    product=product,
                    product_name=product.name,
                    quantity=quantity,
                    unit_price=unit_price,
                    total_price=line_total
                ))

                inventory, created = Inventory.objects.get_or_create(
                    product=product,
                    branch_id=branch_id,
                    defaults={
                        'open_stock': 0,
                        'added_stock': 0,
                        'sold_stock': 0,
                        'remaining_stock': 0,
                        'selling_price': unit_price,
                        'reorder_level': 5,
                    }
                )
                inventory.sold_stock += quantity
                inventory.remaining_stock = max(0, inventory.remaining_stock - quantity)
                inventory.selling_price = unit_price
                inventory.save()

            SaleItem.objects.bulk_create(sale_items)
            sale.total_amount = total
            sale.save()

        return sale
