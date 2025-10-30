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
    feedback = models.TextField(blank=True, null=True) # AJOUT DU CHAMP FEEDBACK
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

class QuizAttempt(models.Model):
    SUBMISSION_REASONS = (
        ('manual', 'Manuel'),
        ('time-out', 'Temps écoulé'),
        ('left-page', 'Page quittée'),
    )
    CORRECTION_STATUS = (
        ('automatic', 'Automatique'),
        ('manual', 'Manuel'),
        ('pending', 'En attente'),
    )
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='quiz_attempts', limit_choices_to={'role': 'etudiant'})
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    score = models.FloatField(null=True, blank=True)
    total_questions = models.PositiveIntegerField(default=0)
    submitted_at = models.DateTimeField(auto_now_add=True)
    submission_reason = models.CharField(max_length=10, choices=SUBMISSION_REASONS, default='left-page')
    correction_status = models.CharField(max_length=10, choices=CORRECTION_STATUS, default='pending')

    class Meta:
        unique_together = ('student', 'quiz') # Assure une seule tentative par étudiant par quiz

    def __str__(self):
        return f"Attempt by {self.student} on {self.quiz.title}"

    def save(self, *args, **kwargs):
        if not self.pk:  # Only on creation
            if self.submission_reason in ['time-out', 'left-page']:
                self.correction_status = 'automatic'
            else:
                self.correction_status = 'pending'
        super().save(*args, **kwargs)


class Answer(models.Model):
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    selected_choices = models.ManyToManyField(Choice, blank=True)
    answer_text = models.TextField(blank=True) # For free text questions
    points_obtained = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"Answer for attempt {self.attempt.id} to {self.question.question_text[:50]}..."
