from django.db import models

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

    def __str__(self):
        return f"{self.name} - {self.departement.name}"

class Course(models.Model):
    SESSION_CHOICES = (
        ('mi-session', 'Mi-Session'),
        ('session', 'Session'),
    )
    name = models.CharField(max_length=200)
    auditoire = models.ForeignKey(Auditoire, on_delete=models.CASCADE, related_name='courses')
    session_type = models.CharField(max_length=20, choices=SESSION_CHOICES, default='session')

    def __str__(self):
        return f"{self.name} ({self.get_session_type_display()})"

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
