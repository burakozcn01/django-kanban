from django.core.mail import send_mail
from django.utils.html import strip_tags
from django.conf import settings


def send_task_email(task, subject, message, recipient_list, comment=None):
    if comment:
        html_message = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>{subject}</title>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        background-color: #222;
                        color: #eee;
                        padding: 20px;
                    }}
                    h1 {{
                        color: #64a861;
                    }}
                    ul {{
                        list-style-type: none;
                        padding: 0;
                    }}
                    li {{
                        margin-bottom: 10px;
                    }}
                    li strong {{
                        color: #64a861;
                    }}
                    .logo {{
                        display: block;
                        margin: 20px auto;
                        max-width: 200px;
                    }}
                </style>
            </head>
            <body>
                <h1>{subject}</h1>
                <p><strong>Görev Bilgileri:</strong></p>
                <ul>
                    <li><strong>İş Yöneticisi:</strong> {reporter_name} ({reporter_email})</li>
                    <li><strong>Görev Durumu:</strong> {column}</li>
                    <li><strong>Görevin Adı:</strong> {name}</li>
                    <li><strong>Yorum Yapan:</strong> {comment_author_name} ({comment_author_email})</li>
                    <li><strong>Yorum İçeriği:</strong> {comment_content}</li>
                </ul>
                <img src="logo_url" alt="Logo" class="logo">
            </body>
            </html>
        """.format(
            subject=subject,
            message=message,
            reporter_name=task.reporter.username,
            reporter_email=task.reporter.email,
            assignees=", ".join(f"{assignee.username} ({assignee.email})" for assignee in task.assignees.all()),
            column=task.column.title if task.column else "N/A",
            name=task.name,
            start_date=task.start_date.strftime("%Y-%m-%d") if task.start_date else "N/A",
            end_date=task.end_date.strftime("%Y-%m-%d") if task.end_date else "N/A",
            priority=task.priority,
            description=task.description if task.description else "N/A",
            comment_author_name=comment.author.username,
            comment_author_email=comment.author.email,
            comment_content=comment.content
        )
    else:
        html_message = """"
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>{subject}</title>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        background-color: #222;
                        color: #eee;
                        padding: 20px;
                    }}
                    h1 {{
                        color: #64a861;
                    }}
                    ul {{
                        list-style-type: none;
                        padding: 0;
                    }}
                    li {{
                        margin-bottom: 10px;
                    }}
                    li strong {{
                        color: #64a861;
                    }}
                    .logo {{
                        display: block;
                        margin: 20px auto;
                        max-width: 200px;
                    }}
                </style>
            </head>
            <body>
                <h1>{subject}</h1>
                <p>{message}</p>
                <p><strong>Görev Bilgileri:</strong></p>
                <ul>
                    <li><strong>İş Yöneticisi:</strong> {reporter_name} ({reporter_email})</li>
                    <li><strong>Görev Durumu:</strong> {column}</li>
                    <li><strong>Görevin Adı:</strong> {name}</li>
                    <li><strong>Önem Derecesi:</strong> {priority}</li>
                    <li><strong>Görev Açıklaması:</strong> {description}</li>
                </ul>
                <img src="logo_url" alt="Logo" class="logo">
            </body>
            </html>
        """.format(
            subject=subject,
            message=message,
            reporter_name=task.reporter.username,
            reporter_email=task.reporter.email,
            assignees=", ".join(f"{assignee.username} ({assignee.email})" for assignee in task.assignees.all()),
            column=task.column.title if task.column else "N/A",
            name=task.name,
            start_date=task.start_date.strftime("%Y-%m-%d") if task.start_date else "N/A",
            end_date=task.end_date.strftime("%Y-%m-%d") if task.end_date else "N/A",
            priority=task.priority,
            description=task.description if task.description else "N/A"
        )

    plain_message = strip_tags(html_message)

    try:
        print("E-posta gönderme işlemi başladı.")
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=recipient_list,
            html_message=html_message,
        )
        print("E-posta gönderme işlemi başarıyla tamamlandı.")

    except Exception as e:
        print(f"E-posta gönderilirken bir hata oluştu: {e}")
