from django.db import models
from django.contrib.auth.models import User
from academics.models import Auditoire
import uuid


class Role(models.Model):
    ROLE_CHOICES = (
        ('pdg', 'PDG'),
        ('directeur_general', 'Directeur Général'),
        ('sga', 'Secrétariat Général Académique (SGA)'),
        ('sgad', 'Secrétariat Général Adjoint (SGAD)'),
        ('chef_section', 'Chef de Section'),
        ('chef_departement', 'Chef de Département'),
        ('enseignant', 'Enseignant (Titulaire)'),
        ('assistant', 'Assistant'),
        ('apparitorat', 'Apparitorat'),
        ('caisse', 'Caisse/Comptabilité'),
        ('service_it', 'Service IT'),
        ('etudiant', 'Étudiant'),
        ('bibliothecaire', 'Bibliothécaire'),
        ('jury', 'Jury'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)

    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"

class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    matricule = models.CharField(max_length=100, unique=True, blank=True)
    nom = models.CharField(max_length=100, default='')
    postnom = models.CharField(max_length=100, blank=True, default='')
    prenom = models.CharField(max_length=100, default='')
    sexe = models.CharField(max_length=10, choices=[('M', 'Masculin'), ('F', 'Féminin')], default='M')
    status = models.CharField(max_length=20, choices=[('active', 'Active'), ('inactive', 'Inactive'), ('suspended', 'Suspended')], default='active')
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    description = models.TextField(blank=True)
    academic_status = models.CharField(max_length=20, choices=[('en_cours', 'En cours'), ('reussi', 'Réussi'), ('non_reussi', 'Non réussi')], default='en_cours')
    current_auditoire = models.ForeignKey(Auditoire, on_delete=models.SET_NULL, null=True, blank=True, related_name='current_students')
    previous_auditoires = models.ManyToManyField(Auditoire, related_name='previous_students', blank=True)

    def save(self, *args, **kwargs):
        if not self.matricule:
            self.matricule = str(uuid.uuid4().hex)[:10].upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nom} {self.postnom} {self.prenom}"

class AcademicProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='academic_profile')
    matricule = models.CharField(max_length=100, unique=True, blank=True)
    nom = models.CharField(max_length=100, default='')
    postnom = models.CharField(max_length=100, blank=True, default='')
    prenom = models.CharField(max_length=100, default='')
    sexe = models.CharField(max_length=10, choices=[('M', 'Masculin'), ('F', 'Féminin')], default='M')
    status = models.CharField(max_length=20, choices=[('active', 'Active'), ('inactive', 'Inactive')], default='active')
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    description = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        if not self.matricule:
            self.matricule = str(uuid.uuid4().hex)[:10].upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nom} {self.postnom} {self.prenom}"

class Paiement(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    tranche_number = models.PositiveSmallIntegerField(choices=[(1, '1ère tranche'), (2, '2ème tranche'), (3, '3ème tranche')], default=1)
    date_paid = models.DateTimeField(auto_now_add=True)
    academic_year = models.CharField(max_length=9)

    def __str__(self):
        return f"Payment of {self.amount} by {self.student} for tranche {self.tranche_number}"
