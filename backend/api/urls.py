from django.urls import include, re_path, path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    health, student_summary, student_meta, student_grades_recent, student_profile,
    # Vues ajoutées
    assistant_summary, auditoriums_assistant_my, tptd_my, quizzes_my, assistant_tograde,
    assistant_auditorium_courses, assistant_auditorium_students, assistant_auditorium_activities, assistant_auditorium_stats, assistant_auditorium_messages,
    assistant_auditorium_create_tptd, assistant_auditorium_create_quiz,
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
    # Assistant student details
    assistant_student_detail, assistant_student_grades, assistant_student_submissions,
    # Assistant messages
    assistant_my_courses, assistant_course_messages,
)

urlpatterns = [
    re_path(r"^health/?$", health, name="health"),
    re_path(r"^auth/token/?$", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    re_path(r"^auth/token/refresh/?$", TokenRefreshView.as_view(), name="token_refresh"),

    # Student endpoints
    re_path(r"^student/summary/?$", student_summary, name="student_summary"),
    re_path(r"^student/meta/?$", student_meta, name="student_meta"),
    re_path(r"^student/grades/recent/?$", student_grades_recent, name="student_grades_recent"),
    re_path(r"^student/profile/?$", student_profile, name="student_profile"),
    re_path(r"^student/notifications/?$", student_notifications, name="student_notifications"),
    re_path(r"^quizzes/student/available/?$", quizzes_student_available, name="quizzes_student_available"),
    re_path(r"^tptd/student/available/?$", tptd_student_available, name="tptd_student_available"),
    re_path(r"^quizzes/student/my-attempts/?$", quizzes_student_my_attempts, name="quizzes_student_my_attempts"),
    re_path(r"^tptd/student/my-submissions/?$", tptd_student_my_submissions, name="tptd_student_my_submissions"),
    re_path(r"^quizzes/student/(?P<id>\d+)/start/?$", quizzes_student_start, name="quizzes_student_start"),
    re_path(r"^quizzes/student/attempts/(?P<id>\d+)/submit/?$", quizzes_student_attempt_submit, name="quizzes_student_attempt_submit"),
    re_path(r"^tptd/student/(?P<id>\d+)/submit/?$", tptd_student_submit, name="tptd_student_submit"),
    re_path(r"^student/courses/?$", student_courses, name="student_courses"),
    re_path(r"^student/calendar/?$", student_calendar, name="student_calendar"),
    re_path(r"^student/grades/all/?$", student_grades_all, name="student_grades_all"),
    re_path(r"^student/documents/?$", student_documents, name="student_documents"),
    re_path(r"^library/catalog/?$", library_catalog, name="library_catalog"),
    re_path(r"^library/myloans/?$", library_myloans, name="library_myloans"),
    re_path(r"^payments/mine/?$", payments_mine, name="payments_mine"),

    # Assistant endpoints
    re_path(r"^assistant/summary/?$", assistant_summary, name="assistant_summary"),
    re_path(r"^auditoriums/assistant/my/?$", auditoriums_assistant_my, name="auditoriums_assistant_my"),
    re_path(r"^assistant/courses/?$", assistant_my_courses, name="assistant_my_courses"),
    re_path(r"^assistant/courses/(?P<course_id>\d+)/messages/?$", assistant_course_messages, name="assistant_course_messages"),
    re_path(r"^assistant/auditoriums/(?P<code>.+)/courses/?$", assistant_auditorium_courses, name="assistant_auditorium_courses"),
    re_path(r"^assistant/auditoriums/(?P<code>.+)/students/?$", assistant_auditorium_students, name="assistant_auditorium_students"),
    re_path(r"^assistant/auditoriums/(?P<code>.+)/activities/?$", assistant_auditorium_activities, name="assistant_auditorium_activities"),
    re_path(r"^assistant/auditoriums/(?P<code>.+)/stats/?$", assistant_auditorium_stats, name="assistant_auditorium_stats"),
    re_path(r"^assistant/auditoriums/(?P<code>.+)/messages/?$", assistant_auditorium_messages, name="assistant_auditorium_messages"),
    re_path(r"^assistant/auditoriums/(?P<code>.+)/tptd/new/?$", assistant_auditorium_create_tptd, name="assistant_auditorium_create_tptd"),
    re_path(r"^assistant/auditoriums/(?P<code>.+)/quizzes/new/?$", assistant_auditorium_create_quiz, name="assistant_auditorium_create_quiz"),
    re_path(r"^assistant/students/(?P<id>\d+)/?$", assistant_student_detail, name="assistant_student_detail"),
    re_path(r"^assistant/students/(?P<id>\d+)/grades/?$", assistant_student_grades, name="assistant_student_grades"),
    re_path(r"^assistant/students/(?P<id>\d+)/submissions/?$", assistant_student_submissions, name="assistant_student_submissions"),
    re_path(r"^tptd/my/?$", tptd_my, name="tptd_my"),
    re_path(r"^quizzes/my/?$", quizzes_my, name="quizzes_my"),
    re_path(r"^assistant/tograde/?$", assistant_tograde, name="assistant_tograde"),

    # Teacher endpoints
    re_path(r"^teacher/profile/?$", teacher_profile, name="teacher_profile"),

    # Admin & other roles endpoints
    re_path(r"^pdg/summary/?$", pdg_summary, name="pdg_summary"),
    re_path(r"^pdg/activities/?$", pdg_activities, name="pdg_activities"),
    re_path(r"^dg/summary/?$", dg_summary, name="dg_summary"),
    re_path(r"^dg/actions/?$", dg_actions, name="dg_actions"),
    re_path(r"^sga/summary/?$", sga_summary, name="sga_summary"),
    re_path(r"^sga/demandes/?$", sga_demandes, name="sga_demandes"),
    re_path(r"^sgad/summary/?$", sgad_summary, name="sgad_summary"),
    re_path(r"^sgad/paie/?$", sgad_paie, name="sgad_paie"),
    re_path(r"^section/summary/?$", section_summary, name="section_summary"),
    re_path(r"^section/list/?$", section_list, name="section_list"),
    re_path(r"^department/summary/?$", department_summary, name="department_summary"),
    re_path(r"^department/list/?$", department_list, name="department_list"),
    re_path(r"^jury/summary/?$", jury_summary, name="jury_summary"),
    re_path(r"^jury/defenses/?$", jury_defenses, name="jury_defenses"),
    re_path(r"^apparitorat/summary/?$", apparitorat_summary, name="apparitorat_summary"),
    re_path(r"^apparitorat/presences/?$", apparitorat_presences, name="apparitorat_presences"),
    re_path(r"^finance/summary/?$", finance_summary, name="finance_summary"),
    re_path(r"^finance/operations/?$", finance_operations, name="finance_operations"),
    re_path(r"^it/summary/?$", it_summary, name="it_summary"),
    re_path(r"^it/incidents/?$", it_incidents, name="it_incidents"),
    re_path(r"^library/summary/?$", library_summary, name="library_summary"),
    re_path(r"^library/gestion/reservations/?$", library_gestion_reservations, name="library_gestion_reservations"),

    path("", include("accounts.urls")),
    path("messaging/", include("messaging.urls")),
]
