from django.db import models
from django.conf import settings
import uuid
import re

class Section(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Departement(models.Model):
    name = models.CharField(max_length=100)
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='departements')

    def __str__(self):
        return f"{self.name} ({self.section.name})"

class Auditoire(models.Model):
    name = models.CharField(max_length=100)
    departement = models.ForeignKey(Departement, on_delete=models.CASCADE, related_name='auditoires')
    level = models.PositiveSmallIntegerField(default=1, help_text="Ex: 1 pour Licence 1, 2 pour Licence 2, etc.")

    class Meta:
        ordering = ['level']

    def __str__(self):
        return f"{self.name} - {self.departement.name}"

    def save(self, *args, **kwargs):
        # Automatiser le champ 'level' en fonction du nom
        try:
            # Extraire le numéro du nom (ex: "Licence 3" -> 3)
            num_part = re.search(r'\d+', self.name)
            if num_part:
                num = int(num_part.group(0))
                # Si le nom contient "Master", ajouter 3
                if 'master' in self.name.lower():
                    self.level = num + 3
                else:
                    self.level = num
        except (ValueError, TypeError):
            # En cas d'erreur (ex: pas de numéro dans le nom), garder la valeur par défaut
            pass
        super().save(*args, **kwargs)

class Course(models.Model):
    SESSION_CHOICES = (
        ('mi-session', 'Mi-Session'),
        ('session', 'Session'),
    )
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True, blank=True)
    auditoire = models.ForeignKey(Auditoire, on_delete=models.CASCADE, related_name='courses')
    credits = models.PositiveSmallIntegerField(default=3)
    session_type = models.CharField(max_length=20, choices=SESSION_CHOICES, default='session')

    def __str__(self):
        return f"{self.name} ({self.get_session_type_display()}) - ({self.auditoire.name} - {self.auditoire.departement.name})"

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = str(uuid.uuid4())[:8].upper()
        super().save(*args, **kwargs)

class MiSessionCourseManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(session_type='mi-session')

class MiSessionCourse(Course):
    objects = MiSessionCourseManager()
    class Meta:
        proxy = True
        verbose_name = 'Cours de Mi-Session'
        verbose_name_plural = 'Cours de Mi-Session'

    def save(self, *args, **kwargs):
        self.session_type = 'mi-session'
        super().save(*args, **kwargs)

class SessionCourseManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(session_type='session')

class SessionCourse(Course):
    objects = SessionCourseManager()
    class Meta:
        proxy = True
        verbose_name = 'Cours de Session'
        verbose_name_plural = 'Cours de Session'

    def save(self, *args, **kwargs):
        self.session_type = 'session'
        super().save(*args, **kwargs)

class Calendrier(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    auditoire = models.ForeignKey(Auditoire, on_delete=models.CASCADE, related_name='calendar_events', null=True, blank=True)
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, related_name='calendar_events', null=True, blank=True)
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, related_name='calendar_events', null=True, blank=True, limit_choices_to={'role__in': ['assistant', 'professeur']})

    def __str__(self):
        return self.title

class CourseAssignment(models.Model):
    assistant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='course_assignments', limit_choices_to={'role__in': ['assistant', 'professeur']})
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assignments_by_assistant')

    class Meta:
        unique_together = ('course',) # CHANGEMENT ICI
        verbose_name = 'Assignation de cours'
        verbose_name_plural = 'Assignations de cours'

    def __str__(self):
        return f"{self.assistant.get_full_name()} - {self.course.name}"


class CourseMessage(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_course_messages')
    title = models.CharField(max_length=255)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.course.name}] {self.title}"

class Paiement(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments', limit_choices_to={'role': 'etudiant'})
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    tranche_number = models.PositiveSmallIntegerField(choices=[(1, '1ère tranche'), (2, '2ème tranche'), (3, '3ème tranche')], default=1)
    date_paid = models.DateTimeField(auto_now_add=True)
    academic_year = models.CharField(max_length=9)

    def __str__(self):
        return f"Payment of {self.amount} by {self.student} for tranche {self.tranche_number}"
