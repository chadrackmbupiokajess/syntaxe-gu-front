from django.db import models
from django.conf import settings

class UserMessage(models.Model):
    course = models.ForeignKey('academics.Course', on_delete=models.CASCADE, related_name='user_messages')
    auditorium = models.ForeignKey('academics.Auditoire', on_delete=models.CASCADE, related_name='auditorium_messages', null=True, blank=True) # Corrected model name
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'Message from {self.user.get_full_name()} in {self.course.name} ({self.auditorium.name if self.auditorium else "No Auditorium"}) at {self.created_at.strftime("%Y-%m-%d %H:%M")}'
