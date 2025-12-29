from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema
from .serializers import UserSerializer, LoginSerializer
from django.contrib.auth import authenticate

@extend_schema(request=UserSerializer, responses=UserSerializer)
@api_view(["POST"])
@permission_classes([AllowAny])
def signup(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"data": serializer.data, "message": "User created successfully"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    # Use 'email' or 'username' depending on what your frontend sends
    username = request.data.get("username") or request.data.get("email")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)

    if user is not None:
        refresh = RefreshToken.for_user(user)
        
        # We manually build the response to ensure no UUID errors
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                #"id": str(user.id), # Convert UUID to string
                "username": user.username,
                #"email": user.email,
                "role": "ADMIN", # Force ADMIN for now to bypass redirect issues
                #"is_staff": user.is_staff
            }
        }, status=status.HTTP_200_OK)
    
    return Response({"error": "Invalid Credentials"}, status=status.HTTP_401_UNAUTHORIZED)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    user = request.user
    # Ensure this is wrapped in "payload" for your frontend!
    return Response({
        "payload": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,  # Make sure your model has a 'role' field
        }
    })