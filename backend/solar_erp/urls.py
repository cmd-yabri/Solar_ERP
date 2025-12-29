from django.contrib import admin
from django.urls import path, include, re_path
from .views import index
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.views.generic import TemplateView
import os 
from django.views.static import serve
from django.conf import settings
from user.views import login , get_user_info
urlpatterns = [
    path('admin/', admin.site.urls),
    
    # App API Endpoints
    path('api/auth/token/', login, name="token_obtain_pair"),
    path('api/auth/token', login, name="token_obtain_pair"),
    path('api/user/me/', get_user_info), 
    path('api/user/', include('user.urls')),
    path("api/reports/", include("reports.urls")),
    
    
    path('api/inventory/', include('inventory.urls')),
    path('api/purchases/', include('purchase_order.urls')),
    path('api/orders/', include('order.urls')),
    path('api/invoice/', include('invoice.urls')),
    path('', TemplateView.as_view(template_name='index.html')),
    # Swagger Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    re_path(r'^assets/(?P<path>.*)$', serve, {
        'document_root': os.path.join(settings.BASE_DIR, 'frontend', 'dist', 'assets'),
    }),

    # This serves the index.html for everything else

]
urlpatterns += [
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]