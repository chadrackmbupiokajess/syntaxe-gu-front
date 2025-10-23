from django.contrib import admin
from .models import Section, Departement, Auditoire, Course, Calendrier, Role, Paiement


# 1. Inline pour les Auditoires
class AuditoireInline(admin.TabularInline):
    model = Auditoire
    extra = 3
    verbose_name_plural = "Ajouter des auditoires à ce département (ex: Licence 1, Licence 2...)"


# 2. Admin pour les Départements avec la nouvelle logique
class DepartementAdmin(admin.ModelAdmin):
    list_display = ('name', 'section')
    search_fields = ['name', 'section__name']

    # Cette fonction est la clé : elle contrôle quand afficher les inlines.
    def get_inlines(self, request, obj=None):
        # Si "obj" est None, cela signifie que nous sommes sur la page d'AJOUT.
        # Dans ce cas, on ne montre PAS les champs pour les auditoires.
        if obj is None:
            return []
        # Si "obj" existe, nous sommes sur la page de MODIFICATION.
        # C'est ici qu'on montre les champs pour ajouter les auditoires.
        return [AuditoireInline]


# 3. Admin pour les Sections
class SectionAdmin(admin.ModelAdmin):
    search_fields = ['name']


# --- Enregistrement des modèles --- #
admin.site.register(Section, SectionAdmin)
admin.site.register(Departement, DepartementAdmin)
# Le modèle Auditoire n'est pas enregistré seul, il est géré via les Départements.
admin.site.register(Course)
admin.site.register(Calendrier)
admin.site.register(Role)
admin.site.register(Paiement)
