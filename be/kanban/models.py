from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import m2m_changed, post_save
from django.dispatch import receiver
from be.utils import send_task_email

class User(AbstractUser):
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    teams = models.ManyToManyField("kanban.Team", related_name="team_users", blank=True)
    
    class Meta:
        verbose_name_plural = "Kullanıcılar"

    def __str__(self):
        return self.username


class Priority(models.TextChoices):
    LOW = 'low', 'Düşük'
    MEDIUM = 'medium', 'Orta'
    HIGH = 'high', 'Yüksek'


class Column(models.Model):
    title = models.CharField(max_length=100)
    priority = models.PositiveSmallIntegerField()

    def __str__(self):
        return self.title


class Team(models.Model):
    name = models.CharField(max_length=100, unique=True)
    members = models.ManyToManyField(User, related_name="user_teams")

    def __str__(self):
        return self.name


class Label(models.Model):
    name = models.CharField(max_length=50, unique=True)
    
    def __str__(self):
        return self.name


class Task(models.Model):
    reporter = models.ForeignKey(User, related_name='reported_tasks', on_delete=models.CASCADE)
    assignees = models.ManyToManyField(User, related_name='assigned_tasks')
    column = models.ForeignKey(Column, related_name='tasks', on_delete=models.CASCADE, null=True)
    name = models.CharField(max_length=128, null=True)
    team = models.ForeignKey(Team, related_name="tasks", on_delete=models.CASCADE, null=True)
    labels = models.ManyToManyField(Label, related_name='tasks', blank=True)
    comments = models.ManyToManyField(User, related_name='comments_task', blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    create_time = models.DateTimeField(auto_now_add=True)
    priority = models.TextField(choices=Priority.choices)
    description = models.TextField(null=True, blank=True)
    attachments = models.FileField(upload_to='attachments/', blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f'{self.name} by {self.reporter.username}'


class TaskHistory(models.Model):
    task = models.ForeignKey(Task, related_name="history", on_delete=models.CASCADE)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    change_description = models.TextField()
    change_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"History for {self.task.name} by {self.changed_by.username}"


class Invitation(models.Model):
    email = models.EmailField()
    team = models.ForeignKey(Team, related_name="invitations", on_delete=models.CASCADE)
    invited_by = models.ForeignKey(User, related_name="sent_invitations", on_delete=models.CASCADE)
    accepted = models.BooleanField(default=False)
    sent_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.email} invited to {self.team.name} by {self.invited_by.username}'


# Helper function to send task update emails
def send_task_email_notification(instance, subject, message, recipient_list):
    if recipient_list:
        send_task_email(instance, subject, message, recipient_list)
        TaskHistory.objects.create(
            task=instance,
            changed_by=instance.reporter,
            change_description=f"Task updated by {instance.reporter.username}"
        )


@receiver(post_save, sender=Task)
def send_task_update_email(sender, instance, created, **kwargs):
    if not created and not kwargs.get('raw', False) and not hasattr(instance, '_email_sent'):
        subject = f"{instance.name} İsimli Görev İçin Güncelleme Geldii"
        message = f"{instance.name} İsimli Görevini İş Yöneticisi Güncellemiş Bi Kontrol Ett."
        recipient_list = [assignee.email for assignee in instance.assignees.all()]
        send_task_email_notification(instance, subject, message, recipient_list)
        instance._email_sent = True


@receiver(m2m_changed, sender=Task.assignees.through)
def send_task_update_email_on_change(sender, instance, action, **kwargs):
    if action in ["post_add", "post_remove", "post_clear"] and not hasattr(instance, 'email_sent'):
        subject = f"{instance.name} Göreviniz Vaaarr."
        message = f"{instance.name} İsimli Görevi Size Vermişler. Allah Kolaylık Versin."
        recipient_list = [assignee.email for assignee in instance.assignees.all()]
        send_task_email_notification(instance, subject, message, recipient_list)
        instance.email_sent = True


class Comment(models.Model):
    task = models.ForeignKey(Task, related_name='task_comments', on_delete=models.CASCADE, null=True)
    author = models.ForeignKey(User, related_name='comments', on_delete=models.CASCADE, null=True)
    content = models.TextField()
    create_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Comment by {self.author.username} on {self.task.name}'


@receiver(post_save, sender=Comment)
def send_comment_notification(sender, instance, created, **kwargs):
    if created:
        task = instance.task
        reporter = task.reporter
        assignees = task.assignees.all()
        comment_author = instance.author

        recipient_list = [user.email for user in (set([reporter] + list(assignees)) - {comment_author})]

        if recipient_list:
            subject = f"{task.name} Görevine Yeni Bir Yorum Eklendi"
            message = f"{comment_author.username} adlı kullanıcı {task.name} görevine yeni bir yorum ekledi: {instance.content}"

            send_task_email(task, subject, message, recipient_list, comment=instance)
        
        TaskHistory.objects.create(
            task=task,
            changed_by=instance.author,
            change_description=f"Comment added by {instance.author.username}"
        )
