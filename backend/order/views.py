from .models import SalesOrder, FreelanceJob
from .serializers import SalesOrderSerializer, FreelanceJobSerializer
from drf_spectacular.utils import extend_schema
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .services import finalize_sales_order

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
@extend_schema(responses=SalesOrderSerializer(many=True))

@api_view(["POST"])
def finalize_order(request, pk):
    try:
        order = SalesOrder.objects.get(pk=pk)
        finalize_sales_order(order)
        return Response(
            {"detail": "Order finalized successfully"},
            status=status.HTTP_200_OK
        )
    except SalesOrder.DoesNotExist:
        return Response(
            {"error": "Order not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except ValueError as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )