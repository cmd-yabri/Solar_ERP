from rest_framework import serializers
from .models import PurchaseOrder, PurchaseOrderItem, POPayment, Supplier

class POPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = POPayment
        fields = '__all__'

class POItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = PurchaseOrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_cost', 'total_cost']

class PurchaseOrderSerializer(serializers.ModelSerializer):
    items = POItemSerializer(many=True)
    payments = POPaymentSerializer(many=True, read_only=True)
    supplier_name = serializers.ReadOnlyField(source='supplier.name')

    class Meta:
        model = PurchaseOrder
        fields = ['id', 'supplier', 'supplier_name', 'status', 'items', 'payments', 'total_cost', 'total_paid', 'payment_status', 'created_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        purchase_order = PurchaseOrder.objects.create(**validated_data)
        for item_data in items_data:
            PurchaseOrderItem.objects.create(purchase_order=purchase_order, **item_data)
        return purchase_order