from rest_framework import serializers
from .models import Inventory

class InventorySerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    category_name = serializers.CharField(source='product.category.name', read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    total_stock = serializers.IntegerField(read_only=True)
    total_amount = serializers.IntegerField(read_only=True)
    status = serializers.CharField(read_only=True)

    class Meta:
        model = Inventory
        fields = '__all__'
