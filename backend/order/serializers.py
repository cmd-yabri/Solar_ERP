
from rest_framework import serializers
from .models import SalesOrder, OrderItem, FreelanceJob

class FreelanceJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = FreelanceJob
        fields = ['id', 'job_type', 'contractor_name', 'cost_to_company', 'charge_to_client', 'is_completed', 'profit_margin']

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 'total_price']

class SalesOrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    freelance_jobs = FreelanceJobSerializer(many=True)

    class Meta:
        model = SalesOrder
        fields = ['id', 'client_name', 'client_phone', 'date', 'is_finalized', 'items', 'freelance_jobs', 'product_total', 'service_total', 'grand_total']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        freelance_data = validated_data.pop('freelance_jobs')
        
        # Create the main order
        order = SalesOrder.objects.create(**validated_data)
        
        # Create the associated items
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
            
        # Create the associated freelance jobs
        for job_data in freelance_data:
            FreelanceJob.objects.create(order=order, **job_data)
            
        return order