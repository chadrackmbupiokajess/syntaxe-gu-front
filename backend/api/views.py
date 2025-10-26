from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions
from rest_framework.response import Response
from django.conf import settings
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from datetime import timedelta
from django.apps import apps
from django.contrib.auth.hashers import make_password
from django.db import transaction, IntegrityError

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
Question = apps.get_model('evaluations', 'Question')
Choice = apps.get_model('evaluations', 'Choice')
Answer = apps.get_model('evaluations', 'Answer')
QuizAttempt = apps.get_model('evaluations', 'QuizAttempt')


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
                "code": course.code,
                "title": course.name,
                "auditorium_id": getattr(auditoire, "id", None),
                "auditorium": getattr(auditoire, "name", ""),
                "department": getattr(departement, "name", "") if departement else "",
            })
    except Exception:
        pass
    return Response(items)

@api_view(['GET', 'POST'])
@permission_classes(DEV_PERMS)
def tptd_my(request):
    ap = AcademicProfile.objects.get(user=request.user)

    if request.method == 'POST':
        course_code = request.data.get("course_code")
        title = request.data.get("title", "").strip()
        deadline_s = request.data.get("deadline")
        assignment_type = request.data.get("type", "TP")
        questionnaire = request.data.get("questionnaire", [])
        total_points = request.data.get("total_points", 20)

        if not (course_code and title and deadline_s):
            return Response({"detail": "Code du cours, titre et deadline requis."}, status=400)

        course = Course.objects.filter(code=course_code).first()
        if not course:
            return Response({"detail": f"Cours avec le code {course_code} introuvable."}, status=404)

        if not CourseAssignment.objects.filter(course=course, assistant=ap).exists():
            return Response({"detail": "Vous n'êtes pas assigné à ce cours."}, status=403)

        deadline = parse_datetime(deadline_s) if deadline_s else timezone.now() + timedelta(days=7)

        a = Assignment.objects.create(
            course=course,
            assistant=ap,
            title=title,
            type=assignment_type,
            questionnaire=questionnaire,
            total_points=total_points,
            deadline=deadline
        )
        return Response({
            "id": a.id,
            "title": a.title,
            "type": a.type,
            "course_name": course.name,
            "department": course.auditoire.departement.name,
            "auditorium": course.auditoire.name,
            "deadline": a.deadline,
        }, status=201)

    # GET request
    items = []
    assignments = Assignment.objects.select_related("course__auditoire__departement").filter(assistant=ap)
    for a in assignments:
        items.append({
            "id": a.id,
            "title": a.title,
            "type": a.type,
            "course_name": a.course.name,
            "department": a.course.auditoire.departement.name,
            "auditorium": a.course.auditoire.name,
            "deadline": a.deadline,
        })
    return Response(items)

@api_view(['GET', 'DELETE'])
@permission_classes(DEV_PERMS)
def tptd_my_detail(request, id):
    try:
        ap = AcademicProfile.objects.get(user=request.user)
        assignment = Assignment.objects.select_related('course__auditoire__departement').get(id=id, assistant=ap)

        if request.method == 'GET':
            data = {
                "id": assignment.id,
                "title": assignment.title,
                "type": assignment.type,
                "course_name": assignment.course.name,
                "auditorium": assignment.course.auditoire.name,
                "department": assignment.course.auditoire.departement.name,
                "questionnaire": assignment.questionnaire,
                "total_points": assignment.total_points,
                "deadline": assignment.deadline,
                "created_at": assignment.created_at,
            }
            return Response(data)

        elif request.method == 'DELETE':
            assignment.delete()
            return Response(status=204)

    except (AcademicProfile.DoesNotExist, Assignment.DoesNotExist):
        return Response({"detail": "TP/TD non trouvé ou accès non autorisé."}, status=404)


@api_view(['GET', 'POST'])
@permission_classes(DEV_PERMS)
def quizzes_my(request):
    ap = AcademicProfile.objects.get(user=request.user)

    if request.method == 'POST':
        course_code = request.data.get("course_code")
        title = request.data.get("title", "").strip()
        duration = request.data.get("duration", 20)
        questions = request.data.get("questions", [])

        if not (course_code and title and questions):
            return Response({"detail": "Code du cours, titre et questions requis."}, status=400)

        course = Course.objects.filter(code=course_code).first()
        if not course:
            return Response({"detail": f"Cours avec le code {course_code} introuvable."}, status=404)

        if not CourseAssignment.objects.filter(course=course, assistant=ap).exists():
            return Response({"detail": "Vous n'êtes pas assigné à ce cours."}, status=403)

        quiz = Quiz.objects.create(course=course, assistant=ap, title=title, duration=duration)

        for q_data in questions:
            question = Question.objects.create(quiz=quiz, question_text=q_data['text'], question_type=q_data['type'])
            if q_data['type'] in ['single', 'multiple']:
                for choice_data in q_data['choices']:
                    Choice.objects.create(question=question, choice_text=choice_data['text'], is_correct=choice_data['is_correct'])
        
        return Response({"id": quiz.id, "title": quiz.title}, status=201)

    # GET request
    items = []
    quizzes = Quiz.objects.select_related("course__auditoire__departement").filter(assistant=ap)
    for q in quizzes:
        items.append({
            "id": q.id,
            "title": q.title,
            "course_name": q.course.name,
            "department": q.course.auditoire.departement.name,
            "auditorium": q.course.auditoire.name,
            "duration": q.duration,
        })
    return Response(items)

@api_view(['GET', 'DELETE'])
@permission_classes(DEV_PERMS)
def quizzes_my_detail(request, id):
    try:
        ap = AcademicProfile.objects.get(user=request.user)
        quiz = Quiz.objects.select_related('course__auditoire__departement').get(id=id, assistant=ap)

        if request.method == 'GET':
            questions = []
            for q in quiz.questions.all():
                choices = []
                if q.question_type in ['single', 'multiple']:
                    for c in q.choices.all():
                        choices.append({"text": c.choice_text, "is_correct": c.is_correct})
                questions.append({"text": q.question_text, "type": q.question_type, "choices": choices})

            data = {
                "id": quiz.id,
                "title": quiz.title,
                "course_name": quiz.course.name,
                "auditorium": quiz.course.auditoire.name,
                "department": quiz.course.auditoire.departement.name,
                "duration": quiz.duration,
                "created_at": quiz.created_at,
                "questions": questions,
            }
            return Response(data)

        elif request.method == 'DELETE':
            quiz.delete()
            return Response(status=204)

    except (AcademicProfile.DoesNotExist, Quiz.DoesNotExist):
        return Response({"detail": "Quiz non trouvé ou accès non autorisé."}, status=404)

# --- Vues pour les notes --- 

@api_view(['GET', 'PATCH'])
@permission_classes(DEV_PERMS)
def assistant_grades(request, auditorium_id, course_code):
    try:
        ap = AcademicProfile.objects.get(user=request.user)
        
        auditorium = Auditoire.objects.filter(pk=auditorium_id).first()
        if not auditorium:
            return Response({"detail": f"Auditoire avec ID '{auditorium_id}' non trouvé."}, status=404)

        course = Course.objects.filter(code=course_code, auditoire=auditorium).first()
        if not course:
            return Response({"detail": f"Cours '{course_code}' non trouvé dans l'auditoire '{auditorium.name}'."}, status=404)

        if not CourseAssignment.objects.filter(course=course, assistant=ap).exists():
            return Response({"detail": "Accès non autorisé à ce cours."}, status=403)

        if request.method == 'GET':
            students = StudentProfile.objects.select_related('user').filter(current_auditoire=auditorium).order_by('nom', 'prenom')
            
            submissions = Submission.objects.filter(
                assignment__course=course,
                student__in=students
            ).select_related('student')

            grades_map = {}
            for sub in submissions:
                student_id = sub.student.id
                if student_id not in grades_map or sub.submitted_at > grades_map[student_id]['submitted_at']:
                    grades_map[student_id] = {'grade': sub.grade, 'submitted_at': sub.submitted_at}

            grades_data = []
            for student in students:
                student_grade_info = grades_map.get(student.id)
                grade = student_grade_info['grade'] if student_grade_info else None
                
                student_name = f"{student.nom} {student.prenom}".strip()
                if not student_name and hasattr(student, 'user') and student.user:
                    student_name = f"{student.user.first_name} {student.user.last_name}".strip()

                grades_data.append({
                    "student_id": student.id,
                    "student_name": student_name or f"Student {student.id}",
                    "matricule": student.matricule or "",
                    "avatar": f"https://i.pravatar.cc/128?u={student.user.id}" if hasattr(student, 'user') and student.user else "",
                    "grade": grade,
                })
            return Response(grades_data)

        elif request.method == 'PATCH':
            student_id = request.data.get("student_id")
            grade = request.data.get("grade")

            if student_id is None or grade is None:
                return Response({"detail": "student_id et grade sont requis pour la mise à jour."}, status=400)
            
            student = StudentProfile.objects.filter(id=student_id).first()
            if not student:
                return Response({"detail": "Étudiant non trouvé."}, status=404)

            assignment = Assignment.objects.filter(course=course).order_by('-created_at').first()
            if not assignment:
                return Response({"detail": "Aucun devoir (TP/TD) n'est créé pour ce cours. Impossible de noter."}, status=400)

            submission, created = Submission.objects.get_or_create(
                student=student,
                assignment=assignment,
                defaults={'status': 'noté', 'grade': grade, 'submitted_at': timezone.now()}
            )

            if not created:
                submission.grade = grade
                submission.graded_at = timezone.now()
                submission.status = 'noté'
                submission.save()

            return Response({"detail": "Note mise à jour avec succès.", "grade": grade}, status=200)

    except AcademicProfile.DoesNotExist:
        return Response({"detail": "Profil académique non trouvé."}, status=404)
    except Exception as e:
        print(f"Error in assistant_grades: {e}")
        return Response({"detail": f"Une erreur inattendue est survenue: {e}"}, status=500)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def assistant_tograde(request):
    items = []
    try:
        ap = AcademicProfile.objects.get(user=request.user)
        # Récupérer les soumissions de TP/TD
        submissions_tptd = Submission.objects.select_related(
            "assignment__course__auditoire__departement", 
            "student__user"
        ).filter(assignment__assistant=ap, grade__isnull=True, status='soumis')

        for s in submissions_tptd:
            items.append({
                "id": s.id,
                "type": s.assignment.type, # Type de l'assignment (TP/TD)
                "title": s.assignment.title,
                "student_name": f"{s.student.nom} {s.student.prenom}".strip(),
                "course_name": s.assignment.course.name,
                "auditorium": s.assignment.course.auditoire.name,
                "department": s.assignment.course.auditoire.departement.name,
                "submitted_at": s.submitted_at,
                "assignment_id": s.assignment.id,
            })
        
        # TODO: Ajouter la logique pour les soumissions de Quiz si nécessaire

    except Exception as e:
        # Log the exception for debugging
        print(f"Error in assistant_tograde: {e}")
        pass
    return Response(items)


@api_view(['GET', 'PATCH'])
@permission_classes(DEV_PERMS)
def assistant_profile(request):
    try:
        ap = AcademicProfile.objects.get(user=request.user)
        user = ap.user

        if request.method == 'PATCH':
            # Update user info
            user.first_name = request.data.get('prenom', user.first_name)
            user.last_name = request.data.get('nom', user.last_name)
            user.email = request.data.get('email', user.email)
            user.save()

            # Update academic profile
            ap.phone = request.data.get('phone', ap.phone)
            ap.office = request.data.get('office', ap.office)
            
            # Handle profile picture upload
            if 'profile_picture' in request.FILES:
                ap.profile_picture = request.FILES['profile_picture']

            ap.save()

            # Password change
            current_password = request.data.get('current_password')
            new_password = request.data.get('new_password')
            if current_password and new_password:
                if not user.check_password(current_password):
                    return Response({"detail": "Mot de passe actuel incorrect."}, status=400)
                user.password = make_password(new_password)
                user.save()

            # Return updated profile data including new avatar URL
            data = {
                "prenom": user.first_name,
                "nom": user.last_name,
                "email": user.email,
                "phone": ap.phone,
                "office": ap.office,
                "department": "", # Assuming assistant is not tied to a single dept
                "faculty": "", # Assuming assistant is not tied to a single faculty
                "avatar": ap.profile_picture.url if ap.profile_picture else f"https://i.pravatar.cc/128?u={user.id}",
            }
            latest_assignment = CourseAssignment.objects.filter(assistant=ap).select_related('course__auditoire__departement__section').first()
            if latest_assignment:
                data["department"] = latest_assignment.course.auditoire.departement.name
                data["faculty"] = latest_assignment.course.auditoire.departement.section.name
            return Response(data)

        # GET request
        data = {
            "prenom": user.first_name,
            "nom": user.last_name,
            "email": user.email,
            "phone": ap.phone,
            "office": ap.office,
            "department": "",
            "faculty": "",
            "avatar": ap.profile_picture.url if ap.profile_picture else f"https://i.pravatar.cc/128?u={user.id}",
        }
        latest_assignment = CourseAssignment.objects.filter(assistant=ap).select_related('course__auditoire__departement__section').first()
        if latest_assignment:
            data["department"] = latest_assignment.course.auditoire.departement.name
            data["faculty"] = latest_assignment.course.auditoire.departement.section.name
        return Response(data)

    except AcademicProfile.DoesNotExist:
        return Response({"detail": "Profil non trouvé."}, status=404)


# --- Vues Placeholder --- 

@api_view(["GET"])
@permission_classes(DEV_PERMS)
def student_summary(request):
    program = "N/A"
    creditsEarned = 0
    gpa = 0.0
    try:
        sp = StudentProfile.objects.select_related("current_auditoire__departement__section").get(user=request.user)
        if sp.current_auditoire and sp.current_auditoire.departement and sp.current_auditoire.departement.section:
            program = sp.current_auditoire.departement.section.name

        # Calcul des crédits et GPA
        submissions = Submission.objects.filter(student=sp, grade__isnull=False).select_related('assignment__course')
        
        # Pour éviter de compter plusieurs fois les crédits d'un même cours
        successful_courses = set()
        total_points = 0
        total_credits = 0

        for sub in submissions:
            if sub.grade and sub.grade >= 10:
                # Assumons 3 crédits par cours si non spécifié
                credits = getattr(sub.assignment.course, 'credits', 3)
                if sub.assignment.course.id not in successful_courses:
                    creditsEarned += credits
                    successful_courses.add(sub.assignment.course.id)
            
            # Pour le GPA, on peut faire une moyenne simple ou pondérée
            # Ici, une moyenne simple des notes
            if sub.grade is not None:
                total_points += sub.grade
                total_credits += 1 # ou utiliser les crédits du cours pour pondérer

        if total_credits > 0:
            gpa = round(total_points / total_credits, 2)

    except StudentProfile.DoesNotExist:
        pass

    data = {
        "program": program,
        "semester": "S1",
        "creditsEarned": creditsEarned,
        "gpa": gpa,
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
            course_count = CourseAssignment.objects.filter(assistant=ap, course__auditoire=a).count()
            dept = getattr(a.departement, "name", "")
            items.append({"id": a.id, "code": a.name, "name": a.name, "department": dept, "students": students, "course_count": course_count})
    except Exception:
        pass
    return Response(items)


# ---- Assistant: student detail endpoints ----

@api_view(["GET"])
@permission_classes(DEV_PERMS)
def assistant_student_detail(request, id: int):
    try:
        sp = StudentProfile.objects.select_related("user", "current_auditoire").get(id=id)
        
        total_grade_obtained = 0
        total_possible_points = 0

        # Get all graded submissions for the student
        submissions = Submission.objects.filter(student=sp, grade__isnull=False).select_related('assignment')
        
        for sub in submissions:
            total_grade_obtained += sub.grade
            total_possible_points += getattr(sub.assignment, 'total_points', 20) # Default to 20 if not set

        data = {
            "id": sp.id,
            "name": f"{sp.nom} {sp.postnom} {sp.prenom}".strip(),
            "email": getattr(getattr(sp, "user", None), "email", ""),
            "auditorium": getattr(getattr(sp, "current_auditoire", None), "name", ""),
            "total_grade_obtained": total_grade_obtained,
            "total_possible_points": total_possible_points,
        }
        return Response(data)
    except StudentProfile.DoesNotExist:
        return Response({}, status=404)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def assistant_student_grades(request, id: int):
    rows = []
    try:
        sp = StudentProfile.objects.get(id=id) # Corrected to get student by ID
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
        sp = StudentProfile.objects.get(user=request.user)
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
    course_ids = set()
    try:
        ap = AcademicProfile.objects.get(user=request.user)
        auditorium_id = int(code)
        aud = Auditoire.objects.filter(pk=auditorium_id).first()
        if aud:
            # Find assignments for the current assistant in the specified auditorium
            assignments = CourseAssignment.objects.filter(
                assistant=ap, 
                course__auditoire=aud
            ).select_related('course')

            for assign in assignments:
                c = assign.course
                if c.id not in course_ids:
                    rows.append({
                        "id": c.id,
                        "code": c.code,
                        "title": c.name,
                    })
                    course_ids.add(c.id)
    except (AcademicProfile.DoesNotExist, ValueError, TypeError):
        pass
    except Exception as e:
        print(f"Error in assistant_auditorium_courses: {e}")
        pass
    return Response(rows)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def assistant_auditorium_students(request, code: str):
    rows = []
    try:
        auditorium_id = int(code)
        aud = Auditoire.objects.filter(pk=auditorium_id).first()
        if aud:
            qs = StudentProfile.objects.select_related("user").filter(current_auditoire=aud)
            for s in qs:
                total_grade_obtained = 0
                total_possible_points = 0

                # Get all graded submissions for the student
                submissions = Submission.objects.filter(student=s, grade__isnull=False).select_related('assignment')
                
                for sub in submissions:
                    total_grade_obtained += sub.grade
                    total_possible_points += getattr(sub.assignment, 'total_points', 20) # Default to 20 if not set

                rows.append({
                    "id": s.id,
                    "name": f"{s.nom} {s.postnom} {s.prenom}".strip(),
                    "email": getattr(getattr(s, "user", None), "email", ""),
                    "total_grade_obtained": total_grade_obtained,
                    "total_possible_points": total_possible_points,
                })
    except (ValueError, TypeError):
        pass
    return Response(rows)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def assistant_auditorium_activities(request, code: str):
    rows = []
    try:
        auditorium_id = int(code)
        aud = Auditoire.objects.filter(pk=auditorium_id).first()
        if aud:
            events = Calendrier.objects.filter(auditoire=aud).order_by("-start_date")[:20]
            for e in events:
                rows.append({
                    "title": e.title,
                    "type": "Calendrier",
                    "date": e.start_date.strftime("%Y-%m-%d"),
                })
    except (ValueError, TypeError):
        pass
    return Response(rows)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def assistant_auditorium_stats(request, code: str):
    data = {"averageGrade": None, "totalStudents": 0, "passRate": None, "department": "N/A"}
    try:
        auditorium_id = int(code)
        aud = Auditoire.objects.filter(pk=auditorium_id).first()
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
    except (ValueError, TypeError):
        pass
    return Response(data)


# ---- Assistant: auditorium messages (GET list, POST create) ----

@api_view(["GET", "POST"])
@permission_classes(DEV_PERMS)
def assistant_auditorium_messages(request, code: str):
    try:
        auditorium_id = int(code)
        aud = Auditoire.objects.filter(pk=auditorium_id).first()
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
    except (ValueError, TypeError):
        return Response({"detail": "Code d'auditoire invalide"}, status=400)
    except Exception:
        return Response({"detail": "Erreur de traitement des messages"}, status=400)


@api_view(["POST"])
@permission_classes(DEV_PERMS)
def assistant_auditorium_create_tptd(request, code: str):
    try:
        auditorium_id = int(code)
        aud = Auditoire.objects.filter(pk=auditorium_id).first()
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
    except (ValueError, TypeError):
        return Response({"detail": "Code d'auditoire invalide"}, status=400)
    except Exception:
        return Response({"detail": "Erreur de création TP/TD"}, status=400)


@api_view(["POST"])
@permission_classes(DEV_PERMS)
def assistant_auditorium_create_quiz(request, code: str):
    try:
        auditorium_id = int(code)
        aud = Auditoire.objects.filter(pk=auditorium_id).first()
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
    except (ValueError, TypeError):
        return Response({"detail": "Code d'auditoire invalide"}, status=400)
    except Exception:
        return Response({"detail": "Erreur de création du quiz"}, status=400)


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
        # Get IDs of quizzes already attempted by the student
        attempted_quiz_ids = QuizAttempt.objects.filter(student=sp).values_list('quiz_id', flat=True)
        
        qs = Quiz.objects.select_related("course", "assistant").filter(course__auditoire=aud).exclude(id__in=attempted_quiz_ids)

        for q in qs:
            deadline = (getattr(q, "created_at", None) or timezone.now()) + timedelta(days=7)
            assistant_name = f"{q.assistant.prenom} {q.assistant.nom}".strip() if q.assistant else "N/A"
            items.append({
                "id": q.id,
                "title": q.title,
                "duration": q.duration,
                "deadline": deadline,
                "course_name": q.course.name,
                "session_type": q.course.get_session_type_display(),
                "assistant_name": assistant_name,
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

        # Get IDs of assignments already submitted by the student
        submitted_assignment_ids = Submission.objects.filter(student=sp).values_list('assignment_id', flat=True)

        # Filter assignments for the student's auditorium, excluding those already submitted
        qs = Assignment.objects.select_related("course", "assistant").filter(
            course__auditoire=aud
        ).exclude(
            id__in=submitted_assignment_ids
        )

        for a in qs:
            assistant_name = f"{a.assistant.prenom} {a.assistant.nom}".strip() if a.assistant else "N/A"
            items.append({
                "id": a.id,
                "title": a.title,
                "type": getattr(getattr(a, "course", None), "session_type", "tp"),
                "deadline": a.deadline,
                "course_name": a.course.name,
                "assistant_name": assistant_name,
            })
    except Exception:
        pass
    return Response(items)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def tptd_student_detail(request, id):
    try:
        sp = StudentProfile.objects.get(user=request.user)
        assignment = Assignment.objects.select_related('course__auditoire').get(id=id)

        # Security check: Ensure the student belongs to the assignment's auditorium
        if sp.current_auditoire != assignment.course.auditoire:
            return Response({"detail": "Accès non autorisé à ce devoir."}, status=403)

        data = {
            "id": assignment.id,
            "title": assignment.title,
            "course_name": assignment.course.name,
            "session_type": assignment.course.get_session_type_display(),
            "deadline": assignment.deadline,
            "questionnaire": assignment.questionnaire, # This is the questionnaire field
        }
        return Response(data)

    except (StudentProfile.DoesNotExist, Assignment.DoesNotExist):
        return Response({"detail": "Devoir non trouvé ou accès non autorisé."}, status=404)

@api_view(['GET'])
@permission_classes(DEV_PERMS)
def quizzes_student_detail(request, id):
    try:
        sp = StudentProfile.objects.get(user=request.user)
        quiz = Quiz.objects.select_related('course__auditoire', 'assistant').get(id=id)

        # Security check: Ensure the student belongs to the quiz's auditorium
        if sp.current_auditoire != quiz.course.auditoire:
            return Response({"detail": "Accès non autorisé à ce quiz."}, status=403)

        questions = []
        for q in quiz.questions.all():
            choices = []
            # For students, we don't send the is_correct flag
            if q.question_type in ['single', 'multiple']:
                for c in q.choices.all():
                    choices.append({"id": c.id, "text": c.choice_text})
            questions.append({"id": q.id, "text": q.question_text, "type": q.question_type, "choices": choices})

        assistant_name = f"{quiz.assistant.prenom} {quiz.assistant.nom}".strip() if quiz.assistant else "N/A"
        deadline = (getattr(quiz, "created_at", None) or timezone.now()) + timedelta(days=7)


        data = {
            "id": quiz.id,
            "title": quiz.title,
            "course_name": quiz.course.name,
            "session_type": quiz.course.get_session_type_display(),
            "duration": quiz.duration,
            "assistant_name": assistant_name,
            "deadline": deadline,
            "questions": questions,
        }
        return Response(data)

    except (StudentProfile.DoesNotExist, Quiz.DoesNotExist):
        return Response({"detail": "Quiz non trouvé ou accès non autorisé."}, status=404)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def quizzes_student_my_attempts(request):
    items = []
    try:
        sp = StudentProfile.objects.get(user=request.user)
        attempts = QuizAttempt.objects.select_related('quiz__course', 'quiz__assistant').filter(student=sp).order_by('-submitted_at')
        for a in attempts:
            assistant_name = f"{a.quiz.assistant.prenom} {a.quiz.assistant.nom}".strip() if a.quiz.assistant else "N/A"
            items.append({
                "id": a.id,
                "quiz_title": a.quiz.title,
                "course_name": a.quiz.course.name,
                "score": a.score,
                "total_questions": a.total_questions,
                "submitted_at": a.submitted_at,
                "submission_reason": a.get_submission_reason_display(),
                "assistant_name": assistant_name,
            })
    except StudentProfile.DoesNotExist:
        pass # Should not happen for a logged-in user
    return Response(items)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def tptd_student_my_submissions(request):
    items = []
    try:
        sp = StudentProfile.objects.get(user=request.user)

        # Automatically create submissions for overdue assignments
        overdue_assignments = Assignment.objects.filter(
            course__auditoire=sp.current_auditoire,
            deadline__lt=timezone.now()
        ).exclude(submissions__student=sp)

        for assignment in overdue_assignments:
            Submission.objects.create(
                assignment=assignment,
                student=sp,
                status='non-soumis',
                grade=0,
                submitted_at=assignment.deadline
            )

        subs = Submission.objects.select_related("assignment", "assignment__course", "assignment__assistant").filter(student=sp).order_by("-submitted_at")[:20]
        for s in subs:
            assistant_name = f"{s.assignment.assistant.prenom} {s.assignment.assistant.nom}".strip() if s.assignment.assistant else "N/A"
            items.append({
                "id": s.id,
                "title": getattr(s.assignment, "title", ""),
                "submitted_at": s.submitted_at,
                "grade": s.grade,
                "total_points": getattr(s.assignment, "total_points", 20),
                "status": s.status,
                "course_name": s.assignment.course.name,
                "session_type": s.assignment.course.get_session_type_display(),
                "assistant_name": assistant_name,
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
    try:
        sp = StudentProfile.objects.get(user=request.user)
        quiz = Quiz.objects.get(id=id)
        
        # Crée ou récupère la tentative. Si elle existe, ne fait rien.
        attempt, created = QuizAttempt.objects.get_or_create(
            student=sp, 
            quiz=quiz,
            defaults={'total_questions': quiz.questions.count(), 'submission_reason': 'left-page'}
        )
        
        return Response({"status": "ok", "attempt_id": attempt.id})
    except (StudentProfile.DoesNotExist, Quiz.DoesNotExist):
        return Response({"detail": "Quiz ou profil introuvable."}, status=404)


@api_view(["POST"])
@permission_classes(DEV_PERMS)
def quizzes_student_attempt_submit(request, id: int):
    try:
        with transaction.atomic():
            sp = StudentProfile.objects.get(user=request.user)
            quiz = Quiz.objects.get(id=id)
            answers_data = request.data.get('answers', {})
            reason = request.data.get('reason', 'manual')
            total_score = 0

            # Récupère la tentative existante
            attempt = QuizAttempt.objects.get(student=sp, quiz=quiz)

            # Supprime les anciennes réponses pour cette tentative pour éviter les doublons
            Answer.objects.filter(attempt=attempt).delete()

            for question_id, answer_value in answers_data.items():
                question = Question.objects.get(id=question_id)
                points = 0

                if question.question_type == 'single':
                    correct_choice = question.choices.filter(is_correct=True).first()
                    if correct_choice and correct_choice.id == answer_value:
                        points = 1

                elif question.question_type == 'multiple':
                    correct_choices = set(question.choices.filter(is_correct=True).values_list('id', flat=True))
                    if isinstance(answer_value, list) and set(answer_value) == correct_choices:
                        points = 1

                answer = Answer.objects.create(
                    attempt=attempt,
                    question=question,
                    answer_text=str(answer_value) if question.question_type == 'text' else ''
                )

                if question.question_type in ['single', 'multiple'] and answer_value:
                    if isinstance(answer_value, list):
                        answer.selected_choices.set(answer_value)
                    else:
                        answer.selected_choices.set([answer_value])
                
                answer.points_obtained = points
                answer.save()
                total_score += points
            
            attempt.score = total_score
            attempt.submitted_at = timezone.now()
            attempt.submission_reason = reason
            attempt.save()

        return Response({"status": "submitted", "score": total_score, "total_questions": attempt.total_questions})

    except QuizAttempt.DoesNotExist:
        return Response({"detail": "Tentative de quiz non trouvée. Veuillez démarrer le quiz d'abord."}, status=404)
    except (StudentProfile.DoesNotExist, Quiz.DoesNotExist, Question.DoesNotExist):
        return Response({"detail": "Erreur: Quiz ou profil introuvable."}, status=404)
    except Exception as e:
        return Response({"detail": f"Une erreur est survenue: {str(e)}"}, status=500)


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
