from rest_framework import serializers
from .models import TPTD

class TPTDSerializer(serializers.ModelSerializer):
    class Meta:
        model = TPTD
        fields = '__all__'
