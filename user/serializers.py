from rest_framework import serializers
from .models import User
from django.contrib.auth import authenticate 
from rest_framework.validators import UniqueValidator


class UserSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    first_name=serializers.CharField()
    last_name=serializers.CharField()
    username = serializers.CharField(
        max_length=250, validators=[UniqueValidator(queryset=User.objects.all())]
    )
    email = serializers.EmailField(
        max_length=250, validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(max_length=250)
    is_active = serializers.BooleanField(default=True)
    role = serializers.CharField()
    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(
            email=data["email"],
            password=data["password"]
        )
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        if not user.is_active:
            raise serializers.ValidationError("User is inactive")
        data["user"] = user
        return data
