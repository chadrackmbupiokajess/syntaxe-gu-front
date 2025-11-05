from django.urls import path
from .views import kpi_view, recent_activity_view, overdue_books_view

urlpatterns = [
    path('kpi/', kpi_view, name='bibliotheque_kpi'),
    path('recent-activity/', recent_activity_view, name='bibliotheque_recent_activity'),
    path('overdue-books/', overdue_books_view, name='bibliotheque_overdue_books'),
]
