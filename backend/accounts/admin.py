from django import forms
from django.contrib import admin
from django.contrib.auth.models import User
from .models import StudentProfile, AcademicProfile, Paiement, Role
from academics.models import CourseAssignment


# --- Inlines ---
class CourseAssignmentInline(admin.TabularInline):
    model = CourseAssignment
    extra = 1
    verbose_name_plural = 'Assignations de cours'
    # Affiche le cours avec l'auditoire et le département
    readonly_fields = ('course_details',)
    fields = ('course', 'course_details')

    def course_details(self, instance):
        if instance.pk:
            return f"{instance.course.auditoire.name} - {instance.course.auditoire.departement.name}"
        return "-"
    course_details.short_description = "Détails (Auditoire - Département)"


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('nom', 'postnom', 'prenom', 'matricule', 'current_auditoire', 'academic_status', 'status')
    list_filter = ('status', 'academic_status', 'current_auditoire')
    search_fields = ('nom', 'postnom', 'prenom', 'matricule', 'user__username')
    readonly_fields = ('matricule',)
    exclude = ('user',)

    def save_model(self, request, obj, form, change):
        if not hasattr(obj, 'user'):
            username = f"{obj.nom.lower()}.{obj.prenom.lower()}".replace(' ', '')
            user, created = User.objects.get_or_create(username=username)
            if created:
                user.set_password('password123')
                user.save()
            obj.user = user
            Role.objects.create(user=user, role='etudiant')
        super().save_model(request, obj, form, change)


class AcademicProfileForm(forms.ModelForm):
    role = forms.ChoiceField(choices=[
        choice for choice in Role.ROLE_CHOICES if choice[0] != 'etudiant'
    ])

    class Meta:
        model = AcademicProfile
        fields = '__all__'
        exclude = ('user',)


@admin.register(AcademicProfile)
class AcademicProfileAdmin(admin.ModelAdmin):
    form = AcademicProfileForm
    list_display = ('nom', 'postnom', 'prenom', 'matricule', 'status')
    list_filter = ('status',)
    search_fields = ('nom', 'postnom', 'prenom', 'matricule', 'user__username')
    readonly_fields = ('matricule',)
    inlines = [CourseAssignmentInline]

    def save_model(self, request, obj, form, change):
        if not hasattr(obj, 'user'):
            username = f"{obj.nom.lower()}.{obj.prenom.lower()}".replace(' ', '')
            user, created = User.objects.get_or_create(username=username)
            if created:
                user.set_password('password123')
                user.save()
            obj.user = user
            selected_role = form.cleaned_data.get('role')
            Role.objects.create(user=user, role=selected_role)
        super().save_model(request, obj, form, change)


@admin.register(Paiement)
class PaiementAdmin(admin.ModelAdmin):
    list_display = ('student', 'amount', 'tranche_number', 'date_paid', 'academic_year')
    list_filter = ('tranche_number', 'academic_year', 'student')
    search_fields = ('student__nom', 'student__matricule')


# On n'enregistre plus le modèle Role seul, il est géré via les profils
# admin.site.register(Role)
