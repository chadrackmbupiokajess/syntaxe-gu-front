from rest_framework import serializers
from django.contrib.auth.models import User

from .models import Course, Enrollment


class CourseSerializer(serializers.ModelSerializer):
    teacher = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = Course
        fields = ["id", "title", "description", "teacher", "created_at"]


class EnrollmentSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all())

    class Meta:
        model = Enrollment
        fields = ["id", "student", "course", "joined_at"]
