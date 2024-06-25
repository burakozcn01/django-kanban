from datetime import datetime
from rest_framework import serializers

from account.models import User
from .models import Task, Labels, Comment
from django.conf import settings


class MNUserSerializer(serializers.ModelSerializer):
    avatarUrl = serializers.SerializerMethodField()
    id = serializers.CharField()

    class Meta:
        model = User
        fields = (
            'avatarUrl',
            'username',
            'id',
        )

    def get_avatarUrl(self, obj):
        if obj.avatar and hasattr(obj.avatar, 'url'):
            return settings.DOMAIN_NAME + obj.avatar.url
        else:
            return None


class LabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Labels
        fields = ('title',)


class MNCommentSerializer(serializers.ModelSerializer):
    message = serializers.CharField(source='content')
    createdAt = serializers.DateTimeField(source='create_time')
    messageType = serializers.SerializerMethodField()
    name = serializers.CharField(source='author.username')
    id = serializers.CharField()
    avatarUrl = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ('message', 'id', 'createdAt', 'messageType', 'name', 'avatarUrl')

    def get_messageType(self, obj):
        return 'text'

    def get_avatarUrl(self, obj):
        if obj.author.avatar and hasattr(obj.author.avatar, 'url'):
            return settings.DOMAIN_NAME + obj.author.avatar.url
        else:
            return None

class TaskSerializer(serializers.ModelSerializer):
    assignee = MNUserSerializer(source='assignees', many=True, read_only=True)
    labels = LabelSerializer(many=True, read_only=True)
    reporter = MNUserSerializer()
    status = serializers.CharField(source='column.title')
    comments = MNCommentSerializer(
        source='task_comments', many=True, read_only=True
    )
    id = serializers.CharField()
    attachments = serializers.SerializerMethodField()

    class Meta:
        model = Task
        exclude = ('assignees',)

    def get_attachments(self, obj):
        if obj.attachments and hasattr(obj.attachments, 'url'):
            return [{'id': obj.id, 'url': settings.DOMAIN_NAME + obj.attachments.url}]
        else:
            return []

    def create(self, validated_data):
        assignees_data = validated_data.pop('assignees')
        instance = Task.objects.create(**validated_data)
        instance.assignees.set(assignees_data)
        return instance

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['labels'] = [
            label['title'] for label in representation['labels']
        ]
        representation['due'] = []

        start_date_str = representation.get('start_date')
        if start_date_str:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
            start_timestamp = int(start_date.timestamp() * 1000)
            representation['due'].append(start_timestamp)

        end_date_str = representation.get('end_date')
        if end_date_str:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
            end_timestamp = int(end_date.timestamp() * 1000)
            representation['due'].append(end_timestamp)

        return representation


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'

    def create(self, validated_data):
        author = self.context['request'].user
        validated_data['author'] = author
        return super().create(validated_data)
