from django.contrib import admin
from .models import UserMessage

@admin.register(UserMessage)
class UserMessageAdmin(admin.ModelAdmin):
    list_display = ('course', 'user', 'text', 'created_at')
    list_filter = ('course', 'user', 'created_at')
    search_fields = ('text', 'user__username')
