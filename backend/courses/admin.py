from django.contrib import admin
from .models import Course, Enrollment


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "teacher", "created_at")
    list_select_related = ("teacher",)
    search_fields = ("title", "teacher__username")


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ("id", "student", "course", "joined_at")
    list_select_related = ("student", "course")
    search_fields = ("student__username", "course__title")
