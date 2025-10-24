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
    student_documents, payments_mine,
    # PDG / DG / SGA
    pdg_summary, pdg_activities, dg_summary, dg_actions, sga_summary, sga_demandes,
    # SGAD / Section / Departement / Jury / Apparitorat / Finance / IT / Library
    sgad_summary, sgad_paie,
    section_summary, section_list,
    department_summary, department_list,
    jury_summary, jury_defenses,
    apparitorat_summary, apparitorat_presences,
    finance_summary, finance_operations,
    it_summary, it_incidents,
    library_summary, library_gestion_reservations,
    # Student actions
    quizzes_student_start, quizzes_student_attempt_submit, tptd_student_submit,
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
    # Actions étudiant (post)
    re_path(r"^quizzes/student/(?P<id>\d+)/start/?$", quizzes_student_start, name="quizzes_student_start"),
    re_path(r"^quizzes/student/attempts/(?P<id>\d+)/submit/?$", quizzes_student_attempt_submit, name="quizzes_student_attempt_submit"),
    re_path(r"^tptd/student/(?P<id>\d+)/submit/?$", tptd_student_submit, name="tptd_student_submit"),
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

    # PDG / DG / SGA endpoints (placeholders)
    re_path(r"^pdg/summary/?$", pdg_summary, name="pdg_summary"),
    re_path(r"^pdg/activities/?$", pdg_activities, name="pdg_activities"),
    re_path(r"^dg/summary/?$", dg_summary, name="dg_summary"),
    re_path(r"^dg/actions/?$", dg_actions, name="dg_actions"),
    re_path(r"^sga/summary/?$", sga_summary, name="sga_summary"),
    re_path(r"^sga/demandes/?$", sga_demandes, name="sga_demandes"),

    # SGAD
    re_path(r"^sgad/summary/?$", sgad_summary, name="sgad_summary"),
    re_path(r"^sgad/paie/?$", sgad_paie, name="sgad_paie"),

    # Section
    re_path(r"^section/summary/?$", section_summary, name="section_summary"),
    re_path(r"^section/list/?$", section_list, name="section_list"),

    # Department
    re_path(r"^department/summary/?$", department_summary, name="department_summary"),
    re_path(r"^department/list/?$", department_list, name="department_list"),

    # Jury
    re_path(r"^jury/summary/?$", jury_summary, name="jury_summary"),
    re_path(r"^jury/defenses/?$", jury_defenses, name="jury_defenses"),

    # Apparitorat
    re_path(r"^apparitorat/summary/?$", apparitorat_summary, name="apparitorat_summary"),
    re_path(r"^apparitorat/presences/?$", apparitorat_presences, name="apparitorat_presences"),

    # Finance/Caisse
    re_path(r"^finance/summary/?$", finance_summary, name="finance_summary"),
    re_path(r"^finance/operations/?$", finance_operations, name="finance_operations"),

    # IT
    re_path(r"^it/summary/?$", it_summary, name="it_summary"),
    re_path(r"^it/incidents/?$", it_incidents, name="it_incidents"),

    # Library
    re_path(r"^library/summary/?$", library_summary, name="library_summary"),
    re_path(r"^library/gestion/reservations/?$", library_gestion_reservations, name="library_gestion_reservations"),


    path("", include("accounts.urls")),
]
