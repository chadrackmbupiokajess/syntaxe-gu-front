from django.contrib import admin, messages
from .models import User
import uuid
import random
import string

@admin.register(User)
class CustomUserAdmin(admin.ModelAdmin):
    # --- Configuration de la liste d'affichage ---
    list_display = (
        'matricule',
        'get_full_name',
        'email',
        'role',
        'is_active',
        'status', # Ajout du champ status
    )
    list_filter = ('role', 'is_active', 'status') # Ajout du filtre sur status
    search_fields = ('matricule', 'first_name', 'last_name', 'email')
    ordering = ('matricule',)

    # --- Configuration des formulaires ---
    
    # Définir les fieldsets pour la page de MODIFICATION
    fieldsets = (
        (None, {'fields': ('matricule', 'password')}),
        ('Informations Personnelles', {'fields': ('first_name', 'last_name', 'post_name', 'email', 'sexe', 'profile_picture', 'description')}),
        ('Permissions & Rôle', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser')}),
        ('Informations Académiques', {'fields': ('current_auditoire', 'academic_status', 'office', 'phone', 'address')}),
        ('Statut', {'fields': ('status', 'team_status')}),
    )
    
    # Définir les fieldsets pour la page de CRÉATION (tous les champs sauf matricule et password)
    add_fieldsets = (
        ('Informations Personnelles', {'fields': ('first_name', 'last_name', 'post_name', 'email', 'sexe', 'profile_picture', 'description')}),
        ('Permissions & Rôle', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser')}),
        ('Informations Académiques', {'fields': ('current_auditoire', 'academic_status', 'office', 'phone', 'address')}),
        ('Statut', {'fields': ('status', 'team_status')}),
    )

    # Rendre le champ matricule non-modifiable sur la page de modification
    def get_readonly_fields(self, request, obj=None):
        if obj:
            return self.readonly_fields + ('matricule',)
        return self.readonly_fields

    # Utiliser des fieldsets différents pour l'ajout et la modification
    def get_fieldsets(self, request, obj=None):
        if not obj:
            return self.add_fieldsets
        return super().get_fieldsets(request, obj)

    # Surcharger la méthode save_model pour la génération automatique
    def save_model(self, request, obj, form, change):
        if not change: # Création
            random_hex = uuid.uuid4().hex.upper()
            part1 = random_hex[:4]
            part2 = random_hex[4:8]
            obj.matricule = f"MAT-{part1}-{part2}"
            
            password = ''.join(random.choices(string.ascii_letters + string.digits, k=12))
            obj.set_password(password)
            
            self.message_user(request, f"L'utilisateur a été créé avec le matricule {obj.matricule} et le mot de passe : {password}", messages.SUCCESS)
        else: # Modification
            if 'password' in form.changed_data:
                obj.set_password(form.cleaned_data["password"])
                self.message_user(request, "Le mot de passe a été mis à jour avec succès.", messages.SUCCESS)

        super().save_model(request, obj, form, change)

# On désenregistre le modèle Group si on ne l'utilise pas
from django.contrib.auth.models import Group
admin.site.unregister(Group)
