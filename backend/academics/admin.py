from django.contrib import admin
from django.urls import reverse
from django.http import HttpResponseRedirect
from django.utils.html import format_html
from .models import Section, Departement, Auditoire, Course, Calendrier, Role, Paiement


# --- Inlines (pour l'ajout rapide) --- #

class AuditoireInline(admin.TabularInline):
    model = Auditoire
    extra = 1
    verbose_name_plural = "Ajouter des auditoires à ce département"

class DepartementInline(admin.TabularInline):
    model = Departement
    extra = 1
    verbose_name_plural = "Ajouter des départements à cette section"


# --- Configurations de l'Admin avec la nouvelle navigation --- #

@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'view_departments_link')
    search_fields = ['name']
    inlines = [DepartementInline]

    def view_departments_link(self, obj):
        count = obj.departements.count()
        url = (
            reverse("admin:academics_departement_changelist")
            + f"?section__id__exact={obj.id}"
        )
        return format_html('<a href="{}">Voir les {} départements</a>', url, count)

    view_departments_link.short_description = "Départements associés"


@admin.register(Departement)
class DepartementAdmin(admin.ModelAdmin):
    list_display = ('name', 'section', 'view_auditoires_link')
    list_filter = ('section',)
    search_fields = ['name', 'section__name']
    inlines = [AuditoireInline]

    def view_auditoires_link(self, obj):
        count = obj.auditoires.count()
        url = (
            reverse("admin:academics_auditoire_changelist")
            + f"?departement__id__exact={obj.id}"
        )
        return format_html('<a href="{}">Voir les {} auditoires</a>', url, count)

    view_auditoires_link.short_description = "Auditoires associés"

    def response_change(self, request, obj):
        # Redirige vers la liste des départements, filtrée par la section du département modifié.
        if '_continue' in request.POST or '_addanother' in request.POST:
            return super().response_change(request, obj)
        return HttpResponseRedirect(reverse("admin:academics_departement_changelist") + f"?section__id__exact={obj.section.id}")


@admin.register(Auditoire)
class AuditoireAdmin(admin.ModelAdmin):
    list_display = ('name', 'departement')
    list_filter = ('departement__section', 'departement')
    search_fields = ['name', 'departement__name']


# --- Enregistrement des autres modèles --- #
admin.site.register(Course)
admin.site.register(Calendrier)
admin.site.register(Role)
admin.site.register(Paiement)
