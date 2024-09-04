from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate
from .models import Comment, Task, Column, User, Invitation, Team, Label, TaskHistory, Priority
from rest_framework.authtoken.models import Token
from .serializers import CommentSerializer, TaskSerializer, UserSerializer, UserProfileSerializer, LabelSerializer, TaskHistorySerializer
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.http import JsonResponse
from django.core.mail import send_mail
from django.conf import settings
from datetime import date, timedelta
from django.db.models import Count, Q
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import RefreshToken


# Helper Function
def get_user_teams(user):
    """Helper function to retrieve the teams of the user."""
    return user.teams.all()


def get_first_column():
    """Helper function to retrieve the first column based on priority."""
    return Column.objects.order_by('priority').first()


# Views

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        if not all([username, email, password]):
            return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({"error": "Email is already in use."}, status=status.HTTP_400_BAD_REQUEST)

        User.objects.create_user(username=username, email=email, password=password)
        return Response({"message": "User registered successfully."}, status=status.HTTP_201_CREATED)


class UsernameAuthView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')

        if not all([username, password]):
            return Response({'error': 'Kullanıcı adı ve şifre gereklidir.'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)
        if user is None:
            return Response({'error': 'Geçersiz kullanıcı adı veya şifre.'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        first_column = get_first_column()
        data['column'] = data.get('column', first_column.id if first_column else None)
        data['reporter'] = request.user.id

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        column_id = request.data.get('column')
        if column_id:
            instance.column = get_object_or_404(Column, id=column_id)

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        user_teams = get_user_teams(request.user)
        tasks = Task.objects.filter(team__in=user_teams).select_related('column')

        serialized_data = TaskSerializer(tasks, many=True).data

        custom_response = {
            'board': {'columns': {}, 'ordered': [], 'tasks': {}}
        }

        columns_ordered_by_priority = Column.objects.order_by('priority')
        for column in columns_ordered_by_priority:
            custom_response['board']['columns'][column.id] = {
                'id': str(column.id),
                'name': column.title,
                'taskIds': [],
            }
            custom_response['board']['ordered'].append(str(column.id))

        for task_data in serialized_data:
            task_id = task_data['id']
            column_id = task_data['column']
            task_team_id = task_data['team']['id']

            if task_team_id in [team.id for team in user_teams]:
                custom_response['board']['columns'][column_id]['taskIds'].append(str(task_id))
                custom_response['board']['tasks'][task_id] = task_data

        return JsonResponse(custom_response)

    @action(detail=False, methods=['get'])
    def choices(self, request):
        data = {
            'priorities': [{'value': choice[0], 'label': choice[1]} for choice in Priority.choices],
            'columns': [{'id': column.id, 'title': column.title} for column in Column.objects.all()],
            'teams': [{'id': team.id, 'name': team.name} for team in Team.objects.all()],
            'labels': [{'id': label.id, 'name': label.name} for label in Label.objects.all()],
            'users': [{'id': user.id, 'username': user.username} for user in User.objects.all()],
        }
        return Response(data)

    def reorder(self, request, *args, **kwargs):
        task_orders = request.data.get('task_orders', [])
        for order, task_id in enumerate(task_orders):
            task = Task.objects.filter(id=task_id).first()
            if task:
                task.order = order
                task.save()
        return Response({"detail": "Tasks reordered successfully."}, status=status.HTTP_200_OK)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer


class LabelViewSet(viewsets.ModelViewSet):
    queryset = Label.objects.all()
    serializer_class = LabelSerializer
    permission_classes = [IsAuthenticated]


class TaskHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TaskHistory.objects.all()
    serializer_class = TaskHistorySerializer
    permission_classes = [IsAuthenticated]


class StatisticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user_teams = get_user_teams(request.user)

        status_distribution = Task.objects.filter(team__in=user_teams).values('column__title').annotate(count=Count('id')).order_by('-count')
        priority_distribution = Task.objects.filter(team__in=user_teams).values('priority').annotate(count=Count('id')).order_by('-count')
        last_30_days = date.today() - timedelta(days=30)
        completed_tasks = Task.objects.filter(team__in=user_teams, column__title='Completed', end_date__gte=last_30_days).count()
        tasks_per_user = Task.objects.filter(team__in=user_teams).values('assignees__username').annotate(count=Count('id')).order_by('-count')
        tasks_per_team = Task.objects.filter(team__in=user_teams).values('team__name').annotate(count=Count('id')).order_by('-count')

        data = {
            'status_distribution': list(status_distribution),
            'priority_distribution': list(priority_distribution),
            'completed_tasks_last_30_days': completed_tasks,
            'tasks_per_user': list(tasks_per_user),
            'tasks_per_team': list(tasks_per_team),
        }
        return Response(data, status=status.HTTP_200_OK)


class GanttChartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user_teams = get_user_teams(request.user)
        tasks = Task.objects.filter(team__in=user_teams).select_related('column')

        task_data = [
            {
                "id": task.id,
                "name": task.name,
                "start": task.start_date.isoformat() if task.start_date else None,
                "end": task.end_date.isoformat() if task.end_date else None,
                "status": task.column.title if task.column else None,
                "assignees": [assignee.username for assignee in task.assignees.all()],
                "team": task.team.name if task.team else None
            }
            for task in tasks
        ]

        return Response(task_data, status=status.HTTP_200_OK)


class CalendarView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user_teams = get_user_teams(request.user)
        tasks = Task.objects.filter(team__in=user_teams).exclude(start_date__isnull=True, end_date__isnull=True)

        calendar_data = [
            {
                "title": task.name,
                "start": task.start_date.isoformat(),
                "end": (task.end_date + timedelta(days=1)).isoformat(),
                "description": task.description,
                "team": task.team.name if task.team else None
            }
            for task in tasks
        ]

        return Response(calendar_data, status=status.HTTP_200_OK)


class InvitationViewSet(viewsets.ModelViewSet):
    queryset = Invitation.objects.all()
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        email = request.data.get('email')
        team_id = request.data.get('team_id')
        team = get_object_or_404(Team, id=team_id)
        invited_by = request.user

        if Invitation.objects.filter(email=email, team=team).exists():
            return Response({"error": "This email has already been invited to the team."}, status=status.HTTP_400_BAD_REQUEST)

        invitation = Invitation.objects.create(email=email, team=team, invited_by=invited_by)

        subject = f"Invitation to join {team.name} on Kanban"
        message = f"You have been invited to join the team {team.name} on Kanban. Click the link below to accept the invitation:\n\n{settings.DOMAIN_NAME}/accept-invitation/{invitation.id}/"
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])

        return Response({"message": "Invitation sent successfully."}, status=status.HTTP_201_CREATED)

    def list(self, request, *args, **kwargs):
        invitations = Invitation.objects.filter(invited_by=request.user)
        response_data = [{
            "id": invitation.id,
            "email": invitation.email,
            "team": invitation.team.name,
            "accepted": invitation.accepted,
            "sent_at": invitation.sent_at
        } for invitation in invitations]

        return Response(response_data)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def post(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated successfully."})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AcceptInvitationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, invitation_id, *args, **kwargs):
        invitation = get_object_or_404(Invitation, id=invitation_id)
        if invitation.accepted:
            return Response({"error": "This invitation has already been accepted."}, status=status.HTTP_400_BAD_REQUEST)

        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')

        if not all([first_name, last_name]):
            return Response({"error": "First name and last name are required."}, status=status.HTTP_400_BAD_REQUEST)

        user, created = User.objects.get_or_create(email=invitation.email)
        if created:
            temp_password = User.objects.make_random_password()
            user.set_password(temp_password)
            user.first_name = first_name
            user.last_name = last_name
            user.save()

            send_mail(
                "Your Temporary Password",
                f"Your account has been created. Your temporary password is: {temp_password}",
                settings.DEFAULT_FROM_EMAIL,
                [invitation.email]
            )
        else:
            user.first_name = first_name
            user.last_name = last_name
            user.save()

        invitation.team.members.add(user)
        invitation.accepted = True
        invitation.save()

        return Response({"message": "Invitation accepted successfully."}, status=status.HTTP_200_OK)
