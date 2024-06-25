from django.contrib import admin
from django.urls import path
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from kanban.views import (
    CommentViewSet,
    UsernameAuthView,
    TaskViewSet,
)
from account.views import UserViewSet
from django.conf import settings
from django.contrib.auth import views as auth_views

router = DefaultRouter()

router.register(r'tasks', TaskViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    path('1n0nus1b3r/', admin.site.urls),
    path('login/', UsernameAuthView.as_view(), name='login'),
    path('password-reset/', auth_views.PasswordResetView.as_view(), name='password_reset'),
    path('password-reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('password-reset/confirm/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('password-reset/complete/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

urlpatterns += router.urls
