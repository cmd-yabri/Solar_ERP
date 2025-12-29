from .models import SalesOrder, FreelanceJob
from .serializers import SalesOrderSerializer, FreelanceJobSerializer
from drf_spectacular.utils import extend_schema
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
@extend_schema(responses=SalesOrderSerializer(many=True))
@api_view(['GET', 'POST'])
def sales_order_list(request):
    if request.method == 'GET':
        orders = SalesOrder.objects.all()
        serializer = SalesOrderSerializer(orders, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        # React will send nested data: items: [...], freelance_jobs: [...]
        serializer = SalesOrderSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save() # Signals will auto-deduct stock if is_finalized=True
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
def finalize_order(request, pk):
    """A quick endpoint to mark an order as finalized (triggers signals)."""
    try:
        order = SalesOrder.objects.get(pk=pk)
    except SalesOrder.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    order.is_finalized = True
    order.save() # The signal runs here!
    return Response({'status': 'Order finalized and stock updated'})