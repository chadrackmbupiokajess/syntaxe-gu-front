from django.urls import include, re_path, path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    health, student_summary, student_meta, student_grades_recent, student_profile,
    # Vues ajoutées
    assistant_summary, auditoriums_assistant_my, tptd_my, quizzes_my, assistant_tograde,
    student_notifications, teacher_profile,
    # Endpoints manquants (student/library/payments)
    quizzes_student_available, tptd_student_available, quizzes_student_my_attempts, tptd_student_my_submissions,
    student_courses, student_calendar, library_catalog, library_myloans, student_grades_all,
    student_documents, payments_mine
)

urlpatterns = [
    re_path(r"^health/?$", health, name="health"),
    re_path(r"^auth/token/?$", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    re_path(r"^auth/token/refresh/?$", TokenRefreshView.as_view(), name="token_refresh"),
    # Note: l'endpoint /api/auth/me/ est fourni par l'app 'accounts'.
    # On évite toute duplication ici pour prévenir des conflits de résolution d'URL.

    # Student endpoints used by the frontend dashboards
    re_path(r"^student/summary/?$", student_summary, name="student_summary"),
    re_path(r"^student/meta/?$", student_meta, name="student_meta"),
    re_path(r"^student/grades/recent/?$", student_grades_recent, name="student_grades_recent"),
    re_path(r"^student/profile/?$", student_profile, name="student_profile"),
    re_path(r"^student/notifications/?$", student_notifications, name="student_notifications"),

    # Student additional endpoints to satisfy frontend
    re_path(r"^quizzes/student/available/?$", quizzes_student_available, name="quizzes_student_available"),
    re_path(r"^tptd/student/available/?$", tptd_student_available, name="tptd_student_available"),
    re_path(r"^quizzes/student/my-attempts/?$", quizzes_student_my_attempts, name="quizzes_student_my_attempts"),
    re_path(r"^tptd/student/my-submissions/?$", tptd_student_my_submissions, name="tptd_student_my_submissions"),
    re_path(r"^student/courses/?$", student_courses, name="student_courses"),
    re_path(r"^student/calendar/?$", student_calendar, name="student_calendar"),
    re_path(r"^student/grades/all/?$", student_grades_all, name="student_grades_all"),
    re_path(r"^student/documents/?$", student_documents, name="student_documents"),

    # Library and payments
    re_path(r"^library/catalog/?$", library_catalog, name="library_catalog"),
    re_path(r"^library/myloans/?$", library_myloans, name="library_myloans"),
    re_path(r"^payments/mine/?$", payments_mine, name="payments_mine"),

    # Assistant endpoints
    re_path(r"^assistant/summary/?$", assistant_summary, name="assistant_summary"),
    re_path(r"^auditoriums/assistant/my/?$", auditoriums_assistant_my, name="auditoriums_assistant_my"),
    re_path(r"^tptd/my/?$", tptd_my, name="tptd_my"),
    re_path(r"^quizzes/my/?$", quizzes_my, name="quizzes_my"),
    re_path(r"^assistant/tograde/?$", assistant_tograde, name="assistant_tograde"),

    # Teacher endpoints
    re_path(r"^teacher/profile/?$", teacher_profile, name="teacher_profile"),


    path("", include("accounts.urls")),
]
