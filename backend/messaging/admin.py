from django.contrib import admin
from .models import Message

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'course', 'auditorium', 'timestamp', 'text')
    list_filter = ('course', 'auditorium', 'sender', 'timestamp')
    search_fields = ('text', 'sender__username', 'course__name')
    date_hierarchy = 'timestamp'
