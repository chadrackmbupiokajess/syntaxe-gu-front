from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions
from rest_framework.response import Response
from django.conf import settings


def _safe_user_id(u) -> int:
    try:
        uid = getattr(u, "id", None)
        if isinstance(uid, int) and uid is not None:
            return uid
    except Exception:
        pass
    return 0


def health(request):
    return JsonResponse({"status": "ok"})


DEV_PERMS = [permissions.AllowAny] if getattr(settings, "DEBUG", False) else [permissions.IsAuthenticated]


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def auth_me(request):
    user = request.user
    # Roles utilisateur (via related_name user_roles)
    try:
        roles = list(user.user_roles.select_related("role").values_list("role__name", flat=True))
    except Exception:
        roles = []
    return Response({
        "id": user.id,
        "username": user.username,
        "email": getattr(user, "email", ""),
        "roles": roles,
    })


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def student_summary(request):
    data = {
        "program": "Informatique",
        "semester": "S1",
        "creditsEarned": 30,
        "gpa": 14.8,
        "nextEvents": [
            {"title": "Cours d'Algorithmes", "date": "2025-11-05"},
            {"title": "TP Réseaux", "date": "2025-11-07"},
            {"title": "Examen Base de Données", "date": "2025-11-20"},
        ],
    }
    return Response(data)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def student_meta(request):
    u = request.user
    uid = _safe_user_id(u)
    data = {
        "auditorium": "B12",
        "session": "2024-2025",
        "department": "Informatique",
        "faculty": "Sciences",
        "matricule": f"STU-{uid:05d}",
        "email": getattr(u, "email", ""),
    }
    return Response(data)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def student_grades_recent(request):
    grades = [
        {"course": "Algo", "grade": 16},
        {"course": "BD", "grade": 15},
        {"course": "Web", "grade": 12},
        {"course": "Réseaux", "grade": 13},
        {"course": "Maths", "grade": 17},
    ]
    return Response(grades)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def student_profile(request):
    u = request.user
    uid = _safe_user_id(u)
    data = {
        "avatar": f"https://i.pravatar.cc/128?u={uid}",
        "name": getattr(u, "username", "Invité"),
        "matricule": f"STU-{uid:05d}",
        "email": getattr(u, "email", ""),
        "phone": "+243 000 000 000",
        "address": "Campus Universitaire",
        "auditorium": "B12",
        "session": "2024-2025",
        "department": "Informatique",
        "faculty": "Sciences",
    }
    return Response(data)


# --- Vues Placeholder mises à jour ---

@api_view(["GET"])
@permission_classes(DEV_PERMS)
def assistant_summary(request):
    # Structure de données corrigée pour correspondre au frontend
    data = {
        "courses": 4,
        "activeTPTD": 3,
        "activeQuizzes": 2,
        "toGrade": 15,
        "auditoriums": [
            {"code": "G2 INFO", "students": 128},
            {"code": "G3 INFO", "students": 94},
            {"code": "L1 INFO", "students": 210},
        ]
    }
    return Response(data)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def auditoriums_assistant_my(request):
    # Renvoie un tableau vide pour éviter les erreurs de .map()
    return Response([])


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def tptd_my(request):
    return Response([])


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def quizzes_my(request):
    return Response([])


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def assistant_tograde(request):
    return Response([])


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def student_notifications(request):
    return Response([])


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def teacher_profile(request):
    return Response({})


# ---- Endpoints manquants (placeholders) pour éviter les 404 côté frontend ----

@api_view(["GET"])
@permission_classes(DEV_PERMS)
def quizzes_student_available(request):
    # Liste des quiz disponibles pour l'étudiant
    return Response([])


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def tptd_student_available(request):
    # Travaux pratiques / TD disponibles pour l'étudiant
    return Response([])


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def quizzes_student_my_attempts(request):
    # Tentatives de quiz de l'étudiant
    return Response([])


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def tptd_student_my_submissions(request):
    # Soumissions TPTD de l'étudiant
    return Response([])


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def student_courses(request):
    # Cours de l'étudiant
    return Response([])


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def student_calendar(request):
    # Evénements calendrier
    return Response([])


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def library_catalog(request):
    # Catalogue de la bibliothèque
    return Response([])


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def library_myloans(request):
    # Emprunts de l'utilisateur
    return Response([])


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def student_grades_all(request):
    # Toutes les notes de l'étudiant
    return Response([])


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def student_documents(request):
    # Documents de l'étudiant
    return Response([])


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def payments_mine(request):
    # Paiements de l'utilisateur
    return Response([])
