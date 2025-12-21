from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # App API Endpoints
    path('api/inventory/', include('inventory.urls')),
    path('api/purchases/', include('purchase_order.urls')),
    path('api/orders/', include('order.urls')),
    path('api/invoice/', include('invoice.urls')),
    path('api/user/', include('user.urls')),

    # Swagger Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]