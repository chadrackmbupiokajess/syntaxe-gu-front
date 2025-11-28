from rest_framework import serializers
from .models import Message
from django.contrib.auth import get_user_model

User = get_user_model()

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'sender', 'text', 'timestamp']
        read_only_fields = ['id', 'timestamp', 'sender']

    def get_sender(self, obj):
        return f"{obj.sender.first_name} {obj.sender.last_name}".strip()

    def create(self, validated_data):
        request = self.context['request']
        course = self.context['course']
        auditorium = self.context['auditorium']
        
        message = Message.objects.create(
            sender=request.user,
            course=course,
            auditorium=auditorium,
            text=validated_data['text']
        )
        return message
