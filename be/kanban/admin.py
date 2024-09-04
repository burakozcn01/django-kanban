from django.contrib import admin
from kanban.models import Column, Team, Task, Comment, User, Label


@admin.register(Label)
class LabelAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)
    ordering = ('name',)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    list_filter = ('is_staff', 'is_superuser', 'is_active')
    ordering = ('username',)


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'reporter', 'team', 'column', 'priority', 'start_date', 'end_date')
    search_fields = ('name', 'description', 'reporter__username', 'team__name')
    list_filter = ('priority', 'team', 'column', 'start_date', 'end_date')
    ordering = ('-create_time',)


@admin.register(Column)
class ColumnAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'priority')
    search_fields = ('title',)
    ordering = ('priority',)


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)
    ordering = ('name',)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'task', 'author', 'create_time')
    search_fields = ('content', 'author__username', 'task__name')
    list_filter = ('create_time',)
    ordering = ('-create_time',)
