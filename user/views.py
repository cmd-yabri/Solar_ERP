from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from user.permissions import *
from rest_framework.parsers import JSONParser, MultiPartParser
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from .serializers import *
from datetime import timedelta

from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

@swagger_auto_schema(method="POST")
@api_view(["POST"])
@permission_classes([AllowAny])
def signup(request):
    ser=UserSerializer(data=request.data)
    if ser.is_valid():
        ser.save()
        return Response({"data": ser.data , "message":"user created successfuly"}, status = status.HTTP_201_CREATED)
    else:
        return Response({"errors":ser.errors,"message":"user not created successfuly"}, status = status.HTTP_400_BAD_REQUEST) 
    



@swagger_auto_schema(method="POST")
@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": str(user.id),
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "role": user.role,
                }
        }, status=200)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(method="GET")
@api_view(["GET"])
@permission_classes([IsAdmin])
def GetUserInfo(request):
    user= request.user
    if not user:
        return Response({"message":"no user found"},status=status.HTTP_404_NOT_FOUND)
    else:
        return Response(user,status=status.HTTP_200_OK)