from .models import PurchaseOrder, POPayment
from .serializers import PurchaseOrderSerializer, POPaymentSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema
@extend_schema(responses=PurchaseOrderSerializer(many=True))
@api_view(['GET', 'POST'])
def po_list(request):
    if request.method == 'GET':
        orders = PurchaseOrder.objects.all()
        serializer = PurchaseOrderSerializer(orders, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = PurchaseOrderSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@extend_schema(responses=POPaymentSerializer)
@api_view(['POST'])
def add_po_payment(request, po_id):
    try:
        po = PurchaseOrder.objects.get(pk=po_id)
    except PurchaseOrder.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    serializer = POPaymentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(purchase_order=po)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



from .services import receive_purchase_order

@extend_schema(responses=PurchaseOrderSerializer)
@api_view(["POST"])
def receive_purchase_order_view(request, pk):
    try:
        po = PurchaseOrder.objects.get(pk=pk)
        receive_purchase_order(po)
        return Response(
            {"detail": "Purchase order received"},
    status=status.HTTP_200_OK
)
    except PurchaseOrder.DoesNotExist:
        return Response({"error": "PO not found"}, status=404)
    except ValueError as e:
        return Response({"error": str(e)}, status=400)
