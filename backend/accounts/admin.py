from django import forms
from django.contrib import admin, messages
from django.contrib.auth.models import User, Group
from .models import StudentProfile, AcademicProfile, Paiement, Role
from academics.models import CourseAssignment
import random
import string

# --- Inlines ---
class CourseAssignmentInline(admin.TabularInline):
    model = CourseAssignment
    extra = 1
    verbose_name_plural = 'Assignations de cours'


# --- Configurations de l'Admin pour StudentProfile (ne change pas) ---
@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('nom', 'postnom', 'prenom', 'matricule', 'current_auditoire', 'academic_status', 'status')
    readonly_fields = ('matricule',)
    exclude = ('user',)

    def save_model(self, request, obj, form, change):
        if not change:
            base_username = f"{obj.prenom.lower()}{obj.nom.lower()}".replace(' ', '')
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1

            password = ''.join(random.choices(string.ascii_letters + string.digits, k=12))
            user = User.objects.create_user(username=username, password=password)
            obj.user = user
            Role.objects.create(user=user, role='etudiant')

            self.message_user(request, f"L'utilisateur '{username}' a été créé avec le mot de passe : {password}", messages.SUCCESS)
        
        super().save_model(request, obj, form, change)


# --- Solution Définitive pour AcademicProfile ---

# 1. On crée un formulaire personnalisé et robuste
class AcademicProfileForm(forms.ModelForm):
    # On définit le champ supplémentaire qui n'est pas dans le modèle
    role_selection = forms.ChoiceField(label="Rôle")

    class Meta:
        model = AcademicProfile
        # On liste les champs du modèle à afficher
        fields = ('nom', 'postnom', 'prenom', 'sexe', 'status', 'profile_picture', 'description')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # On configure les choix pour notre champ supplémentaire
        self.fields['role_selection'].choices = [choice for choice in Role.ROLE_CHOICES if choice[0] != 'etudiant']
        # Si on modifie un profil existant, on pré-remplit avec le rôle actuel
        if self.instance and self.instance.pk and hasattr(self.instance.user, 'role'):
            self.fields['role_selection'].initial = self.instance.user.role.role


# 2. On configure l'admin pour utiliser ce formulaire
@admin.register(AcademicProfile)
class AcademicProfileAdmin(admin.ModelAdmin):
    form = AcademicProfileForm
    list_display = ('nom', 'postnom', 'prenom', 'matricule', 'status')
    readonly_fields = ('matricule',)
    search_fields = ('nom', 'postnom', 'prenom', 'matricule')
    inlines = [CourseAssignmentInline]

    # 3. La logique de sauvegarde fonctionnera car le formulaire est correct
    def save_model(self, request, obj, form, change):
        selected_role = form.cleaned_data.get('role_selection')

        if not change: # Création
            base_username = f"{obj.prenom.lower()}{obj.nom.lower()}".replace(' ', '')
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1

            password = ''.join(random.choices(string.ascii_letters + string.digits, k=12))
            user = User.objects.create_user(username=username, password=password)
            obj.user = user
            Role.objects.create(user=user, role=selected_role)
            self.message_user(request, f"L'utilisateur '{username}' a été créé avec le mot de passe : {password}", messages.SUCCESS)
        else: # Mise à jour
            if selected_role and hasattr(obj.user, 'role'):
                user_role = obj.user.role
                if user_role.role != selected_role:
                    user_role.role = selected_role
                    user_role.save()
                    self.message_user(request, "Le rôle de l'utilisateur a été mis à jour.", messages.SUCCESS)

        super().save_model(request, obj, form, change)


@admin.register(Paiement)
class PaiementAdmin(admin.ModelAdmin):
    list_display = ('student', 'amount', 'tranche_number', 'date_paid', 'academic_year')
    list_filter = ('tranche_number', 'academic_year', 'student')
    search_fields = ('student__nom', 'student__matricule')


# On désenregistre le modèle Group pour le cacher de l'admin
admin.site.unregister(Group)
