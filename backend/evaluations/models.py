from django.db import models
from django.conf import settings
from academics.models import Course, Auditoire

# --- TP/TD Models ---

class Assignment(models.Model):
    ASSIGNMENT_TYPES = (
        ('TP', 'Travail Pratique'),
        ('TD', 'Travail Dirigé'),
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assignments')
    assistant = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        limit_choices_to={'role__in': ['assistant', 'professeur']}
    )
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=2, choices=ASSIGNMENT_TYPES, default='TP')
    questionnaire = models.JSONField(default=list, help_text="Liste de questions pour le devoir")
    total_points = models.PositiveSmallIntegerField(default=10, help_text="La note maximale pour ce devoir")
    deadline = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Submission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='submissions', limit_choices_to={'role': 'etudiant'})
    content = models.TextField(blank=True, help_text="Contenu de la soumission de l'étudiant")
    status = models.CharField(max_length=20, choices=[('soumis', 'Soumis'), ('non_soumis', 'Non soumis')], default='non_soumis')
    grade = models.FloatField(null=True, blank=True)
    feedback = models.TextField(blank=True, null=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    graded_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Submission by {self.student} for {self.assignment.title}"

# --- Quiz Models ---

class Quiz(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='quizzes')
    assistant = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        limit_choices_to={'role__in': ['assistant', 'professeur']}
    )
    title = models.CharField(max_length=255)
    duration = models.PositiveIntegerField(default=30, help_text="Durée du quiz en minutes")
    total_points = models.PositiveSmallIntegerField(default=10, help_text="La note maximale pour ce quiz")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Question(models.Model):
    QUESTION_TYPES = (
        ('text', 'Texte libre'),
        ('single', 'Choix unique'),
        ('multiple', 'Choix multiple'),
    )
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=10, choices=QUESTION_TYPES)

    def __str__(self):
        return self.question_text

class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    choice_text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.choice_text

class QuizSubmission(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='quiz_submissions', 
        limit_choices_to={'role': 'etudiant'}
    )
    answers = models.JSONField(default=dict, help_text="Réponses de l'étudiant au format JSON")
    score = models.FloatField(null=True, blank=True)
    feedback = models.TextField(blank=True, null=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    graded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('student', 'quiz')

    def __str__(self):
        return f"Quiz Submission by {self.student} for {self.quiz.title}"
