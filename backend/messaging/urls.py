from django.urls import path
from .views import message_list

urlpatterns = [
    path('courses/<str:course_code>/auditoriums/<int:auditorium_id>/messages/', message_list, name='message_list'),
]
