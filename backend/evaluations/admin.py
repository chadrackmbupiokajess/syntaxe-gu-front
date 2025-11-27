from django.contrib import admin
from .models import Assignment, Submission, Quiz, Question, Choice, QuizSubmission


# --- Inlines pour les Quiz ---
class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 3 # 3 choix par défaut pour une question

class QuestionInline(admin.StackedInline):
    model = Question
    extra = 1 # 1 question par défaut pour un quiz
    inlines = [ChoiceInline] # Les choix sont gérés sous les questions


# --- Administration des TP/TD ---
@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'get_departement', 'get_auditoire', 'course', 'assistant', 'deadline', 'created_at')
    list_filter = ('course__auditoire__departement', 'course__auditoire', 'course', 'assistant', 'deadline')
    search_fields = ('title', 'questionnaire', 'course__name', 'assistant__full_name')
    date_hierarchy = 'created_at'
    list_select_related = ('course__auditoire__departement', 'assistant')

    @admin.display(description='Département', ordering='course__auditoire__departement__name')
    def get_departement(self, obj):
        if obj.course and obj.course.auditoire and obj.course.auditoire.departement:
            return obj.course.auditoire.departement.name
        return "N/A"

    @admin.display(description='Auditoire', ordering='course__auditoire__name')
    def get_auditoire(self, obj):
        if obj.course and obj.course.auditoire:
            return obj.course.auditoire.name
        return "N/A"


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ('assignment', 'student', 'status', 'grade', 'submitted_at')
    list_filter = ('status', 'assignment__course__auditoire__departement__section', 'assignment__course__auditoire__departement', 'assignment__course__auditoire', 'assignment__course', 'student')
    search_fields = ('assignment__title', 'student__full_name')
    date_hierarchy = 'submitted_at'


# --- Administration des Quiz ---
@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'assistant', 'created_at')
    list_filter = ('course__auditoire__departement__section', 'course__auditoire__departement', 'course__auditoire', 'course', 'assistant')
    search_fields = ('title', 'course__name', 'assistant__full_name')
    date_hierarchy = 'created_at'
    inlines = [QuestionInline] # Les questions sont gérées sous le quiz

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('question_text', 'quiz', 'question_type')
    list_filter = ('question_type', 'quiz__course__auditoire__departement__section', 'quiz__course__auditoire__departement', 'quiz__course__auditoire', 'quiz__course')
    search_fields = ('question_text', 'quiz__title')
    inlines = [ChoiceInline] # Les choix sont gérés sous la question

@admin.register(QuizSubmission)
class QuizSubmissionAdmin(admin.ModelAdmin):
    list_display = ('student', 'quiz', 'score', 'submitted_at')
    list_filter = ('student', 'quiz')
    search_fields = ('student__nom', 'quiz__title')
    date_hierarchy = 'submitted_at'

# Choice n'est pas enregistré directement car il est géré via QuestionInline
# admin.site.register(Choice)
