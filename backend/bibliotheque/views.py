from django.http import JsonResponse

def kpi_view(request):
    data = {
        'availableBooks': 1250,
        'borrowedBooks': 300,
        'activeMembers': 450,
        'overdueReturns': 15,
    }
    return JsonResponse(data)

def recent_activity_view(request):
    data = []
    return JsonResponse(data, safe=False)

def overdue_books_view(request):
    data = []
    return JsonResponse(data, safe=False)
