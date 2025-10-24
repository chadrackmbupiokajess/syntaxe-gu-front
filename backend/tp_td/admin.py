from django.contrib import admin
from .models import TPTD

@admin.register(TPTD)
class TPTDAdmin(admin.ModelAdmin):
    list_display = ('title', 'due_date', 'created_at', 'updated_at')
    search_fields = ('title', 'description')
    list_filter = ('created_at', 'updated_at', 'due_date')
