from rest_framework import generics
from .models import TPTD
from .serializers import TPTDSerializer

class TPTDListCreateAPIView(generics.ListCreateAPIView):
    queryset = TPTD.objects.all()
    serializer_class = TPTDSerializer

class TPTDRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TPTD.objects.all()
    serializer_class = TPTDSerializer
