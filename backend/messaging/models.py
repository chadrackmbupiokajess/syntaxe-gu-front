from django.db import models
from django.conf import settings

class UserMessage(models.Model):
    course = models.ForeignKey('academics.Course', on_delete=models.CASCADE, related_name='user_messages')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'Message from {self.user.username} in {self.course.name} at {self.created_at.strftime("%Y-%m-%d %H:%M")}' 
