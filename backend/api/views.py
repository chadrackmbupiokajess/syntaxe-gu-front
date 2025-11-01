from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions
from rest_framework.response import Response
from django.conf import settings
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from datetime import timedelta
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.db import transaction
from django.db.models import Q, Count, Sum
import uuid

from academics.models import Course, Auditoire, Calendrier, CourseAssignment, Section, Departement, CourseMessage, Paiement
from evaluations.models import Assignment, Submission, Quiz, Question, Choice, Answer, QuizAttempt
from rest_framework.permissions import BasePermission, IsAuthenticated # Import BasePermission and IsAuthenticated

User = get_user_model()

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

# Custom Permission for Directeur Général
class IsDirecteurGeneral(BasePermission):
    """Allows access only to Directeur Général users."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'dg'

@api_view(['GET'])
@permission_classes(DEV_PERMS)
def user_list(request):
    users = User.objects.select_related('current_auditoire').all()
    data = []
    for user in users:
        data.append({
            'username': user.matricule, # Using matricule as username
            'matricule': user.matricule,
            'email': user.email,
            'full_name': user.get_full_name(),
            'role': user.get_role_display(),
            'auditoire': user.current_auditoire.name if user.current_auditoire else 'Non assigné',
            'status': user.get_status_display(),
            'team_status': user.team_status,
        })
    return Response(data)

@api_view(["GET"])
@permission_classes(DEV_PERMS)
def auth_me(request):
    user = request.user
    return Response({
        "id": user.id,
        "username": user.matricule,
        "email": user.email,
        "role": user.role, # Changed from "roles": [user.role] to "role": user.role
    })

@api_view(["GET"])
@permission_classes(DEV_PERMS)
def assistant_my_courses(request):
    items = []
    try:
        assignments = CourseAssignment.objects.select_related("course__auditoire__departement").filter(assistant=request.user)
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
    user = request.user

    if request.method == 'POST':
        course_code = request.data.get("course_code")
        title = request.data.get("title", "").strip()
        deadline_s = request.data.get("deadline")
        assignment_type = request.data.get("type", "TP")
        questionnaire = request.data.get("questionnaire", [])
        total_points = request.data.get("total_points", 10)

        if not (course_code and title and deadline_s):
            return Response({"detail": "Code du cours, titre et deadline requis."}, status=400)

        course = Course.objects.filter(code=course_code).first()
        if not course:
            return Response({"detail": f"Cours avec le code {course_code} introuvable."}, status=404)

        if not CourseAssignment.objects.filter(course=course, assistant=user).exists():
            return Response({"detail": "Vous n'êtes pas assigné à ce cours."}, status=403)

        deadline = parse_datetime(deadline_s) if deadline_s else timezone.now() + timedelta(days=7)

        a = Assignment.objects.create(
            course=course,
            assistant=user,
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
    assignments = Assignment.objects.select_related("course__auditoire__departement").filter(assistant=user)
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
        assignment = Assignment.objects.select_related('course__auditoire__departement').get(id=id, assistant=request.user)

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

    except Assignment.DoesNotExist:
        return Response({"detail": "TP/TD non trouvé ou accès non autorisé."}, status=404)


@api_view(['GET', 'POST'])
@permission_classes(DEV_PERMS)
def quizzes_my(request):
    user = request.user

    if request.method == 'POST':
        course_code = request.data.get("course_code")
        title = request.data.get("title", "").strip()
        duration = request.data.get("duration", 20)
        total_points = request.data.get("total_points", 10)
        questions = request.data.get("questions", [])

        if not (course_code and title and questions):
            return Response({"detail": "Code du cours, titre et questions requis."}, status=400)

        course = Course.objects.filter(code=course_code).first()
        if not course:
            return Response({"detail": f"Cours avec le code {course_code} introuvable."}, status=404)

        if not CourseAssignment.objects.filter(course=course, assistant=user).exists():
            return Response({"detail": "Vous n'êtes pas assigné à ce cours."}, status=403)

        quiz = Quiz.objects.create(course=course, assistant=user, title=title, duration=duration, total_points=total_points)

        for q_data in questions:
            question = Question.objects.create(quiz=quiz, question_text=q_data['text'], question_type=q_data['type'])
            if q_data['type'] in ['single', 'multiple']:
                for choice_data in q_data['choices']:
                    Choice.objects.create(question=question, choice_text=choice_data['text'], is_correct=choice_data['is_correct'])

        return Response({"id": quiz.id, "title": quiz.title}, status=201)

    # GET request
    items = []
    quizzes = Quiz.objects.select_related("course__auditoire__departement").filter(assistant=user)
    for q in quizzes:
        items.append({
            "id": q.id,
            "title": q.title,
            "course_name": q.course.name,
            "department": q.course.auditoire.departement.name,
            "auditorium": q.course.auditoire.name,
            "duration": q.duration,
            "total_points": q.total_points,
        })
    return Response(items)

@api_view(['GET', 'DELETE'])
@permission_classes(DEV_PERMS)
def quizzes_my_detail(request, id):
    try:
        assignment = Assignment.objects.select_related('course__auditoire__departement').get(id=id, assistant=request.user)

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

    except Assignment.DoesNotExist:
        return Response({"detail": "TP/TD non trouvé ou accès non autorisé."}, status=404)


@api_view(['GET', 'PATCH'])
@permission_classes(DEV_PERMS)
def assistant_grades(request, auditorium_id, course_code):
    try:
        user = request.user
        auditorium = Auditoire.objects.filter(pk=auditorium_id).first()
        if not auditorium:
            return Response({"detail": f"Auditoire avec ID '{auditorium_id}' non trouvé."}, status=404)

        course = Course.objects.filter(code=course_code, auditoire=auditorium).first()
        if not course:
            return Response({"detail": f"Cours '{course_code}' non trouvé dans l'auditoire '{auditorium.name}'."}, status=404)

        if not CourseAssignment.objects.filter(course=course, assistant=user).exists():
            return Response({"detail": "Accès non autorisé à ce cours."}, status=403)

        if request.method == 'GET':
            students = User.objects.filter(current_auditoire=auditorium, role='etudiant').order_by('last_name', 'first_name')

            submissions = Submission.objects.filter(
                assignment__course=course,
                student__in=students
            ).select_related('student', 'assignment')

            grades_map = {}
            for sub in submissions:
                student_id = sub.student.id
                if student_id not in grades_map or sub.submitted_at > grades_map[student_id]['submitted_at']:
                    grades_map[student_id] = {
                        'grade': sub.grade,
                        'submitted_at': sub.submitted_at,
                        'total_points': getattr(sub.assignment, 'total_points', 10)
                    }

            grades_data = []
            for student in students:
                student_grade_info = grades_map.get(student.id)
                grade = student_grade_info['grade'] if student_grade_info else None
                total_points = student_grade_info['total_points'] if student_grade_info else 10

                grades_data.append({
                    "student_id": student.id,
                    "student_name": student.get_full_name(),
                    "matricule": student.matricule,
                    "avatar": student.profile_picture.url if student.profile_picture else f"https://i.pravatar.cc/128?u={user.id}",
                    "grade": grade,
                    "total_points": total_points,
                })
            return Response(grades_data)

        elif request.method == 'PATCH':
            student_id = request.data.get("student_id")
            grade = request.data.get("grade")

            if student_id is None or grade is None:
                return Response({"detail": "student_id et grade sont requis pour la mise à jour."}, status=400)

            student = User.objects.filter(id=student_id, role='etudiant').first()
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

    except Exception as e:
        return Response({"detail": f"Une erreur inattendue est survenue: {e}"}, status=500)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def assistant_tograde(request):
    items = []
    try:
        user = request.user
        submissions_tptd = Submission.objects.select_related(
            "assignment__course__auditoire__departement",
            "student"
        ).filter(assignment__assistant=user, grade__isnull=True).exclude(status='non_soumis')

        for s in submissions_tptd:
            items.append({
                "id": s.id,
                "type": "TP/TD",
                "title": s.assignment.title,
                "student_name": s.student.get_full_name(),
                "course_name": s.assignment.course.name,
                "auditorium": s.assignment.course.auditoire.name,
                "department": s.assignment.course.auditoire.departement.name,
                "submitted_at": s.submitted_at,
                "assignment_id": s.assignment.id,
            })

        quiz_attempts = QuizAttempt.objects.select_related(
            "quiz__course__auditoire__departement",
            "student"
        ).filter(quiz__assistant=user, correction_status__in=['pending', 'manual'])

        for qa in quiz_attempts:
            items.append({
                "id": qa.id,
                "type": "Quiz",
                "title": qa.quiz.title,
                "student_name": qa.student.get_full_name(),
                "course_name": qa.quiz.course.name,
                "auditorium": qa.quiz.course.auditoire.name,
                "department": qa.quiz.course.auditoire.departement.name,
                "submitted_at": qa.submitted_at,
                "quiz_id": qa.quiz.id,
                "attempt_id": qa.id
            })

    except Exception as e:
        print(f"Error in assistant_tograde: {e}")
        pass
    return Response(items)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def assistant_submission_detail(request, assignment_id: int, submission_id: int):
    try:
        submission = Submission.objects.select_related(
            'assignment__course__auditoire__departement',
            'student',
            'assignment__assistant'
        ).get(id=submission_id, assignment__id=assignment_id)

        if submission.assignment.assistant != request.user:
            return Response({"detail": "Accès non autorisé à cette soumission."}, status=403)

        student = submission.student
        assignment = submission.assignment
        course = assignment.course
        auditoire = course.auditoire
        departement = auditoire.departement

        data = {
            "id": submission.id,
            "assignment_id": assignment.id,
            "assignment_title": assignment.title,
            "assignment_questionnaire": assignment.questionnaire or [],
            "assignment_total_points": assignment.total_points,
            "student_name": student.get_full_name(),
            "student_id": student.id,
            "course_name": course.name,
            "auditorium": auditoire.name,
            "department": departement.name,
            "content": str(submission.content),
            "submitted_at": submission.submitted_at,
            "grade": submission.grade,
            "feedback": submission.feedback,
            "graded_at": submission.graded_at,
            "status": submission.status,
        }
        return Response(data)
    except Submission.DoesNotExist:
        return Response({"detail": "Soumission non trouvée ou accès non autorisé."}, status=404)
    except Exception as e:
        return Response({"detail": f"Une erreur inattendue est survenue: {e}"}, status=500)


@api_view(["POST"])
@permission_classes(DEV_PERMS)
def assistant_grade_submission(request, assignment_id: int, submission_id: int):
    try:
        submission = Submission.objects.select_related('assignment__assistant').get(id=submission_id, assignment__id=assignment_id)

        if submission.assignment.assistant != request.user:
            return Response({"detail": "Accès non autorisé à cette soumission."}, status=403)

        grade = request.data.get("grade")
        feedback = request.data.get("feedback", "").strip()

        if grade is None:
            return Response({"detail": "La note est requise."}, status=400)

        if not (0 <= float(grade) <= submission.assignment.total_points):
             return Response({"detail": f"La note doit être entre 0 et {submission.assignment.total_points}."}, status=400)

        submission.grade = grade
        submission.feedback = feedback
        submission.graded_at = timezone.now()
        submission.status = 'noté'
        submission.save()

        return Response({"detail": "Note et commentaires soumis avec succès.", "grade": submission.grade, "feedback": submission.feedback}, status=200)

    except Submission.DoesNotExist:
        return Response({"detail": "Soumission non trouvée ou accès non autorisé."}, status=404)
    except Exception as e:
        return Response({"detail": f"Une erreur inattendue est survenue: {e}"}, status=500)


@api_view(['GET', 'PATCH'])
@permission_classes(DEV_PERMS)
def assistant_profile(request):
    user = request.user

    if request.method == 'PATCH':
        user.first_name = request.data.get('prenom', user.first_name)
        user.last_name = request.data.get('nom', user.last_name)
        user.email = request.data.get('email', user.email)
        user.phone = request.data.get('phone', user.phone)
        user.office = request.data.get('office', user.office)

        if 'profile_picture' in request.FILES:
            user.profile_picture = request.FILES['profile_picture']

        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        if current_password and new_password:
            if not user.check_password(current_password):
                return Response({"detail": "Mot de passe actuel incorrect."}, status=400)
            user.set_password(new_password)

        user.save()

    # GET or after PATCH
    latest_assignment = CourseAssignment.objects.filter(assistant=user).select_related('course__auditoire__departement__section').first()
    department = ""
    faculty = ""
    if latest_assignment:
        department = latest_assignment.course.auditoire.departement.name
        faculty = latest_assignment.course.auditoire.departement.section.name

    data = {
        "prenom": user.first_name,
        "nom": user.last_name,
        "email": user.email,
        "phone": user.phone,
        "office": user.office,
        "department": department,
        "faculty": faculty,
        "avatar": user.profile_picture.url if user.profile_picture else f"https://i.pravatar.cc/128?u={user.id}",
    }
    return Response(data)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def student_summary(request):
    user = request.user
    program = "N/A"
    creditsEarned = 0
    gpa = 0.0
    if user.current_auditoire and user.current_auditoire.departement and user.current_auditoire.departement.section:
        program = user.current_auditoire.departement.section.name

    submissions = Submission.objects.filter(student=user, grade__isnull=False).select_related('assignment__course')
    successful_courses = set()
    total_points = 0
    total_credits = 0

    for sub in submissions:
        if sub.grade and sub.grade >= 10:
            credits = getattr(sub.assignment.course, 'credits', 3)
            if sub.assignment.course.id not in successful_courses:
                creditsEarned += credits
                successful_courses.add(sub.assignment.course.id)

        if sub.grade is not None:
            total_points += sub.grade
            total_credits += 1

    if total_credits > 0:
        gpa = round(total_points / total_credits, 2)

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
    user = request.user
    auditorium = ""
    auditorium_id = None
    department = ""
    faculty = ""
    if user.current_auditoire:
        auditorium = user.current_auditoire.name
        auditorium_id = user.current_auditoire.id
        dep = user.current_auditoire.departement
        if dep:
            department = dep.name
            if dep.section:
                faculty = dep.section.name
    data = {
        "auditorium": auditorium,
        "auditorium_id": auditorium_id,
        "session": f"{timezone.now().year}-{timezone.now().year + 1}",
        "department": department,
        "faculty": faculty,
        "matricule": user.matricule,
        "email": user.email,
    }
    return Response(data)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def student_grades_recent(request):
    items = []
    subs = Submission.objects.select_related("assignment__course").filter(student=request.user, grade__isnull=False).order_by("-submitted_at")[:10]
    for s in subs:
        items.append({
            "course": s.assignment.course.name if s.assignment and s.assignment.course else "Cours",
            "grade": s.grade,
        })
    return Response(items)


@api_view(['GET', 'PATCH'])
@permission_classes(DEV_PERMS)
def student_profile(request):
    user = request.user

    if request.method == 'PATCH':
        user.first_name = request.data.get('prenom', user.first_name)
        user.last_name = request.data.get('nom', user.last_name)
        user.email = request.data.get('email', user.email)
        user.phone = request.data.get('phone', user.phone)
        user.address = request.data.get('address', user.address)

        if 'profile_picture' in request.FILES:
            user.profile_picture = request.FILES['profile_picture']

        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        if current_password and new_password:
            if not user.check_password(current_password):
                return Response({"detail": "Mot de passe actuel incorrect."}, status=400)
            user.set_password(new_password)

        user.save()

    # GET or after PATCH
    auditorium = ""
    department = ""
    faculty = ""
    if user.current_auditoire:
        auditorium = user.current_auditoire.name
        if user.current_auditoire.departement:
            department = user.current_auditoire.departement.name
            if user.current_auditoire.departement.section:
                faculty = user.current_auditoire.departement.section.name

    data = {
        "avatar": user.profile_picture.url if user.profile_picture else f"https://i.pravatar.cc/128?u={user.id}",
        "name": user.get_full_name(),
        "matricule": user.matricule,
        "email": user.email,
        "phone": user.phone,
        "address": user.address,
        "auditorium": auditorium,
        "session": f"{timezone.now().year}-{timezone.now().year + 1}",
        "department": department,
        "faculty": faculty,
    }
    return Response(data)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def assistant_summary(request):
    user = request.user
    data = {"courses": 0, "activeTPTD": 0, "activeQuizzes": 0, "toGrade": 0, "auditoriums": []}
    q_assign = CourseAssignment.objects.select_related("course__auditoire").filter(assistant=user)
    data["courses"] = q_assign.count()
    data["activeTPTD"] = Assignment.objects.filter(assistant=user, deadline__gte=timezone.now()).count()
    data["activeQuizzes"] = Quiz.objects.filter(assistant=user).count()
    data["toGrade"] = Submission.objects.filter(assignment__assistant=user, grade__isnull=True, status='soumis').count()
    aud_ids = q_assign.values_list("course__auditoire", flat=True).distinct()
    auds = Auditoire.objects.filter(id__in=aud_ids).select_related("departement")
    for a in auds:
        students = User.objects.filter(current_auditoire=a, role='etudiant').count()
        data["auditoriums"].append({
            "code": a.name,
            "students": students,
            "department": a.departement.name if a.departement else ""
        })
    return Response(data)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def auditoriums_assistant_my(request):
    items = []
    user = request.user
    aud_ids = CourseAssignment.objects.filter(assistant=user).values_list("course__auditoire", flat=True).distinct()
    for a in Auditoire.objects.filter(id__in=aud_ids):
        students = User.objects.filter(current_auditoire=a, role='etudiant').count()
        course_count = CourseAssignment.objects.filter(assistant=user, course__auditoire=a).count()
        dept = getattr(a.departement, "name", "")
        items.append({"id": a.id, "code": a.name, "name": a.name, "department": dept, "students": students, "course_count": course_count})
    return Response(items)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def assistant_student_detail(request, id: int):
    try:
        student = User.objects.get(id=id, role='etudiant')
        total_grade_obtained = 0
        total_possible_points = 0

        submissions = Submission.objects.filter(student=student, grade__isnull=False).select_related('assignment')
        for sub in submissions:
            total_grade_obtained += sub.grade
            total_possible_points += getattr(sub.assignment, 'total_points', 20)

        data = {
            "id": student.id,
            "name": student.get_full_name(),
            "email": student.email,
            "auditorium": student.current_auditoire.name if student.current_auditoire else "",
            "total_grade_obtained": total_grade_obtained,
            "total_possible_points": total_possible_points,
        }
        return Response(data)
    except User.DoesNotExist:
        return Response({}, status=404)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def assistant_student_grades(request, id: int):
    rows = []
    try:
        student = User.objects.get(id=id, role='etudiant')
        subs = Submission.objects.select_related("assignment__course").filter(student=student, grade__isnull=False)
        by_course = {}
        for s in subs:
            cname = s.assignment.course.name if s.assignment and s.assignment.course else ""
            if not cname:
                continue
            by_course.setdefault(cname, []).append(s.grade)
        for cname, grades in by_course.items():
            if grades:
                rows.append({"name": cname, "grade": round(sum(grades) / len(grades), 2)})
    except User.DoesNotExist:
        pass
    return Response(rows)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def assistant_student_submissions(request, id: int):
    rows = []
    try:
        student = User.objects.get(id=id, role='etudiant')
        subs = Submission.objects.select_related("assignment").filter(student=student).order_by("-submitted_at")[:50]
        for s in subs:
            rows.append({
                "title": s.assignment.title if s.assignment else "",
                "status": s.status,
                "grade": s.grade,
                "submitted_at": s.submitted_at,
            })
    except User.DoesNotExist:
        pass
    return Response(rows)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def assistant_auditorium_courses(request, code: str):
    rows = []
    course_ids = set()
    try:
        auditorium_id = int(code)
        aud = Auditoire.objects.filter(pk=auditorium_id).first()
        if aud:
            assignments = CourseAssignment.objects.filter(
                assistant=request.user,
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
    except (ValueError, TypeError):
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
            qs = User.objects.filter(current_auditoire=aud, role='etudiant')
            for s in qs:
                total_grade_obtained = 0
                total_possible_points = 0

                submissions = Submission.objects.filter(student=s, grade__isnull=False).select_related('assignment')
                for sub in submissions:
                    total_grade_obtained += sub.grade
                    total_possible_points += getattr(sub.assignment, 'total_points', 20)

                rows.append({
                    "id": s.id,
                    "name": s.get_full_name(),
                    "email": s.email,
                    "auditorium": s.current_auditoire.name if s.current_auditoire else "",
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
            students_qs = User.objects.filter(current_auditoire=aud, role='etudiant')
            data["totalStudents"] = students_qs.count()
            data["department"] = aud.departement.name if aud.departement else "N/A"
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


@api_view(["GET", "POST"])
@permission_classes(DEV_PERMS)
def student_messages(request):
    user = request.user
    if not user.current_auditoire:
        return Response({"detail": "L'étudiant n'est pas assigné à un auditoire."}, status=403)

    aud = user.current_auditoire

    if request.method == "GET":
        msgs = CourseMessage.objects.select_related("course", "sender").filter(course__auditoire=aud).order_by("created_at")[:100]
        out = []
        for m in msgs:
            out.append({
                "id": m.id,
                "courseId": m.course_id,
                "course": m.course.name if m.course else "",
                "title": m.title,
                "body": m.body,
                "created_at": m.created_at.isoformat() if m.created_at else "",
                "sender": m.sender.get_full_name() if m.sender else "Inconnu",
                "sender_type": m.sender.get_role_display() if m.sender else "Utilisateur",
                "sender_id": m.sender_id,
            })
        return Response(out)

    # POST request
    course_id = request.data.get("course_id")
    body = request.data.get("body", "").strip()

    if not (course_id and body):
        return Response({"detail": "course_id et body requis"}, status=400)

    course = Course.objects.filter(id=course_id, auditoire=aud).first()
    if not course:
        return Response({"detail": "Cours introuvable dans cet auditoire"}, status=404)

    msg = CourseMessage.objects.create(course=course, sender=user, title="", body=body)

    return Response({
        "id": msg.id,
        "courseId": msg.course_id,
        "course": msg.course.name if msg.course else "",
        "title": msg.title,
        "body": msg.body,
        "created_at": msg.created_at.isoformat() if msg.created_at else "",
        "sender": user.get_full_name(),
        "sender_type": user.get_role_display(),
        "sender_id": user.id,
    }, status=201)


@api_view(["POST"])
@permission_classes(DEV_PERMS)
def assistant_auditorium_create_tptd(request, code: str):
    try:
        auditorium_id = int(code)
        aud = Auditoire.objects.filter(pk=auditorium_id).first()
        if not aud:
            return Response({"detail": "Auditoire introuvable"}, status=404)

        course_id = request.data.get("course_id")
        title = (request.data.get("title") or "").strip()
        deadline_s = request.data.get("deadline")
        questionnaire = request.data.get("questionnaire", [])
        total_points = request.data.get("total_points", 10)

        if not (course_id and title and deadline_s):
            return Response({"detail": "course_id, title, deadline requis"}, status=400)

        course = Course.objects.filter(id=course_id, auditoire=aud).first()
        if not course:
            return Response({"detail": "Cours introuvable dans cet auditoire"}, status=404)

        deadline = parse_datetime(deadline_s) or timezone.now() + timedelta(days=7)
        a = Assignment.objects.create(course=course, assistant=request.user, title=title, questionnaire=questionnaire, total_points=total_points, deadline=deadline)
        return Response({"id": a.id, "title": a.title, "deadline": a.deadline.isoformat()}, status=201)
    except (ValueError, TypeError):
        return Response({"detail": "Code d'auditoire invalide"}, status=400)
    except Exception as e:
        return Response({"detail": f"Erreur de création TP/TD: {e}"}, status=400)


@api_view(["POST"])
@permission_classes(DEV_PERMS)
def assistant_auditorium_create_quiz(request, code: str):
    try:
        auditorium_id = int(code)
        aud = Auditoire.objects.filter(pk=auditorium_id).first()
        if not aud:
            return Response({"detail": "Auditoire introuvable"}, status=404)

        course_id = request.data.get("course_id")
        title = (request.data.get("title") or "").strip()
        duration = int(request.data.get("duration") or 0)
        questions_data = request.data.get("questions", [])

        if not (course_id and title and duration and questions_data):
            return Response({"detail": "course_id, title, duration et questions requis"}, status=400)

        course = Course.objects.filter(id=course_id, auditoire=aud).first()
        if not course:
            return Response({"detail": "Cours introuvable dans cet auditoire"}, status=404)

        q = Quiz.objects.create(course=course, assistant=request.user, title=title, duration=duration)

        for q_data in questions_data:
            question = Question.objects.create(quiz=q, question_text=q_data['text'], question_type=q_data['type'])
            if q_data['type'] in ['single', 'multiple']:
                for choice_data in q_data['choices']:
                    Choice.objects.create(question=question, choice_text=choice_data['text'], is_correct=choice_data['is_correct'])

        return Response({"id": q.id, "title": q.title, "duration": q.duration}, status=201)
    except (ValueError, TypeError):
        return Response({"detail": "Code d'auditoire invalide"}, status=400)
    except Exception as e:
        return Response({"detail": f"Erreur de création du quiz: {e}"}, status=400)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def student_notifications(request):
    return Response([])


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def teacher_profile(request):
    return Response({})


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def quizzes_student_available(request):
    items = []
    user = request.user
    if user.current_auditoire:
        attempted_quiz_ids = QuizAttempt.objects.filter(student=user).values_list('quiz_id', flat=True)
        qs = Quiz.objects.select_related("course", "assistant").filter(course__auditoire=user.current_auditoire).exclude(id__in=attempted_quiz_ids)

        for q in qs:
            deadline = (q.created_at or timezone.now()) + timedelta(days=7)
            assistant_name = q.assistant.get_full_name() if q.assistant else "N/A"
            items.append({
                "id": q.id,
                "title": q.title,
                "duration": q.duration,
                "deadline": deadline,
                "course_name": q.course.name,
                "session_type": q.course.get_session_type_display(),
                "assistant_name": assistant_name,
            })
    return Response(items)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def tptd_student_available(request):
    items = []
    user = request.user
    if user.current_auditoire:
        submitted_assignment_ids = Submission.objects.filter(student=user).values_list('assignment_id', flat=True)
        qs = Assignment.objects.select_related("course", "assistant").filter(
            course__auditoire=user.current_auditoire
        ).exclude(
            id__in=submitted_assignment_ids
        )

        for a in qs:
            assistant_name = a.assistant.get_full_name() if a.assistant else "N/A"
            items.append({
                "id": a.id,
                "title": a.title,
                "type": a.course.get_session_type_display(),
                "deadline": a.deadline,
                "course_name": a.course.name,
                "assistant_name": assistant_name,
            })
    return Response(items)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def tptd_student_detail(request, id):
    try:
        user = request.user
        assignment = Assignment.objects.select_related('course__auditoire').get(id=id)

        if user.current_auditoire != assignment.course.auditoire:
            return Response({"detail": "Accès non autorisé à ce devoir."}, status=403)

        data = {
            "id": assignment.id,
            "title": assignment.title,
            "course_name": assignment.course.name,
            "session_type": assignment.course.get_session_type_display(),
            "deadline": assignment.deadline,
            "questionnaire": assignment.questionnaire,
        }
        return Response(data)

    except Assignment.DoesNotExist:
        return Response({"detail": "Devoir non trouvé ou accès non autorisé."}, status=404)

@api_view(['GET'])
@permission_classes(DEV_PERMS)
def quizzes_student_detail(request, id):
    try:
        user = request.user
        quiz = Quiz.objects.select_related('course__auditoire', 'assistant').get(id=id)

        if user.current_auditoire != quiz.course.auditoire:
            return Response({"detail": "Accès non autorisé à ce quiz."}, status=403)

        questions = []
        for q in quiz.questions.all():
            choices = []
            if q.question_type in ['single', 'multiple']:
                for c in q.choices.all():
                    choices.append({"text": c.choice_text, "is_correct": c.is_correct})
            questions.append({"text": q.question_text, "type": q.question_type, "choices": choices})

        assistant_name = quiz.assistant.get_full_name() if quiz.assistant else "N/A"
        deadline = (quiz.created_at or timezone.now()) + timedelta(days=7)

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

    except Quiz.DoesNotExist:
        return Response({"detail": "Quiz non trouvé ou accès non autorisé."}, status=404)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def quizzes_student_my_attempts(request):
    items = []
    attempts = QuizAttempt.objects.select_related('quiz__course', 'quiz__assistant').filter(student=request.user).order_by('-submitted_at')
    for a in attempts:
        assistant_name = a.quiz.assistant.get_full_name() if a.quiz.assistant else "N/A"
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
    return Response(items)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def tptd_student_my_submissions(request):
    items = []
    user = request.user
    if user.current_auditoire:
        overdue_assignments = Assignment.objects.filter(
            course__auditoire=user.current_auditoire,
            deadline__lt=timezone.now()
        ).exclude(submissions__student=user)

        for assignment in overdue_assignments:
            Submission.objects.create(
                assignment=assignment,
                student=user,
                status='non-soumis',
                grade=0,
                submitted_at=assignment.deadline
            )

        subs = Submission.objects.select_related("assignment", "assignment__course", "assignment__assistant").filter(student=user).order_by("-submitted_at")[:20]
        for s in subs:
            assistant_name = s.assignment.assistant.get_full_name() if s.assignment.assistant else "N/A"
            items.append({
                "id": s.id,
                "title": s.assignment.title if s.assignment else "",
                "submitted_at": s.submitted_at,
                "grade": s.grade,
                "total_points": s.assignment.total_points if s.assignment else 20,
                "status": s.status,
                "course_name": s.assignment.course.name if s.assignment and s.assignment.course else "",
                "session_type": s.assignment.course.get_session_type_display() if s.assignment and s.assignment.course else "",
                "assistant_name": assistant_name,
            })
    return Response(items)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def student_courses(request):
    rows = []
    user = request.user
    if user.current_auditoire:
        for c in Course.objects.filter(auditoire=user.current_auditoire).select_related("auditoire"):
            code = f"{c.name[:3].upper()}-{c.id}"
            title = c.name
            credits = c.credits
            assign = CourseAssignment.objects.filter(course=c).select_related("assistant").first()

            instructor = assign.assistant.get_full_name() if assign and assign.assistant else "N/A"

            rows.append({
                "id": c.id,
                "code": code,
                "title": title,
                "credits": credits,
                "instructor": instructor,
                "session_type": c.get_session_type_display(),
                "auditorium_id": user.current_auditoire.id,
                "auditorium_name": user.current_auditoire.name,
            })
    return Response(rows)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def student_calendar(request):
    return Response([])


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def library_catalog(request):
    return Response([])


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def library_myloans(request):
    return Response([])


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def student_grades_all(request):
    return Response([])


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def student_documents(request):
    return Response([])


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def payments_mine(request):
    return Response([])


@api_view(["POST"])
@permission_classes(DEV_PERMS)
def quizzes_student_start(request, id: int):
    try:
        user = request.user
        quiz = Quiz.objects.get(id=id)

        attempt, created = QuizAttempt.objects.get_or_create(
            student=user,
            quiz=quiz,
            defaults={'total_questions': quiz.questions.count(), 'submission_reason': 'manual'}
        )

        return Response({"status": "ok", "attempt_id": attempt.id})
    except Quiz.DoesNotExist:
        return Response({"detail": "Quiz ou profil introuvable."}, status=404)


@api_view(["POST"])
@permission_classes(DEV_PERMS)
def quizzes_student_attempt_submit(request, id: int):
    try:
        with transaction.atomic():
            user = request.user
            quiz = Quiz.objects.get(id=id)
            answers_data = request.data.get('answers', {})
            reason = request.data.get('reason', 'manual')

            attempt = QuizAttempt.objects.get(student=user, quiz=quiz)
            attempt.submission_reason = reason

            Answer.objects.filter(attempt=attempt).delete()

            total_score = 0
            should_auto_grade = attempt.submission_reason in ['time-out', 'left-page']

            for question_id, answer_value in answers_data.items():
                question = Question.objects.get(id=question_id)
                points = None

                if should_auto_grade:
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
                        answer_text=str(answer_value) if question.question_type == 'text' else '',
                        points_obtained=points
                    )

                    if question.question_type in ['single', 'multiple'] and answer_value:
                        if isinstance(answer_value, list):
                            answer.selected_choices.set(answer_value)
                        else:
                            answer.selected_choices.set([answer_value])

                    if should_auto_grade and points is not None:
                        total_score += points

            attempt.score = total_score if should_auto_grade else None
            attempt.submitted_at = timezone.now()
            attempt.save()

        response_data = {
            "status": "submitted",
            "correction_status": attempt.correction_status,
            "total_questions": attempt.total_questions
        }
        if should_auto_grade:
            response_data["score"] = attempt.score

        return Response(response_data)

    except QuizAttempt.DoesNotExist:
        return Response({"detail": "Tentative de quiz non trouvée. Veuillez démarrer le quiz d'abord."}, status=404)
    except (Quiz.DoesNotExist, Question.DoesNotExist):
        return Response({"detail": "Erreur: Quiz ou profil introuvable."}, status=404)
    except Exception as e:
        return Response({"detail": f"Une erreur est survenue: {str(e)}"}, status=500)


@api_view(["POST"])
@permission_classes(DEV_PERMS)
def tptd_student_submit(request, id: int):
    try:
        user = request.user
        a = Assignment.objects.get(id=id)
        content = request.data.get('content', '')
        Submission.objects.create(
            assignment=a,
            student=user,
            content=content,
            status='soumis',
            submitted_at=timezone.now(),
        )
        return Response({"status": "submitted"})
    except Exception as e:
        return Response({"status": "error"}, status=500)


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
@permission_classes([IsAuthenticated, IsDirecteurGeneral]) # Apply custom permission
def dg_summary(request):
    total_students = User.objects.filter(role='etudiant').count()
    total_teachers = User.objects.filter(Q(role='professeur') | Q(role='assistant')).count()
    total_departments = Departement.objects.count()
    total_auditoires = Auditoire.objects.count()
    total_revenue = Paiement.objects.aggregate(Sum('amount'))['amount__sum'] or 0

    data = {
        "totalStudents": total_students,
        "totalTeachers": total_teachers,
        "totalDepartments": total_departments,
        "totalAuditoires": total_auditoires,
        "totalRevenue": total_revenue,
        "decisionsPending": 6, # Placeholder for now
        "projects": 14,        # Placeholder for now
        "budgetUsed": 62,      # Placeholder for now
        "satisfaction": 82,    # Placeholder for now
    }
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsDirecteurGeneral]) # Apply custom permission
def dg_actions(request):
    actions = []

    # 1. Recent Course Creations (as a proxy for program approvals)
    recent_courses = Course.objects.select_related('auditoire__departement').order_by('-id')[:5]
    for course in recent_courses:
        actions.append({
            "id": f"course-{course.id}",
            "type": "Création de Cours",
            "description": f"Nouveau cours \"{course.name}\" ({course.code}) dans {course.auditoire.name} ({course.auditoire.departement.name}).",
            "date": course.id, # Using ID as a proxy for creation date for now
            "status": "À examiner",
        })

    # 2. Recent Course Assignments (as a proxy for course distribution validation)
    recent_assignments = CourseAssignment.objects.select_related('course__auditoire__departement', 'assistant').order_by('-id')[:5]
    for assignment in recent_assignments:
        actions.append({
            "id": f"assign-{assignment.id}",
            "type": "Affectation de Cours",
            "description": f"Cours \"{assignment.course.name}\" assigné à {assignment.assistant.get_full_name()} dans {assignment.course.auditoire.name}.",
            "date": assignment.id, # Using ID as a proxy for creation date for now
            "status": "À examiner",
        })

    # 3. Recent Payments (for financial oversight)
    recent_payments = Paiement.objects.select_related('student').order_by('-date_paid')[:5]
    for payment in recent_payments:
        actions.append({
            "id": f"payment-{payment.id}",
            "type": "Paiement Reçu",
            "description": f"Paiement de {payment.amount} USD reçu de {payment.student.get_full_name()} pour la {payment.tranche_number}e tranche.",
            "date": payment.date_paid.strftime("%Y-%m-%d %H:%M"),
            "status": "Complet",
        })

    # Sort actions by date (or ID as a proxy for now), most recent first
    actions.sort(key=lambda x: x['date'], reverse=True)

    return Response(actions)


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


# ---- Section Head Dashboard ----

@api_view(["GET"])
@permission_classes(DEV_PERMS)
def section_summary(request):
    user = request.user
    # We assume the user is a Section Head and is linked to a Section.
    # This link is not in the models, so we'll get the first section for demonstration.
    try:
        section = user.section_head_of
    except AttributeError:
        # If the user is not a section head, or the relation is not defined,
        # we'll use the first Section as a fallback for demonstration.
        section = Section.objects.first()
        if not section:
            return Response({"error": "No sections found in the database."}, status=404)

    # Count students in the section
    student_count = User.objects.filter(
        role='etudiant',
        current_auditoire__departement__section=section
    ).count()

    # Count teachers (Professeurs and Assistants) in the section
    teacher_count = User.objects.filter(
        Q(role='professeur') | Q(role='assistant'),
        course_assignments__course__auditoire__departement__section=section
    ).distinct().count()

    # Count departments in the section
    department_count = Departement.objects.filter(section=section).count()

    # Mock data for trends and success rate
    # In a real app, you would calculate this from historical data.
    data = {
        "students": {
            "val": student_count,
            "trend": [60, 70, 80, 75, student_count / 5] # Dummy trend
        },
        "teachers": {
            "val": teacher_count,
            "trend": [80, 75, 78, 85, teacher_count / 2] # Dummy trend
        },
        "departments": department_count,
        "successRate": {
            "val": "85%", # Dummy value
            "trend": [70, 75, 85, 82, 85] # Dummy trend
        }
    }
    return Response(data)

@api_view(["GET"])
@permission_classes(DEV_PERMS)
def section_list(request):
    sections = Section.objects.all()
    data = []
    for section in sections:
        data.append({
            "id": section.id,
            "name": section.name,
            "description": section.description, # Assuming a description field exists
        })
    return Response(data)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def section_teachers_list(request):
    user = request.user
    # TEMPORARY: Fetch all teachers to ensure frontend connectivity.
    # TODO: Refine this to only fetch teachers from the user's section.
    teachers = User.objects.filter(
        Q(role='professeur') | Q(role='assistant')
    ).distinct()

    data = []
    for teacher in teachers:
        # Try to find a department, but don't require it.
        assignment = teacher.course_assignments.select_related('course__auditoire__departement').first()
        department = "Non assigné"
        if assignment and assignment.course and assignment.course.auditoire and assignment.course.auditoire.departement:
            department = assignment.course.auditoire.departement.name

        data.append({
            "id": teacher.id,
            "name": teacher.get_full_name(),
            "rank": teacher.get_role_display(), # Assuming rank is equivalent to role
            "courses": course_names,
            "status": teacher.get_status_display(), # Assuming a status field exists
        })
    return Response(data)

@api_view(["GET"])
@permission_classes(DEV_PERMS)
def section_students_list(request):
    user = request.user
    try:
        section = user.section_head_of
    except AttributeError:
        section = Section.objects.first()
        if not section:
            return Response({"error": "No sections found."}, status=404)

    students = User.objects.filter(
        role='etudiant',
        current_auditoire__departement__section=section
    ).select_related('current_auditoire__departement')

    data = []
    for student in students:
        promotion = "N/A"
        if student.current_auditoire:
            promotion = student.current_auditoire.name
            if student.current_auditoire.departement:
                department = student.current_auditoire.departement.name

        data.append({
            "id": student.id,
            "name": student.get_full_name(),
            "matricule": student.matricule,
            "promotion": promotion,
            "progress": 75,  # Dummy progress
        })

    return Response(data)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def section_departments_list(request):
    user = request.user
    try:
        section = user.section_head_of
    except AttributeError:
        section = Section.objects.first()
        if not section:
            return Response({"error": "No sections found."}, status=404)

    departments = Departement.objects.filter(section=section)
    data = []
    for department in departments:
        data.append({
            "id": department.id,
            "name": department.name,
        })
    return Response(data)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def section_courses_list(request):
    user = request.user
    try:
        section = user.section_head_of
    except AttributeError:
        section = Section.objects.first()
        if not section:
            return Response({"error": "No sections found."}, status=404)

    courses = Course.objects.filter(auditoire__departement__section=section).select_related('auditoire__departement')
    data = []
    for course in courses:
        teacher_name = "Non assigné"
        assignment = CourseAssignment.objects.filter(course=course).select_related('assistant').first()
        if assignment and assignment.assistant:
            teacher_name = assignment.assistant.get_full_name()

        data.append({
            "id": course.id,
            "code": course.code,
            "intitule": course.name,
            "departement": course.auditoire.departement.name,
            "credits": course.credits,
            "semestre": course.session_type,
            "teacher": teacher_name,
        })
    return Response(data)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def department_summary(request):
    user = request.user
    try:
        department = user.department_head_of
    except AttributeError:
        department = Departement.objects.first()
        if not department:
            return Response({"error": "No departments found in the database."}, status=404)

    student_count = User.objects.filter(
        role='etudiant',
        current_auditoire__departement=department
    ).count()

    teacher_count = User.objects.filter(
        Q(role='professeur') | Q(role='assistant'),
        course_assignments__course__auditoire__departement=department
    ).distinct().count()

    course_count = Course.objects.filter(auditoire__departement=department).count()

    data = {
        "students": {
            "val": student_count,
            "trend": [50, 55, 60, 58, student_count / 5]
        },
        "teachers": {
            "val": teacher_count,
            "trend": [10, 12, 11, 13, teacher_count / 2]
        },
        "courses": course_count,
        "successRate": {
            "val": "80%",
            "trend": [65, 70, 80, 78, 80]
        }
    }
    return Response(data)

@api_view(["GET"])
@permission_classes(DEV_PERMS)
def department_students_list(request):
    user = request.user
    try:
        department = user.department_head_of
    except AttributeError:
        department = Departement.objects.first()
        if not department:
            return Response({"error": "No departments found."}, status=404)

    students = User.objects.filter(
        role='etudiant',
        current_auditoire__departement=department
    ).select_related('current_auditoire')

    data = []
    for student in students:
        promotion = "N/A"
        if student.current_auditoire:
            promotion = student.current_auditoire.name

        data.append({
            "id": student.id,
            "name": student.get_full_name(),
            "matricule": student.matricule,
            "promotion": promotion,
            "progress": 75,  # Dummy progress
        })

    return Response(data)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def department_teachers_list(request):
    user = request.user
    try:
        department = user.department_head_of
    except AttributeError:
        department = Departement.objects.first()
        if not department:
            return Response({"error": "No departments found."}, status=404)

    teachers = User.objects.filter(
        Q(role='professeur') | Q(role='assistant'),
        course_assignments__course__auditoire__departement=department
    ).distinct().select_related('current_auditoire')

    data = []
    for teacher in teachers:
        courses_assigned = CourseAssignment.objects.filter(assistant=teacher, course__auditoire__departement=department).select_related('course')
        course_names = ", ".join([ca.course.name for ca in courses_assigned])

        data.append({
            "id": teacher.id,
            "name": teacher.get_full_name(),
            "rank": teacher.get_role_display(), # Assuming rank is equivalent to role
            "courses": course_names,
            "status": teacher.get_status_display(), # Assuming a status field exists
        })
    return Response(data)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def department_activities_list(request):
    user = request.user
    try:
        department = user.department_head_of
    except AttributeError:
        department = Departement.objects.first()
        if not department:
            return Response({"error": "No departments found."}, status=404)

    activities = []

    # Fetch recent course messages related to the department
    messages = CourseMessage.objects.filter(
        course__auditoire__departement=department
    ).order_by('-created_at')[:5] # Limit to 5 recent messages

    for msg in messages:
        activities.append({
            "id": f"msg-{msg.id}",
            "text": f"{msg.sender.get_full_name()} a posté un message dans {msg.course.name}: {msg.body[:50]}...",
            "type": "info",
            "date": msg.created_at.strftime("%Y-%m-%d %H:%M"),
        })

    # Fetch recent assignment submissions/creations related to the department
    assignments = Assignment.objects.filter(
        course__auditoire__departement=department
    ).order_by('-created_at')[:5] # Limit to 5 recent assignments

    for assign in assignments:
        activities.append({
            "id": f"assign-{assign.id}",
            "text": f"Nouvel {assign.type} \"{assign.title}\" pour {assign.course.name} (échéance: {assign.deadline.strftime("%Y-%m-%d")}).",
            "type": "warning",
            "date": assign.created_at.strftime("%Y-%m-%d %H:%M"),
        })

    # Sort activities by date, most recent first
    activities.sort(key=lambda x: x['date'], reverse=True)

    return Response(activities[:10]) # Return top 10 most recent activities


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def department_courses_list(request):
    user = request.user
    try:
        department = user.department_head_of
    except AttributeError:
        department = Departement.objects.first()
        if not department:
            return Response({"error": "No departments found."}, status=404)

    courses_queryset = Course.objects.filter(
        auditoire__departement=department
    ).select_related('auditoire__departement')

    session_type_filter = request.query_params.get('session_type')
    auditoire_id_filter = request.query_params.get('auditoire_id')

    if session_type_filter:
        courses_queryset = courses_queryset.filter(session_type=session_type_filter)
    if auditoire_id_filter:
        courses_queryset = courses_queryset.filter(auditoire__id=auditoire_id_filter)

    data = []
    for course in courses_queryset:
        teacher_name = "Non assigné"
        assignment = CourseAssignment.objects.filter(course=course).select_related('assistant').first()
        if assignment and assignment.assistant:
            teacher_name = assignment.assistant.get_full_name()

        data.append({
            "id": course.id,
            "code": course.code,
            "intitule": course.name,
            "departement": course.auditoire.departement.name,
            "credits": course.credits,
            "semestre": course.session_type, # Assuming session_type can be S1/S2
            "teacher": teacher_name,
            "auditoire_id": course.auditoire.id,
            "auditoire_name": course.auditoire.name,
        })

    return Response(data)


@api_view(["GET"])
@permission_classes(DEV_PERMS)
def department_auditoriums_list(request):
    user = request.user
    try:
        department = user.department_head_of
    except AttributeError:
        department = Departement.objects.first()
        if not department:
            return Response({"error": "No departments found."}, status=404)

    auditoriums = Auditoire.objects.filter(departement=department)

    data = []
    for auditoire in auditoriums:
        data.append({
            "id": auditoire.id,
            "name": auditoire.name,
        })
    return Response(data)


@api_view(["POST"])
@permission_classes(DEV_PERMS)
def department_course_create(request):
    user = request.user
    try:
        department = user.department_head_of
    except AttributeError:
        department = Departement.objects.first()
        if not department:
            return Response({"error": "No departments found."}, status=404)

    intitule = request.data.get("intitule")
    semestre = request.data.get("semestre")
    credits = request.data.get("credits")
    teacher_id = request.data.get("teacher") # This will be the teacher's ID
    auditoire_id = request.data.get("auditoire_id") # Assuming auditoire is passed for course creation

    if not all([intitule, semestre, credits, teacher_id, auditoire_id]):
        return Response({"detail": "Intitulé, semestre, crédits, enseignant et auditoire sont requis."}, status=400)

    try:
        teacher = User.objects.get(id=teacher_id, role__in=['professeur', 'assistant'])
        auditoire = Auditoire.objects.get(id=auditoire_id, departement=department)
    except User.DoesNotExist:
        return Response({"detail": "Enseignant non trouvé."}, status=404)
    except Auditoire.DoesNotExist:
        return Response({"detail": "Auditoire non trouvé dans ce département."}, status=404)

    # Generate a unique 8-character hexadecimal code
    code = uuid.uuid4().hex[:8].upper()
    while Course.objects.filter(code=code, auditoire=auditoire).exists():
        code = uuid.uuid4().hex[:8].upper()

    with transaction.atomic():
        course = Course.objects.create(
            code=code,
            name=intitule,
            session_type=semestre,
            credits=credits,
            auditoire=auditoire,
        )
        CourseAssignment.objects.create(course=course, assistant=teacher)

    return Response({
        "id": course.id,
        "code": course.code,
        "intitule": course.name,
        "departement": course.auditoire.departement.name,
        "credits": course.credits,
        "semestre": course.session_type,
        "teacher": teacher.get_full_name(),
        "auditoire_id": course.auditoire.id,
        "auditoire_name": course.auditoire.name,
    }, status=201)


# ---- New Department Endpoints ----

@api_view(["GET"])
@permission_classes(DEV_PERMS)
def department_auditoires_with_courses(request):
    user = request.user
    try:
        department = user.department_head_of
    except AttributeError:
        department = Departement.objects.first()
        if not department:
            return Response({"error": "No departments found."}, status=404)

    auditoires_data = []
    auditoires = Auditoire.objects.filter(departement=department).prefetch_related('courses')

    for auditoire in auditoires:
        courses_data = []
        for course in auditoire.courses.all():
            courses_data.append({
                "id": course.id,
                "name": course.name,
            })
        auditoires_data.append({
            "id": auditoire.id,
            "name": auditoire.name,
            "courses": courses_data,
        })
    return Response(auditoires_data)


@api_view(["POST"])
@permission_classes(DEV_PERMS)
def department_assign_course(request):
    user = request.user
    try:
        department = user.department_head_of
    except AttributeError:
        department = Departement.objects.first()
        if not department:
            return Response({"error": "No departments found."}, status=404)

    teacher_id = request.data.get("teacherId")
    auditoire_id = request.data.get("auditoireId")
    course_id = request.data.get("courseId")

    if not all([teacher_id, auditoire_id, course_id]):
        return Response({"detail": "teacherId, auditoireId et courseId sont requis."}, status=400)

    try:
        teacher = User.objects.get(id=teacher_id, role='assistant')
    except User.DoesNotExist:
        return Response({"detail": "Assistant non trouvé."}, status=404)

    try:
        auditoire = Auditoire.objects.get(id=auditoire_id, departement=department)
    except Auditoire.DoesNotExist:
        return Response({"detail": "Auditoire non trouvé dans ce département."}, status=404)

    try:
        course = Course.objects.get(id=course_id, auditoire=auditoire)
    except Course.DoesNotExist:
        return Response({"detail": "Cours non trouvé dans cet auditoire."}, status=404)

    # Check if assignment already exists
    if CourseAssignment.objects.filter(assistant=teacher, course=course).exists():
        return Response({"detail": "Cet assistant est déjà assigné à ce cours."}, status=409)

    with transaction.atomic():
        CourseAssignment.objects.create(assistant=teacher, course=course)

    return Response({"detail": "Cours assigné avec succès."}, status=201)


# ---- Endpoints Département (placeholders)

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
