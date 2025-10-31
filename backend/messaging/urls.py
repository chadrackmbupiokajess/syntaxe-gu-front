from django.urls import path
from .views import course_chat_messages

urlpatterns = [
    path('chat/<str:course_code>/<int:auditorium_id>/messages', course_chat_messages, name='course_chat_messages'),
]
