from django.db import models
from django.contrib.auth import get_user_model
from academics.models import Course, Auditoire

User = get_user_model()

class Message(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='chat_messages')
    auditorium = models.ForeignKey(Auditoire, on_delete=models.CASCADE, related_name='chat_messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Message from {self.sender} in {self.course.name} ({self.auditorium.name}) at {self.timestamp}'

    class Meta:
        ordering = ['timestamp']
