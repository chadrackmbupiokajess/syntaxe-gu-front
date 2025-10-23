from django.contrib import admin
from .models import Notification, ActivityLog


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('target_user', 'notification_type', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', 'target_user')
    search_fields = ('target_user__username', 'message')
    date_hierarchy = 'created_at'


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('actor', 'action_type', 'timestamp')
    list_filter = ('action_type', 'actor')
    search_fields = ('actor__username', 'details')
    date_hierarchy = 'timestamp'

    def has_add_permission(self, request):
        # Personne ne peut ajouter de journaux manuellement
        return False

    def has_change_permission(self, request, obj=None):
        # Les journaux sont immuables
        return False
