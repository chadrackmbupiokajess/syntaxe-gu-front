from django import forms
from django.contrib import admin, messages
from django.contrib.auth.models import User
from .models import StudentProfile, AcademicProfile, Paiement, Role
from academics.models import CourseAssignment


# --- Inlines ---
class CourseAssignmentInline(admin.TabularInline):
    model = CourseAssignment
    extra = 1
    verbose_name_plural = 'Assignations de cours'


# --- Formulaires personnalisés avec champ de mot de passe ---
class StudentProfileForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput, required=False, help_text="Laissez vide pour ne pas changer. Remplir pour créer ou mettre à jour le mot de passe.")

    class Meta:
        model = StudentProfile
        exclude = ('user',)

class AcademicProfileForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput, required=False, help_text="Laissez vide pour ne pas changer. Remplir pour créer ou mettre à jour le mot de passe.")
    role = forms.ChoiceField(choices=[
        choice for choice in Role.ROLE_CHOICES if choice[0] != 'etudiant'
    ])

    class Meta:
        model = AcademicProfile
        exclude = ('user',)


# --- Configurations de l'Admin ---
@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    form = StudentProfileForm
    list_display = ('nom', 'postnom', 'prenom', 'matricule', 'current_auditoire', 'academic_status', 'status')
    readonly_fields = ('matricule',)
    search_fields = ('nom', 'postnom', 'prenom', 'matricule')

    def save_model(self, request, obj, form, change):
        password = form.cleaned_data.get('password')

        if not change: # Création d'un nouvel étudiant
            base_username = f"{obj.prenom.lower()}{obj.nom.lower()}".replace(' ', '')
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            
            if not password:
                password = User.objects.make_random_password()
                self.message_user(request, f"L'utilisateur '{username}' a été créé avec le mot de passe : {password}", messages.SUCCESS)

            user = User.objects.create_user(username=username, password=password)
            obj.user = user
            Role.objects.create(user=user, role='etudiant')
        else: # Mise à jour
            if password:
                obj.user.set_password(password)
                obj.user.save()
                self.message_user(request, "Le mot de passe a été mis à jour.", messages.SUCCESS)

        super().save_model(request, obj, form, change)


@admin.register(AcademicProfile)
class AcademicProfileAdmin(admin.ModelAdmin):
    form = AcademicProfileForm
    list_display = ('nom', 'postnom', 'prenom', 'matricule', 'status')
    readonly_fields = ('matricule',)
    search_fields = ('nom', 'postnom', 'prenom', 'matricule')
    inlines = [CourseAssignmentInline]

    def save_model(self, request, obj, form, change):
        password = form.cleaned_data.get('password')

        if not change: # Création
            base_username = f"{obj.prenom.lower()}{obj.nom.lower()}".replace(' ', '')
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1

            if not password:
                password = User.objects.make_random_password()
                self.message_user(request, f"L'utilisateur '{username}' a été créé avec le mot de passe : {password}", messages.SUCCESS)

            user = User.objects.create_user(username=username, password=password)
            obj.user = user
            selected_role = form.cleaned_data.get('role')
            Role.objects.create(user=user, role=selected_role)
        else: # Mise à jour
            if password:
                obj.user.set_password(password)
                obj.user.save()
                self.message_user(request, "Le mot de passe a été mis à jour.", messages.SUCCESS)

        super().save_model(request, obj, form, change)


@admin.register(Paiement)
class PaiementAdmin(admin.ModelAdmin):
    list_display = ('student', 'amount', 'tranche_number', 'date_paid', 'academic_year')
    list_filter = ('tranche_number', 'academic_year', 'student')
    search_fields = ('student__nom', 'student__matricule')
