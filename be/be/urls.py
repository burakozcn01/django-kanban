from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from kanban.views import (
    CommentViewSet,
    UsernameAuthView,
    TaskViewSet,
    UserViewSet,
    LabelViewSet,
    TaskHistoryViewSet,
    InvitationViewSet,
    ProfileView,
    AcceptInvitationView,
    GanttChartView,
    CalendarView,
    StatisticsView,
    RegisterView
)
from django.conf import settings
from django.contrib.auth import views as auth_views
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from rest_framework_simplejwt.views import TokenRefreshView

# API Router Configuration
router = DefaultRouter()
router.register(r'tasks', TaskViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'users', UserViewSet)
router.register(r'labels', LabelViewSet)
router.register(r'history', TaskHistoryViewSet)
router.register(r'invitations', InvitationViewSet)

# API Documentation with Swagger and Redoc
schema_view = get_schema_view(
   openapi.Info(
      title="Kanban API",
      default_version='v1',
      description="Kanban API Documentation",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="contact@kanban.local"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

# URL Patterns
urlpatterns = [
    # Admin Routes
    path('admin/', admin.site.urls),

    # Authentication and Registration Routes
    path('login/', UsernameAuthView.as_view(), name='login'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', ProfileView.as_view(), name='profile'),

    # Invitation Routes
    path('accept-invitation/<int:invitation_id>/', AcceptInvitationView.as_view(), name='accept-invitation'),

    # Password Reset Routes
    path('password-reset/', auth_views.PasswordResetView.as_view(), name='password_reset'),
    path('password-reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('password-reset/confirm/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('password-reset/complete/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),

    # API Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    # Task-specific Routes
    path('tasks/reorder/', TaskViewSet.as_view({'post': 'reorder'}), name='task-reorder'),
    path('gantt-chart/', GanttChartView.as_view(), name='gantt-chart'),
    path('calendar/', CalendarView.as_view(), name='calendar'),
    path('statistics/', StatisticsView.as_view(), name='statistics'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

urlpatterns += router.urls
