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


# --- Configurations de l'Admin ---

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
            
            # Méthode de création standard et garantie de Django
            user = User.objects.create_user(username=username, password=password)

            obj.user = user
            Role.objects.create(user=user, role='etudiant')

            self.message_user(request, f"L'utilisateur '{username}' a été créé avec le mot de passe : {password}", messages.SUCCESS)
        
        super().save_model(request, obj, form, change)


# --- Formulaire pour AcademicProfile ---
class AcademicProfileForm(forms.ModelForm):
    role_selection = forms.ChoiceField(
        choices=[choice for choice in Role.ROLE_CHOICES if choice[0] != 'etudiant'],
        label="Rôle"
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Préremplir le champ avec le rôle actuel de l'utilisateur si on édite
        try:
            user = getattr(self.instance, 'user', None)
            if user and hasattr(user, 'role') and user.role and user.role.role:
                self.fields['role_selection'].initial = user.role.role
        except Exception:
            pass
    class Meta:
        model = AcademicProfile
        fields = ('nom', 'postnom', 'prenom', 'sexe', 'status', 'profile_picture', 'description')


@admin.register(AcademicProfile)
class AcademicProfileAdmin(admin.ModelAdmin):
    form = AcademicProfileForm
    list_display = ('nom', 'postnom', 'prenom', 'matricule', 'status')
    readonly_fields = ('matricule',)
    search_fields = ('nom', 'postnom', 'prenom', 'matricule')
    inlines = [CourseAssignmentInline]

    def save_model(self, request, obj, form, change):
        if not change:
            base_username = f"{obj.prenom.lower()}{obj.nom.lower()}".replace(' ', '')
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1

            password = ''.join(random.choices(string.ascii_letters + string.digits, k=12))

            # Méthode de création standard et garantie de Django
            user = User.objects.create_user(username=username, password=password)
            
            obj.user = user
            selected_role = form.cleaned_data.get('role_selection')
            Role.objects.create(user=user, role=selected_role)

            self.message_user(request, f"L'utilisateur '{username}' a été créé avec le mot de passe : {password}", messages.SUCCESS)

        else:
            # Mise à jour du rôle si on édite le profil académique
            selected_role = form.cleaned_data.get('role_selection')
            if selected_role:
                role_obj, created = Role.objects.get_or_create(user=obj.user, defaults={'role': selected_role})
                if not created and role_obj.role != selected_role:
                    role_obj.role = selected_role
                    role_obj.save()

        super().save_model(request, obj, form, change)


@admin.register(Paiement)
class PaiementAdmin(admin.ModelAdmin):
    list_display = ('student', 'amount', 'tranche_number', 'date_paid', 'academic_year')
    list_filter = ('tranche_number', 'academic_year', 'student')
    search_fields = ('student__nom', 'student__matricule')


# On désenregistre le modèle Group pour le cacher de l'admin
admin.site.unregister(Group)
