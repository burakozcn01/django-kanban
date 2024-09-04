from datetime import datetime
from rest_framework import serializers
from .models import Task, Comment, Team, User, Label, TaskHistory
from django.conf import settings

# Global constant for domain name to avoid repetitive code
DOMAIN_NAME = settings.DOMAIN_NAME


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        exclude = ('password',)


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'avatar']


class MNUserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    id = serializers.CharField()

    class Meta:
        model = User
        fields = ('avatar_url', 'username', 'id')

    def get_avatar_url(self, obj):
        """Returns the full URL of the user's avatar if available."""
        return f"{DOMAIN_NAME}{obj.avatar.url}" if obj.avatar and hasattr(obj.avatar, 'url') else None


class MNCommentSerializer(serializers.ModelSerializer):
    message = serializers.CharField(source='content')
    created_at = serializers.DateTimeField(source='create_time')
    message_type = serializers.SerializerMethodField()
    name = serializers.CharField(source='author.username')
    id = serializers.CharField()
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ('message', 'id', 'created_at', 'message_type', 'name', 'avatar_url')

    def get_message_type(self, obj):
        """Returns the type of message, in this case, always 'text'."""
        return 'text'

    def get_avatar_url(self, obj):
        """Returns the full URL of the author's avatar if available."""
        return f"{DOMAIN_NAME}{obj.author.avatar.url}" if obj.author.avatar and hasattr(obj.author.avatar, 'url') else None


class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ('id', 'name')


class TaskHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskHistory
        fields = "__all__"


class LabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Label
        fields = ['id', 'name']


class TaskSerializer(serializers.ModelSerializer):
    assignees = MNUserSerializer(many=True, read_only=True)
    reporter = MNUserSerializer(read_only=True)
    status = serializers.CharField(source='column.title', read_only=True)
    comments = MNCommentSerializer(many=True, read_only=True)
    history = TaskHistorySerializer(many=True, read_only=True)
    team = TeamSerializer(read_only=True)
    labels = LabelSerializer(many=True, read_only=True)
    attachments = serializers.SerializerMethodField()
    start_timestamp = serializers.SerializerMethodField()
    end_timestamp = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = '__all__'

    def get_attachments(self, obj):
        """Returns a list of attachments with full URLs if available."""
        return [{'id': obj.id, 'url': f"{DOMAIN_NAME}{obj.attachments.url}"}] if obj.attachments and hasattr(obj.attachments, 'url') else []

    def get_start_timestamp(self, obj):
        """Returns the start date timestamp in milliseconds."""
        return self._get_timestamp(obj.start_date)

    def get_end_timestamp(self, obj):
        """Returns the end date timestamp in milliseconds."""
        return self._get_timestamp(obj.end_date)

    def _get_timestamp(self, date_obj):
        """Helper method to convert a date to a timestamp in milliseconds."""
        if date_obj:
            try:
                return int(datetime.combine(date_obj, datetime.min.time()).timestamp() * 1000)
            except (ValueError, OSError):
                return None
        return None

    def to_representation(self, instance):
        """Custom representation to include 'due' dates as timestamps."""
        representation = super().to_representation(instance)
        representation['due'] = []

        start_date_str = representation.get('start_date')
        end_date_str = representation.get('end_date')

        if start_date_str:
            self._append_timestamp(representation['due'], start_date_str)

        if end_date_str:
            self._append_timestamp(representation['due'], end_date_str)

        return representation

    def _append_timestamp(self, due_list, date_str):
        """Helper method to parse a date string and append its timestamp to the due list."""
        try:
            date_obj = datetime.strptime(date_str, '%Y-%m-%d')
            due_list.append(int(date_obj.timestamp() * 1000))
        except (ValueError, OSError):
            pass


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'

    def create(self, validated_data):
        """Automatically sets the author of the comment to the current user."""
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)
