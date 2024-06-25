from django.db import models
from account.models import User
from django.db.models.signals import m2m_changed, post_save
from django.dispatch import receiver
from inupmt_be.utils import send_task_email

class Priority(models.TextChoices):
    LOW = 'low', 'Düşük'
    MEDIUM = 'medium', 'Orta'
    HIGH = 'high', 'Yüksek'

class Column(models.Model):
    title = models.CharField(max_length=100)
    priority = models.PositiveSmallIntegerField()

    def __str__(self):
        return self.title

class Labels(models.Model):
    title = models.CharField(max_length=100)

    def __str__(self):
        return f'{self.title}'

class Task(models.Model):
    reporter = models.ForeignKey(User, related_name='reported_tasks', on_delete=models.CASCADE)
    assignees = models.ManyToManyField(User, related_name='assigned_tasks')
    column = models.ForeignKey(Column, related_name='tasks', on_delete=models.CASCADE, null=True)
    name = models.CharField(null=True, max_length=128)
    labels = models.ManyToManyField(Labels, related_name='labels_task', blank=True)
    comments = models.ManyToManyField(User, related_name='comments_task', blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    create_time = models.DateTimeField(auto_now_add=True)
    priority = models.TextField(choices=Priority.choices)
    description = models.TextField(null=True, blank=True)
    attachments = models.FileField(upload_to='attachments/', blank=True, null=True)
    
    def __str__(self):
        return f'{self.reporter} - {self.name}'
    
#     def print_task_info(self):
#         assignee_emails = ", ".join(assignee.email for assignee in self.assignees.all())
#         print(f'Task Information:')
#         print(f'Reporter: {self.reporter}')
#         print(f'Assignees: {assignee_emails}')
#         print(f'Column: {self.column}')
#         print(f'Name: {self.name}')
#         print(f'Labels: {", ".join(str(label) for label in self.labels.all())}')
#         print(f'Start Date: {self.start_date}')
#         print(f'End Date: {self.end_date}')
#         print(f'Priority: {self.priority}')
#         print(f'Description: {self.description}')

# @receiver(m2m_changed, sender=Task.assignees.through)
# @receiver(m2m_changed, sender=Task.labels.through)
# def print_task_info_on_change(sender, instance, action, **kwargs):
#     if action in ["post_add", "post_remove", "post_clear"]:
#         if not hasattr(instance, 'print_info_triggered'):
#             instance.print_task_info()
#             instance.print_info_triggered = True
#         else:
#             del instance.print_info_triggered

@receiver(post_save, sender=Task)
def send_task_update_email(sender, instance, created, update_fields=None, **kwargs):
    if not created and not kwargs.get('raw', False) and update_fields is None:
        if not hasattr(instance, '_email_sent'):
            subject = "{} İsimli Görev İçin Güncelleme Geldii".format(instance.name)
            message = "{} İsimli Görevini İş Yöneticisi Güncellemiş Bi Kontrol Ett.".format(instance.name)
            recipient_list = [assignee.email for assignee in instance.assignees.all()]
            send_task_email(instance, subject, message, recipient_list)
            instance._email_sent = True

@receiver(m2m_changed, sender=Task.assignees.through)
@receiver(m2m_changed, sender=Task.labels.through)
def send_task_update_email_on_change(sender, instance, action, **kwargs):
    if action in ["post_add", "post_remove", "post_clear"]:
        if not hasattr(instance, 'email_sent'):
            subject = "{} Göreviniz Vaaarr.".format(instance.name)
            message = "{} İsimli Görevi Size Vermişler. Allah Kolaylık Versin.".format(instance.name)
            recipient_list = [assignee.email for assignee in instance.assignees.all()]
            send_task_email(instance, subject, message, recipient_list)
            instance.email_sent = True

class Comment(models.Model):
    task = models.ForeignKey(Task, related_name='task_comments', on_delete=models.CASCADE, null=True)
    author = models.ForeignKey(User, related_name='comments', on_delete=models.CASCADE, null=True)
    content = models.TextField()
    create_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.author} - {self.task}'

@receiver(post_save, sender=Comment)
def send_comment_notification(sender, instance, created, **kwargs):
    if created:
        task = instance.task
        reporter = task.reporter
        assignees = task.assignees.all()
        comment_author = instance.author

        recipient_list = [user.email for user in (set([reporter] + list(assignees)) - set([comment_author]))]

        if recipient_list:
            subject = f"{task.name} Görevine Yeni Bir Yorum Eklendi"
            message = f"{comment_author} adlı kullanıcı {task.name} görevine yeni bir yorum ekledi: {instance.content}"

            send_task_email(task, subject, message, recipient_list, comment=instance)
