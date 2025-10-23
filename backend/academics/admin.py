from django.contrib import admin
from django.urls import reverse
from django.http import HttpResponseRedirect
from .models import (
    Section, Departement, Auditoire, 
    Course, MiSessionCourse, SessionCourse, 
    Calendrier, CourseAssignment
)


# --- Inlines --- #

class CourseInline(admin.TabularInline):
    model = Course
    extra = 1
    verbose_name_plural = "Ajouter des cours à cet auditoire"
    fields = ('name', 'session_type')

class MiSessionCourseInline(admin.TabularInline):
    model = MiSessionCourse
    extra = 1
    verbose_name_plural = "Cours de Mi-Session"
    fields = ('name',)

class SessionCourseInline(admin.TabularInline):
    model = SessionCourse
    extra = 1
    verbose_name_plural = "Cours de Session"
    fields = ('name',)

class AuditoireInline(admin.TabularInline):
    model = Auditoire
    extra = 1
    verbose_name_plural = "Ajouter des auditoires à ce département"

class DepartementInline(admin.TabularInline):
    model = Departement
    extra = 1
    verbose_name_plural = "Ajouter des départements à cette section"


# --- Configurations de l'Admin --- #

@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ['name']
    inlines = [DepartementInline]

@admin.register(Departement)
class DepartementAdmin(admin.ModelAdmin):
    list_display = ('name', 'section')
    list_filter = ('section',)
    search_fields = ['name', 'section__name']
    inlines = [AuditoireInline]

    def response_change(self, request, obj):
        return HttpResponseRedirect(reverse("admin:academics_departement_changelist"))

@admin.register(Auditoire)
class AuditoireAdmin(admin.ModelAdmin):
    list_display = ('departement', 'name')
    list_filter = ('departement__section', 'departement')
    ordering = ('departement', 'name')
    search_fields = ['name', 'departement__name']
    inlines = [MiSessionCourseInline, SessionCourseInline]

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('name', 'auditoire', 'session_type')
    list_filter = ('auditoire__departement__section', 'auditoire__departement', 'session_type')
    ordering = ('auditoire__departement', 'auditoire', 'name')
    search_fields = ['name', 'auditoire__name']

@admin.register(CourseAssignment)
class CourseAssignmentAdmin(admin.ModelAdmin):
    list_display = ('assistant', 'course_details')
    list_filter = ('assistant', 'course__auditoire__departement__section', 'course__auditoire__departement', 'course__auditoire')
    search_fields = ('assistant__nom', 'assistant__prenom', 'course__name')

    @admin.display(description='Cours (Auditoire - Département)')
    def course_details(self, obj):
        return f"{obj.course.name} ({obj.course.auditoire.name} - {obj.course.auditoire.departement.name})"


# --- Enregistrement des autres modèles --- #
admin.site.register(Calendrier)
