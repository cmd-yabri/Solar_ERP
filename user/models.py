from django.db import models
from django.contrib.auth.models import AbstractBaseUser, UserManager, PermissionsMixin
from django.contrib.auth.validators import UnicodeUsernameValidator
import uuid

class Role(models.TextChoices):
    USER="USER","User"
    ADMIN= "ADMIN", "Admin"
class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_name=models.CharField(max_length=20)
    last_name=models.CharField(max_length=20)
    username = models.CharField(
        validators=[UnicodeUsernameValidator], max_length=250, unique=True
    )
    email = models.EmailField(max_length=250, blank=True, default="")
    role = models.CharField(
        max_length=5,
        choices=Role.choices,
        default=Role.USER
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()
    USERNAME_FIELD = "username"
    Email_Field = "email"

    class Meta:
        db_table = "users"
    
    def __str__(self) -> str:
        return self.username
