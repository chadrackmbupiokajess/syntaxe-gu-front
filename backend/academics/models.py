from django.db import models
from django.contrib.auth.models import User

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
    name = models.CharField(max_length=200)
    auditoire = models.ForeignKey(Auditoire, on_delete=models.CASCADE, related_name='courses')

    def __str__(self):
        return self.name

class Calendrier(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    auditoire = models.ForeignKey(Auditoire, on_delete=models.CASCADE, related_name='calendar_events', null=True, blank=True)

    def __str__(self):
        return self.title

class Role(models.Model):
    ROLE_CHOICES = (
        ('etudiant', 'Étudiant'),
        ('assistant', 'Assistant'),
        ('professeur', 'Professeur'),
        ('admin', 'Administrateur'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    auditoire = models.ForeignKey(Auditoire, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"

class Paiement(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date_paid = models.DateTimeField(auto_now_add=True)
    academic_year = models.CharField(max_length=9) # e.g., "2023-2024"

    def __str__(self):
        return f"Payment of {self.amount} by {self.student.username} for {self.academic_year}"
