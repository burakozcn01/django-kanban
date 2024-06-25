from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    label = models.ManyToManyField(
        "kanban.Labels", related_name="labels_user", blank=True
    )

    class Meta:
        verbose_name_plural = "Kullanıcılar"
