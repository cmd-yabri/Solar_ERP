from rest_framework import serializers
from django.contrib.auth import authenticate 
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'username', 'email', 'password', 'role', 'is_active']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Uses the UserManager's create_user to handle password hashing automatically
        return User.objects.create_user(**validated_data)

class LoginSerializer(serializers.Serializer):
    # Change this to 'email' if your login page asks for an email
    email = serializers.EmailField(required=False)
    username = serializers.CharField(required=False)
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        # Try to authenticate using whatever the frontend sent
        username = data.get("username") or data.get("email")
        password = data.get("password")

        user = authenticate(username=username, password=password)
        
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        if not user.is_active:
            raise serializers.ValidationError("User is inactive")
        
        data["user"] = user
        return data