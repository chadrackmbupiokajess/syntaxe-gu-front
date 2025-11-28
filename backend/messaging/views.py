from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Message
from .serializers import MessageSerializer
from academics.models import Course, Auditoire

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def message_list(request, course_code, auditorium_id):
    """
    List all messages for a given course and auditorium, or create a new message.
    """
    try:
        course = Course.objects.get(code=course_code)
        auditorium = Auditoire.objects.get(id=auditorium_id)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
    except Auditoire.DoesNotExist:
        return Response({'error': 'Auditorium not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        messages = Message.objects.filter(course=course, auditorium=auditorium)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = MessageSerializer(data=request.data, context={'request': request, 'course': course, 'auditorium': auditorium})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
