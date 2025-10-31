from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from academics.models import Auditoire, Section
import uuid
import datetime

class CustomUserManager(BaseUserManager):
    def create_user(self, matricule, password=None, **extra_fields):
        if not matricule:
            raise ValueError('The Matricule field must be set')
        user = self.model(matricule=matricule, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, matricule, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self.create_user(matricule, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('pdg', 'Président Directeur Général (PDG)'),
        ('dg', 'Directeur Général (DG)'),
        ('sga', 'Secrétaire Général Académique (SGA)'),
        ('sgad', 'Secrétaire Général Administratif (SGAD)'),
        ('chef_section', 'Chef de Section'),
        ('chef_departement', 'Chef de Département'),
        ('professeur', 'Professeur'),
        ('assistant', 'Assistant'),
        ('apparitorat', 'Apparitorat'),
        ('caisse', 'Caisse/Comptabilité'),
        ('service_it', 'Service IT'),
        ('etudiant', 'Étudiant'),
        ('bibliothecaire', 'Bibliothécaire'),
        ('jury', 'Jury'),
    )
    STATUS_CHOICES = (
        ('active', 'Activé'),
        ('inactive', 'Inactif'),
        ('pending', 'En attente'),
        ('suspended', 'Suspendu'),
    )
    SEXE_CHOICES = (
        ('M', 'Masculin'),
        ('F', 'Féminin'),
    )
    ACADEMIC_STATUS_CHOICES = (
        ('en_cours', 'En cours'),
        ('reussi', 'Réussi'),
        ('non_reussi', 'Non réussi'),
    )

    matricule = models.CharField(max_length=100, unique=True, blank=True)
    email = models.EmailField(unique=True, null=True, blank=True)
    first_name = models.CharField(max_length=100, default='')
    last_name = models.CharField(max_length=100, default='')
    post_name = models.CharField(max_length=100, blank=True, default='') # Ajouté pour postnom
    sexe = models.CharField(max_length=10, choices=SEXE_CHOICES, default='M')
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='etudiant')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending') # Statut du compte
    team_status = models.BooleanField(default=False) # Pour le statut d'équipe
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    description = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    office = models.CharField(max_length=100, blank=True, null=True) # Pour le personnel académique
    address = models.CharField(max_length=255, blank=True, null=True) # Pour les étudiants
    academic_status = models.CharField(max_length=20, choices=ACADEMIC_STATUS_CHOICES, default='en_cours') # Pour les étudiants
    current_auditoire = models.ForeignKey(Auditoire, on_delete=models.SET_NULL, null=True, blank=True, related_name='current_users') # Pour les étudiants
    previous_auditoires = models.ManyToManyField(Auditoire, related_name='previous_users', blank=True) # Pour les étudiants

    # Relation for Section Head
    section_head_of = models.OneToOneField(Section, on_delete=models.SET_NULL, null=True, blank=True, related_name='head')

    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'matricule'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'email']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.matricule})"

    def get_full_name(self):
        return f"{self.first_name} {self.post_name} {self.last_name}".strip()

    def get_short_name(self):
        return self.first_name

    def save(self, *args, **kwargs):
        if not self.matricule:
            year = datetime.date.today().year
            random_part = str(uuid.uuid4().hex)[:4].upper()
            self.matricule = f"MAT-{year}-{random_part}"
        super().save(*args, **kwargs)
