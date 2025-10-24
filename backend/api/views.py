from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions
from rest_framework.response import Response
from django.conf import settings
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from datetime import timedelta
from django.apps import apps
StudentProfile = apps.get_model('accounts', 'StudentProfile')
AcademicProfile = apps.get_model('accounts', 'AcademicProfile')
Course = apps.get_model('academics', 'Course')
Auditoire = apps.get_model('academics', 'Auditoire')
Calendrier = apps.get_model('academics', 'Calendrier')
CourseAssignment = apps.get_model('academics', 'CourseAssignment')
CourseMessage = apps.get_model('academics', 'CourseMessage')
Assignment = apps.get_model('evaluations', 'Assignment')
Submission = apps.get_model('evaluations', 'Submission')
Quiz = apps.get_model('evaluations', 'Quiz')


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
def assistant_my_courses(request):
    items = []
    try:
        ap = AcademicProfile.objects.get(user=request.user)
        assignments = CourseAssignment.objects.select_related("course__auditoire__departement").filter(assistant=ap)
        for assign in assignments:
            course = assign.course
            auditoire = course.auditoire
            departement = getattr(auditoire, "departement", None) if auditoire else None
            items.append({
                "id": course.id,
                "title": course.name,
                "auditorium": getattr(auditoire, "name", ""),
                "department": getattr(departement, "name", "") if departement else "",
            })
    except Exception:
        pass
    return Response(items)


@api_view(["GET", "POST"])
@permission_classes(DEV_PERMS)
def assistant_course_messages(request, course_id: int):
    try:
        course = Course.objects.get(id=course_id)
        ap = AcademicProfile.objects.get(user=request.user)
        
        if not CourseAssignment.objects.filter(course=course, assistant=ap).exists():
            return Response({"detail": "Accès non autorisé à ce cours."}, status=403)

        if request.method == "GET":
            msgs = CourseMessage.objects.select_related("sender").filter(course=course).order_by("created_at")
            out = []
            for m in msgs:
                sender_profile = AcademicProfile.objects.filter(id=m.sender_id).first()
                sender_name = f"{sender_profile.prenom} {sender_profile.nom}".strip() if sender_profile else "Utilisateur inconnu"
                out.append({
                    "id": m.id,
                    "body": m.body,
                    "sender": sender_name,
                    "is_self": m.sender == ap,
                    "created_at": m.created_at.isoformat(),
                })
            return Response(out)

        body = request.data.get("body", "").strip()
        if not body:
            return Response({"detail": "Le corps du message ne peut pas être vide."}, status=400)
        
        msg = CourseMessage.objects.create(course=course, sender=ap, title="Message de discussion", body=body)
        
        return Response({
            "id": msg.id,
            "body": msg.body,
            "sender": f"{ap.prenom} {ap.nom}".strip(),
            "is_self": True,
            "created_at": msg.created_at.isoformat(),
        }, status=201)

    except Course.DoesNotExist:
        return Response({"detail": "Cours introuvable."}, status=404)
    except AcademicProfile.DoesNotExist:
        return Response({"detail": "Profil académique non trouvé."}, status=404)
    except Exception as e:
        return Response({"detail": f"Erreur de traitement: {e}"}, status=400)


# ... (le reste des vues)
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
    auditorium = ""
    department = ""
    faculty = ""
    matricule = f"STU-{uid:05d}"
    try:
        sp = StudentProfile.objects.select_related("current_auditoire__departement__section").get(user=u)
        auditorium = getattr(getattr(sp, "current_auditoire", None), "name", "") or ""
        dep = getattr(sp.current_auditoire, "departement", None)
        department = getattr(dep, "name", "") if dep else ""
        faculty = getattr(getattr(dep, "section", None), "name", "") if dep else ""
        if sp.matricule:
            matricule = sp.matricule
    except Exception:
        pass
    data = {
        "auditorium": auditorium,
        "session": f"{timezone.now().year}-{timezone.now().year + 1}",
        "department": department,
        "faculty": faculty,
        "matricule": matricule,
        "email": getattr(u, "email", ""),
    }
    return Response(data)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def student_grades_recent(request):
    items = []
    try:
        sp = StudentProfile.objects.get(user=request.user)
        subs = (
            Submission.objects.select_related("assignment__course")
            .filter(student=sp, grade__isnull=False)
            .order_by("-submitted_at")[:10]
        )
        for s in subs:
            items.append({
                "course": getattr(getattr(s.assignment, "course", None), "name", "Cours"),
                "grade": s.grade,
            })
    except Exception:
        pass
    return Response(items)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def student_profile(request):
    u = request.user
    uid = _safe_user_id(u)
    matricule = f"STU-{uid:05d}"
    auditorium = department = faculty = ""
    try:
        sp = StudentProfile.objects.select_related("current_auditoire__departement__section").get(user=u)
        if sp.matricule:
            matricule = sp.matricule
        auditorium = getattr(getattr(sp, "current_auditoire", None), "name", "") or ""
        dep = getattr(sp.current_auditoire, "departement", None)
        department = getattr(dep, "name", "") if dep else ""
        faculty = getattr(getattr(dep, "section", None), "name", "") if dep else ""
    except Exception:
        pass
    data = {
        "avatar": f"https://i.pravatar.cc/128?u={uid}",
        "name": getattr(u, "username", "Invité"),
        "matricule": matricule,
        "email": getattr(u, "email", ""),
        "phone": "+243 000 000 000",
        "address": "Campus Universitaire",
        "auditorium": auditorium,
        "session": f"{timezone.now().year}-{timezone.now().year + 1}",
        "department": department,
        "faculty": faculty,
    }
    return Response(data)


# --- Vues Placeholder mises à jour ---

@api_view(["GET"])
@permission_classes(DEV_PERMS)
def assistant_summary(request):
    data = {"courses": 0, "activeTPTD": 0, "activeQuizzes": 0, "toGrade": 0, "auditoriums": []}
    try:
        ap = AcademicProfile.objects.get(user=request.user)
        # Cours assignés
        q_assign = CourseAssignment.objects.select_related("course__auditoire").filter(assistant=ap)
        data["courses"] = q_assign.count()
        # TP/TD actifs (deadline future)
        data["activeTPTD"] = Assignment.objects.filter(assistant=ap, deadline__gte=timezone.now()).count()
        # Quizzes actifs
        data["activeQuizzes"] = Quiz.objects.filter(assistant=ap).count()
        # A corriger (soumis mais non noté)
        data["toGrade"] = Submission.objects.filter(assignment__assistant=ap, grade__isnull=True, status='soumis').count()
        # Auditoriums gérés
        aud_ids = q_assign.values_list("course__auditoire", flat=True).distinct()
        auds = Auditoire.objects.filter(id__in=aud_ids).select_related("departement")
        for a in auds:
            students = StudentProfile.objects.filter(current_auditoire=a).count()
            data["auditoriums"].append({
                "code": a.name,
                "students": students,
                "department": getattr(a.departement, "name", "")  # Ajout de la propriété 'department'
            })
    except Exception:
        pass
    return Response(data)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def auditoriums_assistant_my(request):
    items = []
    try:
        ap = AcademicProfile.objects.get(user=request.user)
        aud_ids = CourseAssignment.objects.filter(assistant=ap).values_list("course__auditoire", flat=True).distinct()
        for a in Auditoire.objects.filter(id__in=aud_ids):
            students = StudentProfile.objects.filter(current_auditoire=a).count()
            dept = getattr(a.departement, "name", "")
            items.append({"code": a.name, "name": a.name, "department": dept, "students": students})
    except Exception:
        pass
    return Response(items)


# ---- Assistant: student detail endpoints ----

@api_view(["GET"])
@permission_classes(DEV_PERMS)
def assistant_student_detail(request, id: int):
    try:
        sp = StudentProfile.objects.select_related("user", "current_auditoire").get(id=id)
        return Response({
            "id": sp.id,
            "name": f"{sp.nom} {sp.postnom} {sp.prenom}".strip(),
            "email": getattr(getattr(sp, "user", None), "email", ""),
            "auditorium": getattr(getattr(sp, "current_auditoire", None), "name", ""),
        })
    except StudentProfile.DoesNotExist:
        return Response({}, status=404)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def assistant_student_grades(request, id: int):
    rows = []
    try:
        sp = StudentProfile.objects.get(id=id)
        # Regrouper par cours: moyenne des notes par cours
        subs = Submission.objects.select_related("assignment__course").filter(student=sp, grade__isnull=False)
        by_course = {}
        for s in subs:
            cname = getattr(getattr(s.assignment, "course", None), "name", "")
            if not cname:
                continue
            by_course.setdefault(cname, []).append(s.grade)
        for cname, grades in by_course.items():
            if grades:
                rows.append({"name": cname, "grade": round(sum(grades) / len(grades), 2)})
    except Exception:
        pass
    return Response(rows)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def assistant_student_submissions(request, id: int):
    rows = []
    try:
        sp = StudentProfile.objects.get(id=id)
        subs = Submission.objects.select_related("assignment").filter(student=sp).order_by("-submitted_at")[:50]
        for s in subs:
            rows.append({
                "title": getattr(s.assignment, "title", ""),
                "status": s.status,
                "grade": s.grade,
                "submitted_at": s.submitted_at,
            })
    except Exception:
        pass
    return Response(rows)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def assistant_auditorium_courses(request, code: str):
    rows = []
    try:
        # code correspond au champ Auditoire.name
        aud = Auditoire.objects.filter(name=code).first()
        if aud:
            for c in Course.objects.filter(auditoire=aud):
                rows.append({
                    "code": f"{c.name[:3].upper()}-{c.id}",
                    "title": c.name,
                })
    except Exception:
        pass
    return Response(rows)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def assistant_auditorium_students(request, code: str):
    rows = []
    try:
        aud = Auditoire.objects.filter(name=code).first()
        if aud:
            qs = StudentProfile.objects.select_related("user").filter(current_auditoire=aud)
            for s in qs:
                rows.append({
                    "id": s.id,
                    "name": f"{s.nom} {s.postnom} {s.prenom}".strip(),
                    "email": getattr(getattr(s, "user", None), "email", ""),
                })
    except Exception:
        pass
    return Response(rows)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def assistant_auditorium_activities(request, code: str):
    rows = []
    try:
        aud = Auditoire.objects.filter(name=code).first()
        if aud:
            events = Calendrier.objects.filter(auditoire=aud).order_by("-start_date")[:20]
            for e in events:
                rows.append({
                    "title": e.title,
                    "type": "Calendrier",
                    "date": e.start_date.strftime("%Y-%m-%d"),
                })
    except Exception:
        pass
    return Response(rows)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def assistant_auditorium_stats(request, code: str):
    data = {"averageGrade": None, "totalStudents": 0, "passRate": None, "department": "N/A"}
    try:
        aud = Auditoire.objects.filter(name=code).first()
        if aud:
            students_qs = StudentProfile.objects.filter(current_auditoire=aud)
            data["totalStudents"] = students_qs.count()
            data["department"] = getattr(aud.departement, "name", "N/A")
            # Notes via submissions associées aux assignments des cours de cet auditoire
            subs = Submission.objects.filter(assignment__course__auditoire=aud, grade__isnull=False)
            grades = list(subs.values_list("grade", flat=True))
            if grades:
                avg = sum(grades) / len(grades)
                data["averageGrade"] = round(avg, 2)
                passed = len([g for g in grades if g >= 10])
                data["passRate"] = round(100 * passed / len(grades), 1)
    except Exception:
        pass
    return Response(data)


# ---- Assistant: auditorium messages (GET list, POST create) ----

@api_view(["GET", "POST"])
@permission_classes(DEV_PERMS)
def assistant_auditorium_messages(request, code: str):
    try:
        aud = Auditoire.objects.filter(name=code).first()
        if not aud:
            return Response([], status=404)
        if request.method == "GET":
            msgs = CourseMessage.objects.select_related("course", "sender").filter(course__auditoire=aud).order_by("-created_at")[:100]
            out = []
            for m in msgs:
                out.append({
                    "id": m.id,
                    "courseId": m.course_id,
                    "course": getattr(m.course, "name", ""),
                    "title": m.title,
                    "body": m.body,
                    "created_at": m.created_at.isoformat(),
                    "sender": (f"{getattr(m.sender, 'prenom', '')} {getattr(m.sender, 'nom', '')}".strip() if m.sender else ""),
                })
            return Response(out)
        # POST
        ap = AcademicProfile.objects.get(user=request.user)
        course_id = request.data.get("course_id")
        title = request.data.get("title", "").strip()
        body = request.data.get("body", "").strip()
        if not (course_id and title and body):
            return Response({"detail": "course_id, title, body requis"}, status=400)
        course = Course.objects.filter(id=course_id, auditoire=aud).first()
        if not course:
            return Response({"detail": "Cours introuvable dans cet auditoire"}, status=404)
        msg = CourseMessage.objects.create(course=course, sender=ap, title=title, body=body)
        return Response({
            "id": msg.id,
            "courseId": msg.course_id,
            "course": getattr(msg.course, "name", ""),
            "title": msg.title,
            "body": msg.body,
            "created_at": msg.created_at.isoformat(),
            "sender": (f"{getattr(ap, 'prenom', '')} {getattr(ap, 'nom', '')}".strip()),
        }, status=201)
    except Exception:
        return Response({"detail": "Erreur de traitement des messages"}, status=400)


@api_view(["POST"])
@permission_classes(DEV_PERMS)
def assistant_auditorium_create_tptd(request, code: str):
    try:
        aud = Auditoire.objects.filter(name=code).first()
        if not aud:
            return Response({"detail": "Auditoire introuvable"}, status=404)
        ap = AcademicProfile.objects.get(user=request.user)
        course_id = request.data.get("course_id")
        title = (request.data.get("title") or "").strip()
        deadline_s = request.data.get("deadline")
        if not (course_id and title and deadline_s):
            return Response({"detail": "course_id, title, deadline requis"}, status=400)
        course = Course.objects.filter(id=course_id, auditoire=aud).first()
        if not course:
            return Response({"detail": "Cours introuvable dans cet auditoire"}, status=404)
        deadline = parse_datetime(deadline_s) or timezone.now() + timedelta(days=7)
        a = Assignment.objects.create(course=course, assistant=ap, title=title, questionnaire="", deadline=deadline)
        return Response({"id": a.id, "title": a.title, "deadline": a.deadline.isoformat()}, status=201)
    except Exception:
        return Response({"detail": "Erreur de cr\u00e9ation TP/TD"}, status=400)


@api_view(["POST"])
@permission_classes(DEV_PERMS)
def assistant_auditorium_create_quiz(request, code: str):
    try:
        aud = Auditoire.objects.filter(name=code).first()
        if not aud:
            return Response({"detail": "Auditoire introuvable"}, status=404)
        ap = AcademicProfile.objects.get(user=request.user)
        course_id = request.data.get("course_id")
        title = (request.data.get("title") or "").strip()
        duration = int(request.data.get("duration") or 0)
        if not (course_id and title and duration):
            return Response({"detail": "course_id, title, duration requis"}, status=400)
        course = Course.objects.filter(id=course_id, auditoire=aud).first()
        if not course:
            return Response({"detail": "Cours introuvable dans cet auditoire"}, status=404)
        q = Quiz.objects.create(course=course, assistant=ap, title=title, duration=duration)
        return Response({"id": q.id, "title": q.title, "duration": q.duration}, status=201)
    except Exception:
        return Response({"detail": "Erreur de cr\u00e9ation du quiz"}, status=400)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def tptd_my(request):
    items = []
    try:
        ap = AcademicProfile.objects.get(user=request.user)
        for a in Assignment.objects.select_related("course").filter(assistant=ap):
            items.append({
                "id": a.id,
                "title": a.title,
                "deadline": a.deadline,
                "course": getattr(a.course, "name", ""),
            })
    except Exception:
        pass
    return Response(items)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def quizzes_my(request):
    items = []
    try:
        ap = AcademicProfile.objects.get(user=request.user)
        for q in Quiz.objects.select_related("course").filter(assistant=ap):
            items.append({
                "id": q.id,
                "title": q.title,
                "duration": q.duration,
                "course": getattr(q.course, "name", ""),
            })
    except Exception:
        pass
    return Response(items)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def assistant_tograde(request):
    items = []
    try:
        ap = AcademicProfile.objects.get(user=request.user)
        qs = Submission.objects.select_related("assignment__course", "student").filter(assignment__assistant=ap, grade__isnull=True, status='soumis')
        for s in qs:
            items.append({
                "id": s.id,
                "student": f"{getattr(s.student, 'nom', '')} {getattr(s.student, 'prenom', '')}",
                "assignment": getattr(getattr(s, 'assignment', None), 'title', ''),
                "course": getattr(getattr(getattr(s, 'assignment', None), 'course', None), 'name', ''),
                "submitted_at": s.submitted_at,
            })
    except Exception:
        pass
    return Response(items)


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
    items = []
    try:
        sp = StudentProfile.objects.select_related("current_auditoire").get(user=request.user)
        aud = sp.current_auditoire
        qs = Quiz.objects.select_related("course").filter(course__auditoire=aud)
        for q in qs:
            deadline = (getattr(q, "created_at", None) or timezone.now()) + timedelta(days=7)
            items.append({
                "id": q.id,
                "title": q.title,
                "duration": q.duration,
                "deadline": deadline,
            })
    except Exception:
        pass
    return Response(items)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def tptd_student_available(request):
    items = []
    try:
        sp = StudentProfile.objects.select_related("current_auditoire").get(user=request.user)
        aud = sp.current_auditoire
        qs = Assignment.objects.select_related("course").filter(course__auditoire=aud)
        for a in qs:
            items.append({
                "id": a.id,
                "title": a.title,
                "type": getattr(getattr(a, "course", None), "session_type", "tp"),
                "deadline": a.deadline,
            })
    except Exception:
        pass
    return Response(items)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def quizzes_student_my_attempts(request):
    # Tentatives de quiz de l'étudiant
    return Response([])


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def tptd_student_my_submissions(request):
    items = []
    try:
        sp = StudentProfile.objects.get(user=request.user)
        subs = Submission.objects.select_related("assignment").filter(student=sp).order_by("-submitted_at")[:20]
        for s in subs:
            items.append({
                "id": s.id,
                "title": getattr(s.assignment, "title", ""),
                "submitted_at": s.submitted_at,
                "grade": s.grade,
            })
    except Exception:
        pass
    return Response(items)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def student_courses(request):
    rows = []
    try:
        sp = StudentProfile.objects.select_related("current_auditoire").get(user=request.user)
        aud = sp.current_auditoire
        for c in Course.objects.filter(auditoire=aud).select_related("auditoire"):
            code = f"{c.name[:3].upper()}-{c.id}"
            title = c.name
            credits = 3
            assign = CourseAssignment.objects.filter(course=c).select_related("assistant").first()
            instructor = (
                f"{assign.assistant.prenom} {assign.assistant.nom}".strip() if assign and assign.assistant else ""
            )
            rows.append({"code": code, "title": title, "credits": credits, "instructor": instructor})
    except Exception:
        pass
    return Response(rows)


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


# ---- Actions étudiant (POST) ----

@api_view(["POST"])
@permission_classes(DEV_PERMS)
def quizzes_student_start(request, id: int):
    # Pas de modèle d'"attempt" pour les quiz pour l'instant: on renvoie juste OK
    return Response({"status": "ok"})


@api_view(["POST"])
@permission_classes(DEV_PERMS)
def quizzes_student_attempt_submit(request, id: int):
    # Pas de modèle d'"attempt" pour les quiz pour l'instant: on renvoie juste OK
    return Response({"status": "ok"})


@api_view(["POST"])
@permission_classes(DEV_PERMS)
def tptd_student_submit(request, id: int):
    # Créer une soumission pour l'Assignment id
    try:
        sp = StudentProfile.objects.get(user=request.user)
        a = Assignment.objects.get(id=id)
        Submission.objects.create(
            assignment=a,
            student=sp,
            status='soumis',
            submitted_at=timezone.now(),
        )
        return Response({"status": "submitted"})
    except Exception:
        return Response({"status": "error"})


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
