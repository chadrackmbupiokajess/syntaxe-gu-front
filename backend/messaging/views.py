from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import permissions
from django.apps import apps
from .models import UserMessage

Course = apps.get_model('academics', 'Course')

@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def course_chat_messages(request, course_code: str):
    try:
        course = Course.objects.get(code=course_code)
    except Course.DoesNotExist:
        return Response({"detail": "Cours non trouvé."}, status=404)

    if request.method == 'GET':
        messages = UserMessage.objects.filter(course=course).select_related('user').order_by('created_at')
        data = [{
            "id": msg.id,
            "user": msg.user.username,
            "text": msg.text,
            "at": msg.created_at.isoformat(),
        } for msg in messages]
        return Response(data)

    elif request.method == 'POST':
        text = request.data.get('text', '').strip()
        if not text:
            return Response({"detail": "Le message ne peut pas être vide."}, status=400)
        
        msg = UserMessage.objects.create(course=course, user=request.user, text=text)
        
        return Response({
            "id": msg.id,
            "user": request.user.username,
            "text": msg.text,
            "at": msg.created_at.isoformat(),
        }, status=201)
