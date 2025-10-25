from django.db import models
import uuid

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

    def __str__(self):
        return self.title

class CourseAssignment(models.Model):
    assistant = models.ForeignKey('accounts.AcademicProfile', on_delete=models.CASCADE, related_name='course_assignments', limit_choices_to={'user__role__role': 'assistant'})
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assignments_by_assistant')

    class Meta:
        unique_together = ('assistant', 'course')
        verbose_name = 'Assignation de cours'
        verbose_name_plural = 'Assignations de cours'

    def __str__(self):
        return f"{self.assistant.nom} {self.assistant.prenom} - {self.course.name}"


class CourseMessage(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey('accounts.AcademicProfile', on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_course_messages')
    title = models.CharField(max_length=255)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.course.name}] {self.title}"
