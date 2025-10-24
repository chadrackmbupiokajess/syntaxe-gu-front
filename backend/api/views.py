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


# ---- Endpoints PDG (placeholders) ----

@api_view(["GET"])
@permission_classes(DEV_PERMS)
def pdg_summary(request):
    data = {
        "students": 3250,
        "staff": 420,
        "revenueYTD": 1245000,
        "satisfaction": 87,
    }
    return Response(data)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def pdg_activities(request):
    rows = [
        {"date": "2025-10-10", "type": "Conseil", "intitule": "Conseil d'administration", "statut": "terminé"},
        {"date": "2025-10-20", "type": "Budget", "intitule": "Arbitrage budget 2026", "statut": "en cours"},
        {"date": "2025-11-02", "type": "Partenariat", "intitule": "Signature MOU avec Entreprise X", "statut": "planifié"},
    ]
    return Response(rows)


# ---- Endpoints DG (placeholders) ----

@api_view(["GET"])
@permission_classes(DEV_PERMS)
def dg_summary(request):
    data = {
        "decisionsPending": 6,
        "projects": 14,
        "budgetUsed": 62,
        "satisfaction": 82,
    }
    return Response(data)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def dg_actions(request):
    rows = [
        {"id": 1, "date": "2025-10-12", "domaine": "Infrastructures", "action": "Validation chantier Bât. C", "statut": "en cours"},
        {"id": 2, "date": "2025-10-18", "domaine": "RH", "action": "Lancement recrutement assistants", "statut": "planifié"},
        {"id": 3, "date": "2025-10-25", "domaine": "Finances", "action": "Ajustement budget Q4", "statut": "terminé"},
    ]
    return Response(rows)


# ---- Endpoints SGA (placeholders) ----

@api_view(["GET"])
@permission_classes(DEV_PERMS)
def sga_summary(request):
    data = {
        "enrollmentsPending": 23,
        "auditoriumsManaged": 18,
    }
    return Response(data)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def sga_demandes(request):
    rows = [
        {"id": 101, "type": "Attestation", "etudiant": "STU-00023", "statut": "en attente"},
        {"id": 102, "type": "Changement auditoire", "etudiant": "STU-00452", "statut": "validé"},
        {"id": 103, "type": "Duplicata carte", "etudiant": "STU-01234", "statut": "en attente"},
    ]
    return Response(rows)


# ---- Endpoints SGAD (placeholders)

@api_view(["GET"])
@permission_classes(DEV_PERMS)
def sgad_summary(request):
    data = {
        "payrollActions": 5,
        "financeReports": 12,
    }
    return Response(data)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def sgad_paie(request):
    rows = [
        {"id": 1, "agent": "AG-001", "mois": "09/2025", "statut": "en cours"},
        {"id": 2, "agent": "AG-021", "mois": "09/2025", "statut": "validé"},
        {"id": 3, "agent": "AG-034", "mois": "09/2025", "statut": "en attente"},
    ]
    return Response(rows)


# ---- Endpoints Section (placeholders)

@api_view(["GET"])
@permission_classes(DEV_PERMS)
def section_summary(request):
    data = {
        "sections": 6,
        "heads": 6,
        "kpis": {"fillRate": 78},
    }
    return Response(data)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def section_list(request):
    rows = [
        {"code": "G1 INFO", "intitule": "Informatique 1", "effectif": 210},
        {"code": "G2 INFO", "intitule": "Informatique 2", "effectif": 190},
        {"code": "G3 INFO", "intitule": "Informatique 3", "effectif": 160},
    ]
    return Response(rows)


# ---- Endpoints Département (placeholders)

@api_view(["GET"])
@permission_classes(DEV_PERMS)
def department_summary(request):
    data = {
        "departments": 4,
        "courses": 52,
        "auditoriums": 18,
    }
    return Response(data)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def department_list(request):
    rows = [
        {"code": "INFO", "intitule": "Informatique", "chefs": 1},
        {"code": "MATH", "intitule": "Mathématiques", "chefs": 1},
        {"code": "PHY", "intitule": "Physique", "chefs": 1},
    ]
    return Response(rows)


# ---- Endpoints Jury (placeholders)

@api_view(["GET"])
@permission_classes(DEV_PERMS)
def jury_summary(request):
    data = {
        "defensesUpcoming": 8,
        "reportsPending": 12,
    }
    return Response(data)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def jury_defenses(request):
    rows = [
        {"id": 11, "etudiant": "STU-00231", "sujet": "IA et éducation", "date": "2025-11-04", "jury": "A"},
        {"id": 12, "etudiant": "STU-00411", "sujet": "Sécurité réseaux", "date": "2025-11-10", "jury": "B"},
    ]
    return Response(rows)


# ---- Endpoints Apparitorat (placeholders)

@api_view(["GET"])
@permission_classes(DEV_PERMS)
def apparitorat_summary(request):
    data = {
        "attendanceToday": 93,
        "incidents": 2,
    }
    return Response(data)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def apparitorat_presences(request):
    rows = [
        {"id": 1, "date": "2025-10-24", "auditoire": "G2 INFO", "present": 120, "total": 130},
        {"id": 2, "date": "2025-10-24", "auditoire": "G3 INFO", "present": 88, "total": 95},
    ]
    return Response(rows)


# ---- Endpoints Finance/Caisse (placeholders)

@api_view(["GET"])
@permission_classes(DEV_PERMS)
def finance_summary(request):
    data = {
        "paymentsToday": 42,
        "totalToday": 1250000,
        "pendingInvoices": 7,
        "refunds": 1,
    }
    return Response(data)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def finance_operations(request):
    rows = [
        {"id": 1, "date": "2025-10-24", "type": "Paiement", "montant": 25000, "statut": "ok"},
        {"id": 2, "date": "2025-10-24", "type": "Paiement", "montant": 40000, "statut": "ok"},
        {"id": 3, "date": "2025-10-24", "type": "Remboursement", "montant": 5000, "statut": "ok"},
    ]
    return Response(rows)


# ---- Endpoints IT (placeholders)

@api_view(["GET"])
@permission_classes(DEV_PERMS)
def it_summary(request):
    data = {
        "incidentsOpen": 5,
        "deployments": 2,
        "uptime": 99.3,
    }
    return Response(data)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def it_incidents(request):
    rows = [
        {"id": 101, "date": "2025-10-21", "service": "Réseau", "priorite": "haute", "statut": "en cours"},
        {"id": 102, "date": "2025-10-22", "service": "Email", "priorite": "moyenne", "statut": "ouvert"},
    ]
    return Response(rows)


# ---- Endpoints Bibliothèque (placeholders)

@api_view(["GET"])
@permission_classes(DEV_PERMS)
def library_summary(request):
    data = {
        "loansActive": 142,
        "overdue": 17,
        "catalog": 3200,
        "reservations": 28,
    }
    return Response(data)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def library_gestion_reservations(request):
    rows = [
        {"id": 701, "titre": "Algorithmes avancés", "lecteur": "STU-00012", "statut": "en attente"},
        {"id": 702, "titre": "Réseaux informatiques", "lecteur": "STU-00089", "statut": "en attente"},
    ]
    return Response(rows)
