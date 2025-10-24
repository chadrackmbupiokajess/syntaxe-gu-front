from django.urls import path
from .views import TPTDListCreateAPIView, TPTDRetrieveUpdateDestroyAPIView

urlpatterns = [
    path('tptd/', TPTDListCreateAPIView.as_view(), name='tptd-list-create'),
    path('tptd/<int:pk>/', TPTDRetrieveUpdateDestroyAPIView.as_view(), name='tptd-retrieve-update-destroy'),
]
