from django.urls import path
from . import views

urlpatterns = [
    path('', views.login, name='login'),
    path('signup/', views.signup, name='signup'),
    path('getuserinfo/', views.get_user_info, name='getinfo'),
]